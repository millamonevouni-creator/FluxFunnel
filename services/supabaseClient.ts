
import { createClient } from '@supabase/supabase-js';

// Configuration for Supabase Client
// Keys are loaded from the .env file (Vite requires VITE_ prefix)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const isOffline = !SUPABASE_URL || !SUPABASE_KEY || SUPABASE_KEY.includes('placeholder');

// Check for missing keys to alert the developer
if (isOffline) {
    console.warn(
        "⚠️ Supabase credentials missing! Please check your .env.local file.\n" +
        "Make sure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set.\n" +
        "The app is running in Offline/Demo mode."
    );
}

// Initialize client
export const supabase = createClient(
    SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_KEY || 'placeholder-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: !isOffline, // Disable to prevent fetch errors loop
            detectSessionInUrl: !isOffline, // Disable to prevent fetch errors on load
        }
    }
);
