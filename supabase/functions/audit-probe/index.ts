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

        const { query, mode } = await req.json()
        const client = new Client(dbUrl)
        await client.connect()

        let result;
        if (mode === 'schema') {
            const schemaQuery = `
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'profiles';
        `;
            const q = await client.queryObject(schemaQuery);
            result = q.rows;
        } else {
            // Fallback or generic execution
            const q = await client.queryObject(query);
            result = q.rows;
        }

        await client.end()
        return new Response(JSON.stringify({ success: true, columns: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
    }
})
