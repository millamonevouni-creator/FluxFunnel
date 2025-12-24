/// <reference path="../ide_fix.d.ts" />
import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { plan, operation } = await req.json()

        // Basic validation
        if (!plan) throw new Error("Plan data is required")

        console.log(`Processing ${operation} for plan: ${plan.id}`)

        let stripeProductId = plan.stripe_product_id
        let stripePriceIdMonthly = plan.stripe_price_id_monthly
        let stripePriceIdYearly = plan.stripe_price_id_yearly

        // 1. Manage Product
        const productData = {
            name: plan.label,
            description: plan.description || plan.customDescription || `Subscription for ${plan.label}`,
        }

        if (stripeProductId) {
            console.log(`Updating product: ${stripeProductId}`)
            await stripe.products.update(stripeProductId, productData)
        } else {
            console.log(`Creating new product for: ${plan.label}`)
            const product = await stripe.products.create(productData)
            stripeProductId = product.id
        }

        // 2. Manage Monthly Price
        if (plan.priceMonthly >= 0) {
            // Check if we need a new price (if ID missing or we want to support price changes)
            // For simplicity, we'll verify if the current price matches. If not, create new.
            // But since we can't easily check price amount without fetching, we might just assume
            // that if this function is called, we might need to check/update.
            // Optimization: Client could send flag if price changed. 
            // Better: Always create new price if amount changed, or if ID is missing.

            let currentPrice = null;
            if (stripePriceIdMonthly) {
                try {
                    currentPrice = await stripe.prices.retrieve(stripePriceIdMonthly);
                } catch (e) { console.log('Monthly price not found on Stripe, will create new.') }
            }

            const amountInCents = Math.round(plan.priceMonthly * 100);

            // Create new price if:
            // - No ID
            // - Price amount mismatch
            // - Current price is archived
            if (!currentPrice || currentPrice.unit_amount !== amountInCents || !currentPrice.active) {
                console.log(`Creating/Updating Monthly Price: ${plan.priceMonthly}`)
                const newPrice = await stripe.prices.create({
                    product: stripeProductId,
                    unit_amount: amountInCents,
                    currency: 'brl',
                    recurring: { interval: 'month' },
                    active: true
                });
                stripePriceIdMonthly = newPrice.id;
            }
        }

        // 3. Manage Yearly Price
        if (plan.priceYearly >= 0) {
            let currentPrice = null;
            if (stripePriceIdYearly) {
                try {
                    currentPrice = await stripe.prices.retrieve(stripePriceIdYearly);
                } catch (e) { console.log('Yearly price not found on Stripe, will create new.') }
            }

            const amountInCents = Math.round(plan.priceYearly * 100);

            if (!currentPrice || currentPrice.unit_amount !== amountInCents || !currentPrice.active) {
                console.log(`Creating/Updating Yearly Price: ${plan.priceYearly}`)
                const newPrice = await stripe.prices.create({
                    product: stripeProductId,
                    unit_amount: amountInCents,
                    currency: 'brl',
                    recurring: { interval: 'year' },
                    active: true
                });
                stripePriceIdYearly = newPrice.id;
            }
        }

        // 4. Update Supabase
        // We use the service role client to bypass RLS if needed, or ensuring we can write to 'plans'

        // Map frontend CamelCase to DB SnakeCase
        const updates = {
            id: plan.id,
            label: plan.label,
            description: plan.description,
            price_monthly: plan.priceMonthly,
            price_yearly: plan.priceYearly,
            project_limit: plan.projectLimit,
            node_limit: plan.nodeLimit,
            team_limit: plan.teamLimit,
            features: plan.features,
            is_popular: plan.isPopular,
            order: plan.order,
            stripe_product_id: stripeProductId,
            stripe_price_id_monthly: stripePriceIdMonthly,
            stripe_price_id_yearly: stripePriceIdYearly,
            is_hidden: plan.is_hidden
        };

        const { data, error } = await supabase
            .from('plans')
            .upsert(updates)
            .select()
            .single()

        if (error) {
            console.error('Supabase update error:', error)
            throw error
        }

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

    } catch (error: any) {
        console.error("Manage Plan Error:", error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
