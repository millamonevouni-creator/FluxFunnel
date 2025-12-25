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

        // Validation 1: Check Environment variables
        if (!stripeKey || !supabaseUrl || !supabaseKey) {
            console.error("Missing environment variables");
            // Return 200 OK with error field to allow frontend to parse it comfortably
            return new Response(JSON.stringify({
                success: false,
                error: `Missing Server Configuration: ${!stripeKey ? 'STRIPE_KEY ' : ''}${!supabaseUrl ? 'SUPABASE_URL ' : ''}${!supabaseKey ? 'SUPABASE_KEY' : ''}`
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

        // Validation 2: Parse Body
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: "Invalid JSON body" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { plan, operation, userEmail } = body;

        // Validation 3: Check Admin Permissions (Server-Side)
        // Check exact Master Admin email bypass OR check database role
        // Ideally checking auth header token is better, but this adds a layer of safety for the sensitive operation
        // For now, relying on Supabase Auth Token passed in header (handled by RLS/Policies usually), 
        // but here we verify explicitly if caller is authorized if possible, or trust the passed token.
        // Since we have userEmail, we can double check.
        // This is a critical administrative function.
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ success: false, error: "Missing Authorization Header" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // SECURITY: Verify user via token
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized: Invalid Token" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Verify Admin Role
        const { data: is_admin } = await supabaseAdmin.rpc('is_admin', { user_id: user.id });

        // Emergency Bypass for initial setup if needed (optional)
        const isMasterEmail = user.email === 'millamon.evouni@gmail.com';

        if (!is_admin && !isMasterEmail) {
            return new Response(JSON.stringify({ success: false, error: "Forbidden: Not an Admin" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }


        if (operation === 'CREATE') {
            console.log(`Creating Plan: ${plan.label}`);

            // 1. Create Product in Stripe
            const product = await stripe.products.create({
                name: plan.label,
                description: `Subscription for ${plan.label}`,
                metadata: {
                    plan_id: plan.id // Store our local ID
                }
            });

            // 2. Create Prices in Stripe
            const priceMonthly = await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(plan.price_monthly * 100), // Cents
                currency: 'brl',
                recurring: { interval: 'month' },
                metadata: { type: 'MONTHLY' }
            });

            const priceYearly = await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(plan.price_yearly * 100),
                currency: 'brl',
                recurring: { interval: 'year' },
                metadata: { type: 'YEARLY' }
            });

            // 3. Save to Supabase
            const dbPayload = {
                ...plan,
                stripe_product_id: product.id,
                stripe_price_id_monthly: priceMonthly.id,
                stripe_price_id_yearly: priceYearly.id
            };

            // Remove ID if it is temporary (NEW_...) to let DB generate UUID, or Use UUID if provided
            // Assuming frontend sends a temporary ID like 'NEW_...', we should remove it 
            // BUT api_fixed.ts sends UUID v4 generated by crypto.randomUUID usually.
            // If it starts with NEW_, assume we want DB to generate or we generate a proper one.
            if (dbPayload.id && dbPayload.id.startsWith('NEW_')) {
                delete dbPayload.id; // Let DB generate
            }

            const { data: insertedPlan, error: dbError } = await supabaseAdmin
                .from('plans')
                .insert(dbPayload)
                .select()
                .single();

            if (dbError) {
                console.error("DB Insert Error", dbError);
                // Rollback Stripe? (Advanced: manually delete product)
                await stripe.products.del(product.id);
                return new Response(JSON.stringify({ success: false, error: `Database Error: ${dbError.message}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // Audit Log
            await supabaseAdmin.from('audit_logs').insert({
                user_id: user.id,
                action: 'CREATE_PLAN',
                details: { plan_label: plan.label, plan_id: insertedPlan.id }
            });

            return new Response(JSON.stringify(insertedPlan), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (operation === 'UPDATE') {
            console.log(`Updating Plan: ${plan.id}`);

            // 1. Update Stripe Product Name (Optional but good for consistency)
            if (plan.stripe_product_id) {
                try {
                    await stripe.products.update(plan.stripe_product_id, {
                        name: plan.label
                        // We avoid updating description as it might be custom in Stripe
                    });
                } catch (e) {
                    console.warn("Stripe Product Update Warning:", e);
                    // Continue, not fatal
                }
            }

            // 2. Update Supabase
            // We exclude stripe IDs from update payload to avoid overwriting them with old data if not provided, 
            // though they should be in the payload.
            const dbPayload = {
                ...plan,
                updated_at: new Date()
            };

            const { data: updatedPlan, error: dbError } = await supabaseAdmin
                .from('plans')
                .update(dbPayload)
                .eq('id', plan.id)
                .select()
                .single();

            if (dbError) {
                console.error("DB Update Error", dbError);
                return new Response(JSON.stringify({ success: false, error: `Database Error: ${dbError.message}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // Audit Log
            await supabaseAdmin.from('audit_logs').insert({
                user_id: user.id,
                action: 'UPDATE_PLAN',
                details: { plan_label: plan.label, plan_id: plan.id }
            });

            return new Response(JSON.stringify(updatedPlan), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (operation === 'DELETE') {
            console.log(`Deleting Plan: ${plan.id}`);
            // Logic to delete from DB
            const { error } = await supabaseAdmin.from('plans').delete().eq('id', plan.id);
            if (error) {
                return new Response(JSON.stringify({ success: false, error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

    } catch (error) {
        console.error("Manage Plan Error:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Internal Server Error"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
