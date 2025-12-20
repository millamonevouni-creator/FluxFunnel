
-- MIGRATION SCRIPT: Fix Missing Columns
-- Run this script in the Supabase SQL Editor to update your existing tables.

-- 1. Fix 'templates' table (Adding missing columns causing the error)
alter table if exists templates add column if not exists is_public boolean default false;
alter table if exists templates add column if not exists is_featured boolean default false;
alter table if exists templates add column if not exists is_pro boolean default false;
alter table if exists templates add column if not exists rating numeric default 0;
alter table if exists templates add column if not exists rating_count integer default 0;
alter table if exists templates add column if not exists downloads integer default 0;
alter table if exists templates add column if not exists status text default 'PENDING';
alter table if exists templates add column if not exists owner_id uuid references profiles(id) on delete set null;

-- 2. Fix 'projects' table (Ensuring owner_id constraint exists)
alter table if exists projects add column if not exists owner_id uuid references profiles(id) on delete cascade;
alter table if exists projects add column if not exists updated_at timestamptz default now();

-- 3. Fix 'profiles' table
alter table if exists profiles add column if not exists plan text default 'FREE';
alter table if exists profiles add column if not exists is_system_admin boolean default false;

-- 4. Re-run Policies (Try to create them if they don't exist)
-- Note: If policies already exist, these commands might fail or be ignored. 
-- If you want to force reset policies, uncomment the DROP commands below.

-- drop policy if exists "Public templates are viewable by everyone" on templates;
create policy "Public templates are viewable by everyone" on templates for select using (is_public = true);

-- drop policy if exists "Users can perform CRUD on own projects" on projects;
create policy "Users can perform CRUD on own projects" on projects for all using (auth.uid() = owner_id);

-- 5. Fix 'team_members' table (Adding owner_id and Policies)
alter table if exists team_members add column if not exists owner_id uuid references profiles(id) on delete cascade;

-- RLS for team_members
drop policy if exists "Users can manage their own team members" on team_members;
create policy "Users can manage their own team members" on team_members
  for all using (auth.uid() = owner_id);

