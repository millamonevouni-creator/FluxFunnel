-- Migration: Optimize RLS Policies V4 (Consolidation)
-- Description: Consolidates overlapping INSERT/UPDATE policies for Feedbacks to resolve remaining linter warnings.
-- ==============================================================================
-- FEEDBACKS TABLE CONSOLIDATION
-- Issues: "Multiple Permissive Policies" for INSERT and UPDATE (Admin vs User overlap).
-- Solution: Merge into single policies with OR logic.
-- ==============================================================================
-- 1. DROP EXISTING OVERLAPPING POLICIES
DROP POLICY IF EXISTS "Admins can modify feedbacks" ON feedbacks;
-- Insert
DROP POLICY IF EXISTS "Authenticated users can insert feedbacks" ON feedbacks;
-- Insert
DROP POLICY IF EXISTS "Admins can update feedbacks" ON feedbacks;
-- Update
DROP POLICY IF EXISTS "Users can update own feedbacks" ON feedbacks;
-- Update
-- 2. CREATE CONSOLIDATED POLICIES
-- INSERT: Users can insert as themselves, Admins can insert as anyone.
CREATE POLICY "Feedbacks Insert Policy" ON feedbacks FOR
INSERT TO authenticated WITH CHECK (
        (
            select auth.uid()
        ) = author_id
        OR (
            select is_admin()
        )
    );
-- UPDATE: Users can update their own, Admins can update any.
CREATE POLICY "Feedbacks Update Policy" ON feedbacks FOR
UPDATE TO authenticated USING (
        (
            select auth.uid()
        ) = author_id
        OR (
            select is_admin()
        )
    ) WITH CHECK (
        (
            select auth.uid()
        ) = author_id
        OR (
            select is_admin()
        )
    );
-- Note: DELETE policy for Admins ('Admins can delete feedbacks') remains valid 
-- and non-redundant assuming users CANNOT delete their own feedbacks.
-- If users CAN delete, we would need to merge that too, but no warning was reported for DELETE.