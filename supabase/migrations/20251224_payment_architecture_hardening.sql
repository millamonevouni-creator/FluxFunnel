-- MIGRATION: 20251224_payment_architecture_hardening.sql
-- OBJECTIVE: Add Financial Logging and harden Invoices.
-- 1. PAYMENT LOGS TABLE (New)
-- Stores raw event data for audit and debugging (Success & Failure).
create table if not exists payment_logs (
    id uuid default gen_random_uuid() primary key,
    event_id text not null,
    -- Stripe Event ID to redundant check
    event_type text not null,
    -- invoice.payment_succeeded, invoice.payment_failed, etc.
    stripe_customer_id text,
    amount numeric,
    -- Amount in cents or unit
    currency text,
    status text,
    payload jsonb,
    -- Simplified payload
    error_message text,
    created_at timestamptz default now()
);
-- Idempotency Index: Prevent duplicate logging of the same Stripe Event
create unique index if not exists idx_payment_logs_event_id on payment_logs (event_id);
-- 2. INVOICES UPDATES (If needed)
-- Ensure status column can handle 'void', 'uncollectible'
-- (Already text, so it's fine).
-- 3. RLS Policies for Logs (Admin Only)
alter table payment_logs enable row level security;
create policy "Admins can view payment logs" on payment_logs for
select using (
        exists (
            select 1
            from profiles
            where profiles.id = auth.uid()
                and profiles.is_system_admin = true
        )
    );
-- No one can insert/update logs from client side. Only Service Role (Edge Function).