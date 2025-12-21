import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing environment variables!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testInvite(email: string) {
    console.log(`Testing invite for: ${email}`);
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: 'http://localhost:5175'
    });

    if (error) {
        console.error("Error inviting user:", error);
    } else {
        console.log("User invited successfully:", data.user.id);
    }
}

const targetEmail = process.argv[2] || 'akanestorepayments@gmail.com';
testInvite(targetEmail);
