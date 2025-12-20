-- FINAL POLICY OPTIMIZATION
-- Consolidate policies to ensure 1 policy per action and optimize auth calls.

-- Drop known conflicting policies on team_members to start fresh
drop policy if exists "Users can manage their own team members" on team_members;
drop policy if exists "Users can view invites sent to them" on team_members;
drop policy if exists "Users view own invites" on team_members;
drop policy if exists "Owners can manage team members" on team_members;
drop policy if exists "Owners can update team members" on team_members;
drop policy if exists "Owners can delete team members" on team_members;
drop policy if exists "Users can view team members" on team_members;

-- 1. SELECT (Unified: Owner OR Invitee)
-- Solves "Multiple Permissive Policies" for SELECT
-- Solves "Auth RLS Initialization Plan" by wrapping auth calls in (select ...)
create policy "Users can view team members" on team_members
  for select using (
    owner_id = (select auth.uid()) 
    OR 
    email = (select auth.jwt() ->> 'email')
  );

-- 2. INSERT (Owners only)
create policy "Owners can insert team members" on team_members
  for insert with check (
    owner_id = (select auth.uid())
  );

-- 3. UPDATE (Owners only)
create policy "Owners can update team members" on team_members
  for update using (
    owner_id = (select auth.uid())
  );

-- 4. DELETE (Owners only)
create policy "Owners can delete team members" on team_members
  for delete using (
    owner_id = (select auth.uid())
  );
