/// <reference path="../ide_fix.d.ts" />
import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"


const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req: Request) => {
    const signature = req.headers.get("Stripe-Signature")
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

    if (!signature || !webhookSecret) {
        return new Response("Missing signature or secret", { status: 400 })
    }

    const body = await req.text()
    let event

    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret,
            undefined,
            cryptoProvider
        )
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return new Response(err.message, { status: 400 })
    }

    console.log(`Received event: ${event.type}`)

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event.data.object, supabase)
                break
            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object, supabase)
                break
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object, supabase)
                break
        }
    } catch (error: any) {
        console.error(`Error processing event: ${error.message}`)
        return new Response(`Error processing event: ${error.message}`, { status: 500 })
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
    })
})

async function handleCheckoutCompleted(session: any, supabase: any) {
    const customerId = session.customer
    const subscriptionId = session.subscription
    const userId = session.client_reference_id

    if (!userId) {
        console.warn("No user_id in session client_reference_id")
        return;
    }

    // Update profile with stripe_customer_id
    await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId)
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
    const status = subscription.status
    const priceId = subscription.items.data[0].price.id

    // Find user by customer_id
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", subscription.customer)
        .single()

    if (profiles) {
        // Upsert subscription table
        await supabase.from("subscriptions").upsert({
            id: subscription.id,
            user_id: profiles.id,
            status: status,
            price_id: priceId,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })

        if (['active', 'trialing'].includes(status)) {
            // Dynamic Plan Lookup
            const { data: planData } = await supabase
                .from('plans')
                .select('id')
                .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
                .single();

            let planId = planData?.id;

            if (!planId) {
                // Temporary Fallback Map for existing env vars
                const LEGACY_MAP: Record<string, string> = {
                    'price_1SgskMQXyRm8d3nvfTwRIFcP': 'PRO',
                    'price_1SgskWQXyRm8d3nvmqvpaevX': 'PRO',
                    'price_1SgskMQXyRm8d3nv9j7KeMqh': 'PREMIUM',
                    'price_1SgskZQXyRm8d3nveCCv6TQG': 'PREMIUM',
                };
                if (LEGACY_MAP[priceId]) planId = LEGACY_MAP[priceId];
                else if (priceId.includes('pro')) planId = 'PRO';
                else if (priceId.includes('premium')) planId = 'PREMIUM';
            }

            if (planId) {
                console.log(`Mapping Price ${priceId} to Plan ${planId}`);
                await supabase.from("profiles").update({ plan: planId }).eq("id", profiles.id)
            } else {
                console.warn(`Unknown Price ID: ${priceId} for User: ${profiles.id}`);
            }
        }
    }
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", subscription.customer)
        .single()

    if (profiles) {
        await supabase.from("subscriptions").update({ status: 'canceled' }).eq("id", subscription.id)
        await supabase.from("profiles").update({ plan: 'FREE' }).eq("id", profiles.id)
    }
}
