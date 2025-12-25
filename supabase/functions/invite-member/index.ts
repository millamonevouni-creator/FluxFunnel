import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req: Request) => {
    // 0. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Verify Request
        const { email, role, name, planId, redirectTo } = await req.json();
        if (!email) throw new Error("Email is required");

        // 2. Auth Check (Caller must be logged in)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Authorization header');
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) throw new Error('Invalid Token');

        // 3. User Invite via Supabase Admin API
        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
                name: name || 'Novo Usuário',
                plan: planId || 'CONVIDADO', // Force plan in metadata
                role: role || 'editor'
            },
            redirectTo: redirectTo || 'http://localhost:5173'
        });

        if (inviteError) throw inviteError;

        // 4. (Optional) Custom Email via Resend if needed
        // For now, Supabase handles it.

        return new Response(
            JSON.stringify({ message: "Invite sent successfully", user: inviteData.user }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
