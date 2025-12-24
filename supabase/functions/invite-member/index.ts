import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the Admin key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Verify Caller (Auth Header) - Prevent unauthorized invites
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
        if (authError || !user) throw new Error('Unauthorized: Invalid Token')

        // Parse request body
        const { email, role, name, planId, redirectTo } = await req.json()

        if (!email) {
            throw new Error('Email is required')
        }

        // 2. SECURITY HARDENING: Fetch Caller Profile & Enforce Limits
        const { data: callerProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, plan, is_system_admin')
            .eq('id', user.id)
            .single();

        if (profileError || !callerProfile) {
            throw new Error('Perfil do usuário não encontrado. Faça login novamente.');
        }

        // 3. ENFORCE PLAN LIMITS (Optional - can be expanded)
        // Example: Free users might have 0 invites, but for now we trust the UI limit 
        // essentially, but we MUST prevent them from creating PREMIUM users.

        // 4. PREVENT PRIVILEGE ESCALATION
        // CRITICAL: Force the invited user's plan to 'CONVIDADO'. 
        // Never trust 'planId' from the client body for invites.
        const SAFE_PLAN = 'CONVIDADO';

        // Validate Role (Prevent arbitrary strings)
        const allowedRoles = ['VIEWER', 'EDITOR', 'ADMIN']; // Team roles, not System Admin
        const safeRole = allowedRoles.includes(role) ? role : 'VIEWER';

        console.log(`Inviting user: ${email} as ${safeRole} (Plan: ${SAFE_PLAN}) by ${callerProfile.id}`);

        // Invite User via Admin API
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                name: name,
                plan: SAFE_PLAN, // HARDCODED SECURITY ENFORCEMENT
                is_invited_member: true, // Marker for frontend logic
                role: safeRole,
                invited_by: callerProfile.id
            },
            redirectTo: redirectTo || undefined
        })

        if (error) {
            console.error("Error inviting user:", error)
            throw error
        }

        // Returning the user data
        return new Response(
            JSON.stringify(data),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
