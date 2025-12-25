-- CRITICAL FIX: Payment Logs Table
-- Required for Stripe Webhook Idempotency
-- 2025-12-25
CREATE TABLE IF NOT EXISTS public.payment_logs (
    event_id text PRIMARY KEY,
    event_type text NOT NULL,
    stripe_customer_id text,
    amount integer,
    currency text,
    status text,
    payload jsonb,
    error_message text,
    created_at timestamptz DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
-- Policy: Only Admins can view logs
DROP POLICY IF EXISTS "Admins view logs" ON public.payment_logs;
CREATE POLICY "Admins view logs" ON public.payment_logs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_system_admin = true
        )
    );
-- Policy: Service Role (Edge Functions) has full access (Implicit in Supabase, but good to note)
-- No explicit policy needed for service_role as it bypasses RLS.