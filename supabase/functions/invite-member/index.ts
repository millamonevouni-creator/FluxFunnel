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

        // Parse request body
        const { email, role, name, planId, redirectTo } = await req.json()

        if (!email) {
            throw new Error('Email is required')
        }

        console.log(`Inviting user: ${email}, Plan: ${planId}, Name: ${name}`)

        // Invite User via Admin API
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                name: name,
                plan: planId || 'CONVIDADO', // Force plan in metadata
                is_invited_member: true,
                role: role // Optional: store role in metadata too
            },
            redirectTo: redirectTo || undefined
        })

        if (error) {
            console.error("Error inviting user:", error)
            throw error
        }

        // Optional: Synchronize with team_members table immediately if needed, 
        // but the trigger on "profiles" (which gets created when user accepts?) 
        // ACTUALLY: inviteUserByEmail creates the user in `auth.users` immediately with `invited_at`. 
        // The profile might not exist until they sign in OR we might relying on trigger.
        // The previous trigger `handle_new_team_member` listens on `profiles`.
        // If we want to ensure `team_members` row exists:

        // We should ensure the team_members row exists so the trigger can link it later.
        // However, the caller (frontend) usually inserts into team_members too?
        // Let's rely on the frontend to manage `team_members` for now to avoid permission complexities 
        // unless we pass the owner_id to the function.

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
