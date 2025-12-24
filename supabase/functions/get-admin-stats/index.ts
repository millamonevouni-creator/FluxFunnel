import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Verify User (Auth Header)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')

        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
        if (authError || !user) throw new Error('Invalid Token')

        // 2. Verify Admin Status
        const { data: profile } = await supabase.from('profiles').select('is_system_admin').eq('id', user.id).single()
        if (!profile || !profile.is_system_admin) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: corsHeaders })
        }

        // 3. Fetch Stats (Using Service Role - Bypasses RLS)
        // Active Users
        const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
        const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

        // MRR
        const { data: subs } = await supabase.from('subscriptions').select('price_id, status').in('status', ['active', 'trialing']);
        const { data: plans } = await supabase.from('plans').select('stripe_price_id_monthly, stripe_price_id_yearly, price_monthly, price_yearly');

        let mrr = 0;
        if (subs && plans) {
            subs.forEach((s: any) => {
                const plan = plans.find((p: any) => p.stripe_price_id_monthly === s.price_id || p.stripe_price_id_yearly === s.price_id);
                if (plan) {
                    if (plan.stripe_price_id_monthly === s.price_id) mrr += (plan.price_monthly || 0);
                    else if (plan.stripe_price_id_yearly === s.price_id) mrr += ((plan.price_yearly || 0) / 12);
                }
            });
        }

        return new Response(
            JSON.stringify({
                mrr,
                activeUsers: activeUsers || 0,
                totalUsers: totalUsers || 0,
                health: 100
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
