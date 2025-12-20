-- PERFORMANCE OPTIMIZATION SCRIPT
-- This script updates Row Level Security (RLS) policies to avoid unnecessary re-evaluations of auth.uid().
-- It addresses the "Auth RLS Initialization Plan" warnings.

-- 1. PROFILES: Optimize "view own profile"
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles
  for select using ((select auth.uid()) = id);

-- 2. PROFILES: Optimize "update own profile"
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
  for update using ((select auth.uid()) = id);

-- 3. TEAM MEMBERS: Optimize "manage own team members"
drop policy if exists "Users can manage their own team members" on team_members;
create policy "Users can manage their own team members" on team_members
  for all using ((select auth.uid()) = owner_id);

-- 4. PROJECTS: Optimize "CRUD own projects" (Proactive fix)
drop policy if exists "Users can perform CRUD on own projects" on projects;
create policy "Users can perform CRUD on own projects" on projects
  for all using ((select auth.uid()) = owner_id);

-- 5. TEMPLATES: Optimize "CRUD own templates" (Proactive fix)
drop policy if exists "Users can CRUD own templates" on templates;
create policy "Users can CRUD own templates" on templates
  for all using ((select auth.uid()) = owner_id);

-- NOTE ON "Multiple Permissive Policies" Warning:
-- The warning about "multiple permissive policies" on team_members appears because there are likely two separate policies allowing access:
-- 1. "Users can manage their own team members" (for the Manager/Owner)
-- 2. "Users view own invites" (for the Invitee)
-- It is generally SAFE to ignore this warning if these policies serve different logical purposes (Owner vs Member).
-- Combining them into a complex OR condition often reduces readability.
