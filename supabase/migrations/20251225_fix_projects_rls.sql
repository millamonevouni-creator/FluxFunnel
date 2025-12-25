-- Permissions Fix: Restore Project CRUD
-- Reason: Recent isolation migration might have left holes in INSERT/UPDATE/DELETE policies.
-- 1. Enable RLS (Ensure it's on)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- 2. INSERT Policy
-- Allow authenticated users to create projects where they are the owner
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects" ON projects FOR
INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
-- 3. UPDATE Policy
-- Users can update their own projects
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects FOR
UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
-- 4. DELETE Policy
-- Users can delete their own projects
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE TO authenticated USING (owner_id = auth.uid());
-- 5. SELECT Policy (Re-affirming existing logic just in case, but usually handled by get_accessible_projects or separate policy)
-- We won't touch SELECT here to avoid conflict with the "fix_project_isolation.sql" logic unless needed.
-- "Users can view accessible projects" should cover SELECT.