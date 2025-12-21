import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use Anon Key instead of Service Role Key for client-side emulation
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

async function testInvite(email: string) {
    console.log(`Testing invite (Magic Link/OTP) for: ${email}`);

    // Simulate what api.team.invite does: signInWithOtp
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: 'http://localhost:5173' // Or whatever origin is set
        }
    });

    if (error) {
        console.error("Error sending invite/magic link:", error);
    } else {
        console.log("Invite/Magic link sent successfully:", data);
    }
}

const targetEmail = process.argv[2] || 'akanestorepayments@gmail.com';
testInvite(targetEmail);
