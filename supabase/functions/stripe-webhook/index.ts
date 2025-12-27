
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
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log("Stripe Webhook Handler Started")

serve(async (req: Request) => {
    if (req.method === "POST") {
        const signature = req.headers.get("Stripe-Signature")
        if (!signature) {
            return new Response("No signature", { status: 400 })
        }

        try {
            const body = await req.text()
            const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

            let event
            if (endpointSecret) {
                // Verify signature
                event = await stripe.webhooks.constructEventAsync(
                    body,
                    signature,
                    endpointSecret,
                    undefined,
                    cryptoProvider
                )
            } else {
                // Fallback for testing without signature verification (NOT RECOMMENDED for prod, but useful if env var missing initially)
                console.warn("⚠️ STRIPE_WEBHOOK_SECRET not found. Skipping signature verification.")
                event = JSON.parse(body)
            }

            console.log(`Processing event: ${event.type}`)

            if (event.type === "invoice.payment_succeeded") {
                const invoice = event.data.object as Stripe.Invoice

                // Logic for Subscriptions (Recurring)
                if (invoice.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

                    // Check for affiliate in Subscription Metadata (this is where we saved it!)
                    const affiliateCode = subscription.metadata?.affiliate || subscription.metadata?.flux_affiliate_id;

                    if (affiliateCode) {
                        console.log(`💰 Affiliate Sale Detected: ${affiliateCode}`)

                        // 1. Get Affiliate Details
                        const { data: affiliate } = await supabase
                            .from("affiliates")
                            .select("*")
                            .eq("code", affiliateCode)
                            .single()

                        if (affiliate) {
                            const totalAmount = invoice.amount_paid / 100 // Cents to Real
                            const commissionAmount = totalAmount * (affiliate.commission_rate / 100)

                            console.log(`Calculating Commission: R$${totalAmount} * ${affiliate.commission_rate}% = R$${commissionAmount}`)

                            // 2. Register Commission
                            const { error } = await supabase.from("commissions").insert({
                                affiliate_id: affiliate.id,
                                amount: commissionAmount,
                                sale_amount: totalAmount,
                                stripe_payment_id: invoice.payment_intent as string || invoice.id,
                                status: 'PAID'
                            })

                            if (error) console.error("Error saving commission:", error)
                            else console.log("✅ Commission saved successfully!")

                        } else {
                            console.warn(`Affiliate code '${affiliateCode}' found in metadata but not in database.`)
                        }
                    } else {
                        console.log("No affiliate associated with this subscription.")
                    }
                }
            }


            // Handle Subscription Updates (Interval Sync)
            if (['customer.subscription.created', 'customer.subscription.updated'].includes(event.type)) {
                const subscription = event.data.object as Stripe.Subscription;
                const price = subscription.items.data[0].price;
                const priceId = price.id;
                const interval = price.recurring?.interval || 'month';
                const status = subscription.status;
                const customerId = subscription.customer as string;

                console.log(`🔄 Processing Subscription Sync for ${customerId} (${status}, ${interval})`);

                // Find User by Stripe Customer ID
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .single();

                if (profile) {
                    await supabase.from("subscriptions").upsert({
                        id: subscription.id,
                        user_id: profile.id,
                        status: status,
                        price_id: priceId,
                        current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
                        interval: interval
                    });
                    console.log(`✅ Subscription synced for user ${profile.id}`);
                } else {
                    console.warn(`⚠️ User not found for Stripe Customer ${customerId} during subscription sync.`);
                }
            }

            return new Response(JSON.stringify({ received: true }), {
                headers: { "Content-Type": "application/json" },
            })
        } catch (err: any) {
            console.error(`Webhook Error: ${err.message}`)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }
    }

    return new Response("Method Not Allowed", { status: 405 })
})
