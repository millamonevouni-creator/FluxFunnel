// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    // 0. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        // DEBUG: Check environment variables
        if (!supabaseUrl || !supabaseServiceRoleKey) {
            console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
            throw new Error("Server configuration error: Missing environment variables.");
        }

        // Initialize Admin Client
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            }
        });

        // 1. Verify Request Body
        const { email, role, name, planId, redirectTo } = await req.json();
        if (!email) throw new Error("Email is required");

        console.log(`Inviting user: ${email}, role: ${role}, plan: ${planId}`);

        // 2. Auth Check (Caller must be logged in)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error("Auth Error:", authError);
            throw new Error('Unauthorized: Invalid Token');
        }

        // 3. User Invite via Supabase Admin API
        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
                name: name || 'Novo Usuário',
                plan: planId || 'CONVIDADO',
                role: role || 'editor',
                invited_by: user.id
            },
            redirectTo: redirectTo || 'http://localhost:5173'
        });

        if (inviteError) {
            console.error("Invite Error Details:", inviteError);
            // Pass the exact status code from Supabase if available, else 400
            const status = inviteError.status || 400;
            throw new Error(`Invite Failed: ${inviteError.message} (Status: ${status})`);
        }

        console.log("Invite success:", inviteData);

        return new Response(
            JSON.stringify({ message: "Invite sent successfully", user: inviteData.user }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("Edge Function Fatal Error:", error);
        return new Response(
            JSON.stringify({
                error: error.message,
                details: error.stack,
                // Include specific error code if available
                code: error.code || 'UNKNOWN'
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
