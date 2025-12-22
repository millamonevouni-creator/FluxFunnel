-- 1. Enable RLS
alter table profiles enable row level security;
-- 2. Drop existing restrictive policies if they exist (to avoid conflicts or "deny" winning over "allow" in some configs, though usually OR works)
-- We use "approval" style policies usually.
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
-- 3. Create a permissive policy for everyone to read basic info? No, usually privacy is key.
-- Re-create the standard "View Own" policy
create policy "Users can view own profile" on profiles for
select using (auth.uid() = id);
-- 4. Create the Admin Super Policy
create policy "Admins can view and edit all profiles" on profiles for all using (
    exists (
        select 1
        from profiles as p
        where p.id = auth.uid()
            and p.is_system_admin = true
    )
);
-- 5. IMPORTANT: Promote the main user to ADMIN
update profiles
set is_system_admin = true,
    plan = 'PREMIUM',
    status = 'ACTIVE'
where email = 'millamon.evouni@gmail.com';
-- 6. Also allow reading profiles if you are the owner (standard)
create policy "Users can update own profile" on profiles for
update using (auth.uid() = id);