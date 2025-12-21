const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Manually load .env.local since dotenv might not find it if cwd varies
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing environment variables! Ensure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testInvite(email) {
    console.log(`Testing invite (Magic Link/OTP) for: ${email}`);
    console.log(`Using redirect URL: https://fluxfunnel.fun`);

    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: 'https://fluxfunnel.fun'
        }
    });

    if (error) {
        console.error("Error sending invite/magic link:", error);
        console.error("Details:", JSON.stringify(error, null, 2));
    } else {
        console.log("Invite/Magic link sent successfully!");
        console.log("Data:", JSON.stringify(data, null, 2));
    }
}

const targetEmail = process.argv[2] || 'millamon.evouni@gmail.com';
testInvite(targetEmail);
