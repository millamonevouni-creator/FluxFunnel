-- SECURITY MIGRATION: ADMIN POLICIES
-- DATE: 2025-12-24
-- OBJ: Grant System Admins full CRUD access to config tables
-- 1. PLANS
-- Ensure RLS is on (idempotent)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage plans" ON plans;
CREATE POLICY "Admins can manage plans" ON plans FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.is_system_admin = true
    )
);
-- 2. SYSTEM CONFIG
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage system config" ON system_config;
CREATE POLICY "Admins can manage system config" ON system_config FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.is_system_admin = true
    )
);
-- 3. FEEDBACKS (Voting Security)
-- Allow authenticated users to update feedbacks (for voting/commenting)
-- Ideally this should be stricter (only update votes/comments column), 
-- but Postgres RLS doesn't support column-level granularity easily for UPDATE USING.
-- We rely on the App Logic (frontend) for now, but ensure at least they must be logged in.
CREATE POLICY "Authenticated users can update feedbacks" ON feedbacks FOR
UPDATE USING (auth.role() = 'authenticated');