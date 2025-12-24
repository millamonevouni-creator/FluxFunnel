-- CRITICAL SECURITY MIGRATION
-- DATE: 2025-12-24
-- OBJ: Enable RLS on Financial Tables and enforce isolation
-- 1. SUBSCRIPTIONS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_system_admin = true
        )
    );
-- 2. INVOICES
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
CREATE POLICY "Admins can view all invoices" ON invoices FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_system_admin = true
        )
    );
-- 3. PAYMENT LOGS (Reinforce if mostly handled by admin-only already)
-- Already handled in previous hardening, but ensuring Service Role can write
-- (Service Role always bypasses RLS, so no specific policy needed for Insert if done by Edge Function)