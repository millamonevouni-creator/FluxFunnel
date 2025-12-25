-- Migration: Optimize RLS Policies V3 (Final Cleanup)
-- Description: Eliminates remaining 'multiple_permissive_policies' by splitting Admin ALL policies and dropping hidden duplicates.
-- ==============================================================================
-- 1. CLEANUP HIDDEN DUPLICATES
-- Found via Linter: "Feedbacks Select", "Feedbacks Insert", "Feedbacks Delete"
-- ==============================================================================
DROP POLICY IF EXISTS "Feedbacks Select" ON feedbacks;
DROP POLICY IF EXISTS "Feedbacks Insert" ON feedbacks;
DROP POLICY IF EXISTS "Feedbacks Delete" ON feedbacks;
-- ==============================================================================
-- 2. PLANS TABLE REFACTOR
-- Issue: "Admins can manage plans" (ALL) overlaps with "Plans Viewable by Everyone" (SELECT) for admins.
-- Fix: Restrict Admin policy to MODIFICATION events only.
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can manage plans" ON plans;
-- Admin Modification Policy (Insert, Update, Delete)
-- Select is covered by "Plans Viewable by Everyone"
CREATE POLICY "Admins can modify plans" ON plans FOR
INSERT TO authenticated WITH CHECK (
        (
            select is_admin()
        )
    );
CREATE POLICY "Admins can update plans" ON plans FOR
UPDATE TO authenticated USING (
        (
            select is_admin()
        )
    ) WITH CHECK (
        (
            select is_admin()
        )
    );
CREATE POLICY "Admins can delete plans" ON plans FOR DELETE TO authenticated USING (
    (
        select is_admin()
    )
);
-- ==============================================================================
-- 3. SYSTEM_CONFIG TABLE REFACTOR
-- Issue: "Admins can manage system config" (ALL) overlaps with Public SELECT.
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can manage system config" ON system_config;
CREATE POLICY "Admins can modify system config" ON system_config FOR
INSERT TO authenticated WITH CHECK (
        (
            select is_admin()
        )
    );
CREATE POLICY "Admins can update system config" ON system_config FOR
UPDATE TO authenticated USING (
        (
            select is_admin()
        )
    ) WITH CHECK (
        (
            select is_admin()
        )
    );
CREATE POLICY "Admins can delete system config" ON system_config FOR DELETE TO authenticated USING (
    (
        select is_admin()
    )
);
-- ==============================================================================
-- 4. FEEDBACKS TABLE REFACTOR
-- Issue: "Admins can manage feedbacks" (ALL) overlaps with Public SELECT.
-- ==============================================================================
DROP POLICY IF EXISTS "Admins can manage feedbacks" ON feedbacks;
-- Ensure Admins can Moderate (Update/Delete/Insert)
CREATE POLICY "Admins can modify feedbacks" ON feedbacks FOR
INSERT TO authenticated WITH CHECK (
        (
            select is_admin()
        )
    );
CREATE POLICY "Admins can update feedbacks" ON feedbacks FOR
UPDATE TO authenticated USING (
        (
            select is_admin()
        )
    ) WITH CHECK (
        (
            select is_admin()
        )
    );
CREATE POLICY "Admins can delete feedbacks" ON feedbacks FOR DELETE TO authenticated USING (
    (
        select is_admin()
    )
);
-- Note: "Authenticated users can insert feedbacks" and "Users can update own feedbacks" 
-- created in V2 are specific and don't overlap with these Admin ones for the same user 
-- UNLESS the user is an admin.
-- If an Admin inserts, they match "Admins can modify" AND "Authenticated users can insert".
-- This is still technically 'multiple permissive' for INSERTS by Admins, but unavoidable if we want separate logic.
-- However, since "Authenticated users can insert" covers ALL authenticated (including admins),
-- we technically don't need "Admins can modify feedbacks" for INSERT if the other one exists.
-- But "Authenticated..." enforces (uid = author_id).
-- "Admins..." allows creating for others? Probably not needed often.
-- Let's keep it simple. If Linter complains about Admin Insert overlap, we can drop Admin Insert.
-- For now, splitting SELECT out solves the main volume of warnings.