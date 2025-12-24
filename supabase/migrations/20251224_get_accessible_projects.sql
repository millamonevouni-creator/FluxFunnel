CREATE OR REPLACE FUNCTION get_accessible_projects() RETURNS SETOF projects LANGUAGE sql SECURITY DEFINER AS $$
SELECT *
FROM projects
WHERE owner_id = auth.uid()
    OR owner_id IN (
        SELECT owner_id
        FROM team_members
        WHERE user_id = auth.uid()
    );
$$;