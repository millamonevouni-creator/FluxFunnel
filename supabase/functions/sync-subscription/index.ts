import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!stripeKey || !supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

        const { sessionId } = await req.json();

        if (!sessionId) {
            return new Response(JSON.stringify({ error: "Missing sessionId" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log(`Syncing Subscription for Session: ${sessionId}`);

        // 1. Retrieve Session
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) {
            return new Response(JSON.stringify({ error: "Session not found" }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userId = session.client_reference_id;

        // 2. Retrieve Subscription for details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const status = subscription.status;
        const priceId = subscription.items.data[0].price.id;

        // 3. Find User
        // Priority 1: Client Reference ID (Passed during creation)
        let profile = null;
        if (userId) {
            const { data: p } = await supabaseAdmin.from('profiles').select('id, email').eq('id', userId).single();
            profile = p;
        }

        // Priority 2: Stripe Customer ID
        if (!profile) {
            const { data: p } = await supabaseAdmin.from('profiles').select('id, email').eq('stripe_customer_id', customerId).maybeSingle();
            profile = p;
        }

        // Priority 3: Email Fallback
        if (!profile && session.customer_details?.email) {
            const { data: profileByEmail } = await supabaseAdmin.from('profiles').select('id, email').eq('email', session.customer_details.email).maybeSingle();
            if (profileByEmail) {
                profile = profileByEmail;
                // Link now!
                await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', profile.id);
            }
        }

        if (!profile) {
            return new Response(JSON.stringify({ error: "User profile not found for this customer" }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 4. Determine Plan
        // Dynamic Plan Lookup
        const { data: planData } = await supabaseAdmin
            .from('plans')
            .select('id')
            .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
            .single();

        let planId = planData?.id;

        if (!planId) {
            // Temporary Fallback Map (Same as Webhook)
            const LEGACY_MAP: Record<string, string> = {
                'price_1SgskMQXyRm8d3nvfTwRIFcP': 'PRO',
                'price_1SgskWQXyRm8d3nvmqvpaevX': 'PRO',
                'price_1SgskMQXyRm8d3nv9j7KeMqh': 'PREMIUM',
                'price_1SgskZQXyRm8d3nveCCv6TQG': 'PREMIUM',
                'price_1Sgtq7QXyRm8d3nv22SHxOmY': 'PRO', // FIXED
            };
            if (LEGACY_MAP[priceId]) planId = LEGACY_MAP[priceId];
            else if (priceId.includes('pro')) planId = 'PRO';
            else if (priceId.includes('premium')) planId = 'PREMIUM';
        }

        if (planId && ['active', 'trialing'].includes(status)) {
            console.log(`Updating User ${profile.id} to Plan ${planId}`);

            // Update Profile
            await supabaseAdmin.from('profiles').update({
                plan: planId,
                stripe_customer_id: customerId
            }).eq('id', profile.id);

            // Upsert Subscription
            const interval = subscription.items.data[0].price.recurring?.interval || 'month';
            await supabaseAdmin.from("subscriptions").upsert({
                id: subscription.id,
                user_id: profile.id,
                status: status,
                price_id: priceId,
                current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
                interval: interval // Add interval
            });

            return new Response(JSON.stringify({ success: true, plan: planId, user_id: profile.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } else {
            return new Response(JSON.stringify({ success: false, error: "Plan not identified or subscription incomplete" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

    } catch (error: any) {
        console.error("Sync Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
