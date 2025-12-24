-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- PROFILES (Users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  plan text default 'FREE',
  status text default 'ACTIVE',
  avatar_url text,
  is_system_admin boolean default false,
  stripe_customer_id text unique,
  -- Added 2025-12-24
  last_login timestamptz default now(),
  created_at timestamptz default now()
);
-- SUBSCRIPTIONS (Added 2025-12-24)
create table if not exists subscriptions (
  id text primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now() created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- INVOICES (Added 2025-12-24)
create table if not exists invoices (
  id text primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  subscription_id text references subscriptions(id) on delete
  set null,
    amount_paid numeric not null,
    currency text default 'brl',
    status text not null,
    invoice_pdf text,
    created_at timestamptz default now()
);
-- AUDIT LOGS (Added 2025-12-24)
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references auth.users(id) on delete
  set null,
    action text not null,
    target_resource text not null,
    target_id text,
    details jsonb,
    ip_address text,
    created_at timestamptz default now() ip_address text,
    created_at timestamptz default now()
);
-- PAYMENT LOGS (Added 2025-12-24)
create table if not exists payment_logs (
  id uuid default gen_random_uuid() primary key,
  event_id text not null unique,
  event_type text not null,
  stripe_customer_id text,
  amount numeric,
  currency text,
  status text,
  payload jsonb,
  error_message text,
  created_at timestamptz default now()
);
-- PROJECTS
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  nodes jsonb default '[]',
  edges jsonb default '[]',
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
-- TEMPLATES
create table if not exists templates (
  id uuid default gen_random_uuid() primary key,
  custom_label text,
  custom_description text,
  owner_id uuid references profiles(id) on delete
  set null,
    author_name text,
    nodes jsonb default '[]',
    edges jsonb default '[]',
    status text default 'PENDING',
    -- PENDING, APPROVED, REJECTED
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
create table if not exists plans (
  id text primary key,
  -- FREE, PRO, PREMIUM
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
create table if not exists feedbacks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null,
  -- FEATURE, BUG, IMPROVEMENT, OTHER
  status text default 'PENDING',
  author_name text,
  votes integer default 0,
  voted_user_ids text [] default array []::text [],
  comments jsonb default '[]',
  created_at timestamptz default now()
);
-- TEAM MEMBERS
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  role text default 'VIEWER',
  -- ADMIN, EDITOR, VIEWER
  status text default 'PENDING',
  -- ACTIVE, PENDING
  avatar_url text,
  created_at timestamptz default now()
);
-- SYSTEM CONFIG
create table if not exists system_config (
  id uuid default gen_random_uuid() primary key,
  maintenance_mode boolean default false,
  allow_signups boolean default true,
  announcements jsonb default '[]',
  debug_mode boolean default false,
  updated_at timestamptz default now()
);
-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table templates enable row level security;
alter table plans enable row level security;
alter table feedbacks enable row level security;
alter table team_members enable row level security;
alter table system_config enable row level security;
-- POLICIES (Basic examples - refine as needed)
-- Profiles: Users can read their own profile.
create policy "Users can view own profile" on profiles for
select using (auth.uid() = id);
-- Profiles: Users can update their own profile.
create policy "Users can update own profile" on profiles for
update using (auth.uid() = id);
-- Projects: Users can CRUD their own projects.
create policy "Users can perform CRUD on own projects" on projects for all using (auth.uid() = owner_id);
-- Templates: Public templates are visible to everyone.
create policy "Public templates are viewable by everyone" on templates for
select using (is_public = true);
-- Templates: Users can CRUD their own templates.
create policy "Users can CRUD own templates" on templates for all using (auth.uid() = owner_id);
-- Plans: Everyone can view plans.
create policy "Plans are viewable by everyone" on plans for
select using (true);
-- Feedbacks: Everyone can view feedbacks.
create policy "Feedbacks are viewable by everyone" on feedbacks for
select using (true);
-- System Config: viewable by everyone (or restrict if needed).
create policy "System config viewable by everyone" on system_config for
select using (true);
-- Insert default system config if not exists
insert into system_config (maintenance_mode, allow_signups)
select false,
  true
where not exists (
    select 1
    from system_config
  );