-- STRICT POLICY OPTIMIZATION
-- Attempts to satisfy strict linter checks by isolating auth function calls completely.

-- Drop the unified policy
drop policy if exists "Users can view team members" on team_members;

-- Re-create with strict sub-selection for the function call itself
create policy "Users can view team members" on team_members
  for select using (
    owner_id = (select auth.uid()) 
    OR 
    email = ((select auth.jwt()) ->> 'email')
  );

-- Explanation:
-- Previous: (select auth.jwt() ->> 'email') - Executes operator inside subquery
-- New:      ((select auth.jwt()) ->> 'email') - Executes function in subquery, then operator on result
-- This structure usually helps the optimizer (and linter) treat the auth call as a stable constant.
