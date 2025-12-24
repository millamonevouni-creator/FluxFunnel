-- MIGRATION: 20251224_fix_project_isolation.sql
-- OBJECTIVE: Add Privacy Control to Projects and Update Access Logic
-- 1. Add is_private column to projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
-- 2. Update get_accessible_projects function
-- Logic: 
-- - Owners see everything.
-- - Team Members see only PUBLIC (non-private) projects of the owner they are linked to.
CREATE OR REPLACE FUNCTION get_accessible_projects() RETURNS SETOF projects LANGUAGE sql SECURITY DEFINER AS $$
SELECT *
FROM projects
WHERE -- Rule 1: Owner sees all their projects
    owner_id = auth.uid()
    OR -- Rule 2: Team Members see projects of their "Leader" (owner_id in team_members),
    -- BUT ONLY if the project is NOT private.
    (
        owner_id IN (
            SELECT owner_id
            FROM team_members
            WHERE user_id = auth.uid()
                AND status = 'ACTIVE' -- access only if accepted invite
        )
        AND is_private = false
    );
$$;
-- 3. Ensure RLS on Projects respects this too (Redundant but safe)
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
CREATE POLICY "Users can view accessible projects" ON projects FOR
SELECT USING (
        owner_id = auth.uid()
        OR (
            owner_id IN (
                SELECT owner_id
                FROM team_members
                WHERE user_id = auth.uid()
                    AND status = 'ACTIVE'
            )
            AND is_private = false
        )
    );