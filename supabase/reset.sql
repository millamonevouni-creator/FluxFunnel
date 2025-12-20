
-- RESET SCRIPT: Drop all tables and recreate schema
-- WARNING: THIS WILL DELETE ALL DATA IN THESE TABLES

-- 1. Drop existing tables (Order matters for dependencies)
drop table if exists system_config cascade;
drop table if exists team_members cascade;
drop table if exists feedbacks cascade;
drop table if exists plans cascade;
drop table if exists templates cascade;
drop table if exists projects cascade;
drop table if exists profiles cascade;

-- 2. Re-enable extensions
create extension if not exists "uuid-ossp";

-- 3. Recreate Tables

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  plan text default 'FREE',
  status text default 'ACTIVE',
  avatar_url text,
  is_system_admin boolean default false,
  last_login timestamptz default now(),
  created_at timestamptz default now()
);

-- PROJECTS
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  nodes jsonb default '[]',
  edges jsonb default '[]',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- TEMPLATES
create table templates (
  id uuid default gen_random_uuid() primary key,
  custom_label text,
  custom_description text,
  owner_id uuid references profiles(id) on delete set null,
  author_name text,
  nodes jsonb default '[]',
  edges jsonb default '[]',
  status text default 'PENDING',
  is_public boolean default false,
  is_featured boolean default false,
  is_pro boolean default false,
  rating numeric default 0,
  rating_count integer default 0,
  downloads integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PLANS
create table plans (
  id text primary key,
  label text not null,
  price_monthly numeric default 0,
  price_yearly numeric default 0,
  project_limit integer default 1,
  node_limit integer default 20,
  features jsonb default '[]',
  is_popular boolean default false,
  created_at timestamptz default now()
);

-- FEEDBACKS
create table feedbacks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null,
  status text default 'PENDING',
  author_name text,
  votes integer default 0,
  voted_user_ids text[] default array[]::text[],
  comments jsonb default '[]',
  created_at timestamptz default now()
);

-- TEAM MEMBERS
create table team_members (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  role text default 'VIEWER',
  status text default 'PENDING',
  avatar_url text,
  created_at timestamptz default now()
);

-- SYSTEM CONFIG
create table system_config (
  id uuid default gen_random_uuid() primary key,
  maintenance_mode boolean default false,
  allow_signups boolean default true,
  announcements jsonb default '[]',
  debug_mode boolean default false,
  updated_at timestamptz default now()
);

-- 4. Enable RLS
alter table profiles enable row level security;
alter table projects enable row level security;
alter table templates enable row level security;
alter table plans enable row level security;
alter table feedbacks enable row level security;
alter table team_members enable row level security;
alter table system_config enable row level security;

-- 5. Create Policies

-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Projects
create policy "Users can perform CRUD on own projects" on projects for all using (auth.uid() = owner_id);

-- Templates
create policy "Public templates are viewable by everyone" on templates for select using (is_public = true);
create policy "Users can CRUD own templates" on templates for all using (auth.uid() = owner_id);

-- Plans
create policy "Plans are viewable by everyone" on plans for select using (true);

-- Feedbacks
create policy "Feedbacks are viewable by everyone" on feedbacks for select using (true);

-- System Config
create policy "System config viewable by everyone" on system_config for select using (true);

-- 6. Seed Initial Data
insert into system_config (maintenance_mode, allow_signups) values (false, true);

-- Default Plans (Optional but recommended)
insert into plans (id, label, price_monthly, price_yearly, project_limit, node_limit, is_popular) values
('FREE', 'Plano Gratuito', 0, 0, 1, 20, false),
('PRO', 'Plano Pro', 69.90, 712.98, 5, 100, false),
('PREMIUM', 'Plano Premium', 97.90, 881.10, 9999, 9999, true)
on conflict (id) do nothing;
