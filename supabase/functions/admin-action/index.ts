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
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Verify Caller Authentication
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
        if (authError || !user) throw new Error('Unauthorized')

        // 2. Verify System Admin Privileges
        // Must check the database, never trust the token metadata blindly for critical ops
        const { data: callerProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_system_admin')
            .eq('id', user.id)
            .single()

        if (profileError || !callerProfile?.is_system_admin) {
            console.error(`Unauthorized Admin Access Attempt by: ${user.id}`)
            throw new Error('Forbidden: You require System Admin privileges.')
        }

        // 3. Process Action
        const { action, targetId, payload } = await req.json()
        /* 
           Expected Payload:
           {
             action: 'UPDATE_PLAN' | 'UPDATE_STATUS' | 'DELETE_USER',
             targetId: 'uuid',
             payload: { plan: 'PRO' } or { status: 'BANNED' }
           }
        */

        if (!targetId) throw new Error('Target ID required')

        let result;

        console.log(`Admin Action: ${action} on ${targetId} by ${user.id}`);

        switch (action) {
            case 'UPDATE_PLAN':
                if (!payload?.plan) throw new Error('Plan is required')
                // Synchronize both DB profile and Auth Metadata
                const [dbUpdate, authUpdate] = await Promise.all([
                    supabaseAdmin
                        .from('profiles')
                        .update({ plan: payload.plan })
                        .eq('id', targetId),
                    supabaseAdmin.auth.admin.updateUserById(targetId, {
                        user_metadata: { plan: payload.plan }
                    })
                ])
                result = dbUpdate;
                if (authUpdate.error) console.error("Auth Metadata Update Failed:", authUpdate.error);
                break;

            case 'UPDATE_STATUS':
                if (!payload?.status) throw new Error('Status is required')
                result = await supabaseAdmin
                    .from('profiles')
                    .update({ status: payload.status })
                    .eq('id', targetId)
                    .select()
                break;

            case 'DELETE_USER':
                // Critical: Delete from Auth AND Profiles (Cascade usually handles profiles)
                // But using admin.deleteUser is cleaner
                result = await supabaseAdmin.auth.admin.deleteUser(targetId)
                break;

            default:
                throw new Error('Invalid Action')
        }

        if (result.error) throw result.error

        // 4. Log Audit (Redundant but safe)
        await supabaseAdmin.from('audit_logs').insert({
            actor_id: user.id,
            action: action,
            target_resource: 'profiles',
            target_id: targetId,
            details: payload,
            ip_address: 'edge-function'
        })

        return new Response(JSON.stringify({ success: true, data: result.data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
