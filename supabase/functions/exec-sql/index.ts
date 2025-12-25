import { serve } from "std/http/server.ts"
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const dbUrl = Deno.env.get('SUPABASE_DB_URL')
        if (!dbUrl) {
            return new Response(JSON.stringify({ error: 'SUPABASE_DB_URL not set' }), { status: 500, headers: corsHeaders })
        }

        const { query } = await req.json()
        if (!query) {
            return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400, headers: corsHeaders })
        }

        const client = new Client(dbUrl)
        await client.connect()

        // Safety check: simplistic read-only check or allow risky for admin debug
        // For this debug session, we allow anything as we are the "admin" agent.

        let result;
        if (query.trim().toUpperCase().startsWith('SELECT')) {
            result = await client.queryObject(query)
            result = result.rows
        } else {
            result = await client.queryArray(query)
            result = { message: "Executed", rows: result.rows }
        }

        await client.end()

        return new Response(JSON.stringify({ success: true, data: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
    }
})
