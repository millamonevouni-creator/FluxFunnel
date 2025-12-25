import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2022-11-15', httpClient: Stripe.createFetchHttpClient(), }) : null;

        const { action, deleteSupabaseIds, deleteStripeIds } = await req.json()

        // 1. Get DB Plans
        const { data: profiles } = await supabase.from('profiles').select('plan')
        const usageCount: Record<string, number> = {}
        profiles?.forEach((p: any) => {
            usageCount[p.plan] = (usageCount[p.plan] || 0) + 1
        })
        const { data: plans } = await supabase.from('plans').select('*').order('created_at', { ascending: false })

        // 2. Get Stripe Products
        let stripeProducts = [];
        if (stripe) {
            const products = await stripe.products.list({ limit: 100, active: true });
            stripeProducts = products.data;
        }

        if (action === 'analyze') {
            const supabaseReport = plans?.map((p: any) => ({
                id: p.id,
                label: p.label,
                usage: usageCount[p.id] || 0,
                is_system_default: ['FREE', 'PRO', 'PREMIUM', 'CONVIDADO'].includes(p.id) || p.id === 'PREMIUM' || p.id === 'PRO',
                stripe_product_id: p.stripe_product_id,
                created_at: p.created_at
            }))

            const stripeReport = stripeProducts.map((p: any) => {
                const linkedPlan = plans?.find((sp: any) => sp.stripe_product_id === p.id);
                return {
                    id: p.id,
                    name: p.name,
                    active: p.active,
                    created: new Date(p.created * 1000).toISOString(),
                    is_orphaned: !linkedPlan, // Exists in Stripe but not in Supabase Plans
                    linked_plan_label: linkedPlan?.label
                }
            }).filter((p: any) => p.is_orphaned); // Only interesting ones

            return new Response(JSON.stringify({ supabaseReport, stripeReport, hasStripe: !!stripe }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (action === 'auto_cleanup') {
            // Re-run analysis logic internally
            const supabaseReport = plans?.map((p: any) => ({
                id: p.id,
                label: p.label,
                usage: usageCount[p.id] || 0,
                is_orphaned: !['FREE', 'PRO', 'PREMIUM', 'CONVIDADO'].includes(p.id) && usageCount[p.id] === undefined // Safe logic: Not system default AND zero usage
            })).filter((p: any) => p.is_orphaned);

            const stripeReport = stripeProducts.map((p: any) => {
                const linkedPlan = plans?.find((sp: any) => sp.stripe_product_id === p.id);
                return {
                    id: p.id,
                    is_orphaned: !linkedPlan && p.active // Orphaned and still active
                }
            }).filter((p: any) => p.is_orphaned);

            const deleteSupabaseIds = supabaseReport?.map((p: any) => p.id) || [];
            const deleteStripeIds = stripeReport.map((p: any) => p.id);

            const results = { supabase: 0, stripe: 0, errors: [] as string[], deleted_supabase: deleteSupabaseIds, archived_stripe: deleteStripeIds };

            // Execute Deletion
            if (deleteSupabaseIds.length) {
                const { error } = await supabase.from('plans').delete().in('id', deleteSupabaseIds)
                if (error) results.errors.push(`Supabase Delete Error: ${error.message}`);
                else results.supabase = deleteSupabaseIds.length;
            }

            if (stripe && deleteStripeIds.length) {
                for (const pid of deleteStripeIds) {
                    try {
                        await stripe.products.update(pid, { active: false });
                        results.stripe++;
                    } catch (e: any) {
                        results.errors.push(`Stripe Error (${pid}): ${e.message}`);
                    }
                }
            }

            return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const results = { supabase: 0, stripe: 0, errors: [] as string[] };

        if (action === 'execute') {
            // Delete Supabase Plans
            if (deleteSupabaseIds?.length) {
                const { error } = await supabase.from('plans').delete().in('id', deleteSupabaseIds)
                if (error) results.errors.push(`Supabase Delete Error: ${error.message}`);
                else results.supabase = deleteSupabaseIds.length;
            }

            // Archive Stripe Products (Deleting is hard if they have prices/usage, archiving is safer)
            if (stripe && deleteStripeIds?.length) {
                for (const pid of deleteStripeIds) {
                    try {
                        await stripe.products.update(pid, { active: false });
                        results.stripe++;
                    } catch (e: any) {
                        results.errors.push(`Stripe Error (${pid}): ${e.message}`);
                    }
                }
            }
            return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: corsHeaders })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
    }
})
