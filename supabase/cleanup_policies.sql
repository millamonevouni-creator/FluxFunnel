-- POLICY CLEANUP SCRIPT
-- Removes redundant policies that are causing "Multiple Permissive Policies" warnings.

-- 1. TEMPLATES: Remove fragmented policies (superseded by "Users can CRUD own templates")
drop policy if exists "Owners can delete templates" on templates;
drop policy if exists "Owners can insert templates" on templates;
drop policy if exists "Owners can update templates" on templates;
drop policy if exists "Unified View Policy on Templates" on templates;

-- 2. TEAM MEMBERS: Fix overlaps
-- We want distinct policies: One for the OWNER (Full Access) and one for the MEMBER (Read Only)

-- Drop the potentially unoptimized or conflicting policy
drop policy if exists "Users view own invites" on team_members;

-- Re-create a clean, optimized policy for members to view their own invites
-- Uses (select auth.email()) to avoid per-row recalc overhead if possible, though email is less stable than ID.
create policy "Users can view invites sent to them" on team_members
  for select using (
    email = (select auth.jwt() ->> 'email')
  );

-- Ensure the Owner policy (from perf_fix.sql) is the authoritative one for management:
-- "Users can manage their own team members" (Keep this one, it was in perf_fix.sql)
