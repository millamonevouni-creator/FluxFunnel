import { serve } from "std/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    return new Response(JSON.stringify({
        success: true,
        message: "Hello World from manage-plan",
        env_check: {
            has_stripe_key: !!Deno.env.get("STRIPE_SECRET_KEY"),
            has_supabase_url: !!Deno.env.get("SUPABASE_URL")
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
})
