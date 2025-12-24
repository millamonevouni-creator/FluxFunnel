-- CRITICAL FIX for Payment System
-- 2025-12-24
-- Adds missing table and column required by 'stripe-webhook' and 'create-checkout-session'
-- 1. Add Stripe Customer ID to Profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;
-- 2. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id text PRIMARY KEY,
    -- Stripe Subscription ID (sub_...)
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status text NOT NULL,
    -- active, canceling, past_due, etc.
    price_id text,
    -- price_...
    current_period_end timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
-- 3. Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- 4. RLS Policies for Subscriptions
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions FOR
SELECT USING (auth.uid() = user_id);
-- Service Role (Edge Functions) has full access by default, but we can be explicit if needed
-- (Supabase Service Key bypasses RLS)
-- 5. Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);