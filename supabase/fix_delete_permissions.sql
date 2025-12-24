-- FIX UPDATE AND DELETE PERMISSIONS
-- Run this in Supabase SQL Editor
-- 1. Projects: Ensure Delete is allowed for Owner
drop policy if exists "Users can perform CRUD on own projects" on projects;
create policy "Users can perform CRUD on own projects" on projects for all using (auth.uid() = owner_id);
-- 2. Templates: Ensure Delete is allowed for Owner
drop policy if exists "Users can CRUD own templates" on templates;
create policy "Users can CRUD own templates" on templates for all using (auth.uid() = owner_id);
-- 3. Feedbacks: Ensure Delete for Authors (optional, often feedback isn't deleted by users but let's allow it if they own it)
-- Note: 'feedbacks' doesn't have a reliable 'owner_id' UUID column in schema.sql (it uses author_name text?), 
-- but let's verify schema. 
-- Schema says: feedbacks has no owner_id. It has "author_name". 
-- Wait, if feedbacks has no owner_id, we can't secure it by user ID easily.
-- We'll skip feedbacks deletion policy for now unless we add owner_id column.
-- Assuming admins delete feedbacks via Master Dashboard.
-- 4. Enable RLS and Grants
alter table projects enable row level security;
alter table templates enable row level security;
-- Ensure authenticated users have generic delete access subject to RLS
grant delete on table projects to authenticated;
grant delete on table templates to authenticated;
grant delete on table feedbacks to authenticated;