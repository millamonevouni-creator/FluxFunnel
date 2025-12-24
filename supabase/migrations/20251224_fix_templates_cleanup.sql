-- MIGRATION: 20251224_fix_templates_cleanup.sql
-- OBJECTIVE: Remove remaining legacy policies on 'templates' that cause Conflicts and Performance Warnings.
-- The previous migration created optimized "Users can ..." policies.
-- Now we must remove the old "Templates ..." policies to stop the "Multiple Permissive Policies" and "InitPlan" warnings.
DROP POLICY IF EXISTS "Templates Insert" ON templates;
DROP POLICY IF EXISTS "Templates Update" ON templates;
DROP POLICY IF EXISTS "Templates Delete" ON templates;
-- (Optimization for Select was already handled, but purely for safety/cleanup if it reincarnated)
DROP POLICY IF EXISTS "Templates Select" ON templates;