-- 1. Create helper function to bypass RLS recursion
create or replace function public.is_admin() returns boolean language sql security definer -- This is the magic key: function runs with creator permissions, bypassing RLS
    as $$
select coalesce(
        (
            select is_system_admin
            from profiles
            where id = auth.uid()
        ),
        false
    );
$$;
-- 2. Drop existing policies on PROFILES to avoid conflicts
drop policy if exists "Admins can view and edit all profiles" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
-- 3. Re-create policies using the non-recursive function
-- Policy: Admin Full Access (SELECT, INSERT, UPDATE, DELETE)
create policy "Admins can do everything on profiles" on profiles for all using (is_admin() = true);
-- Policy: Standard User View Own
create policy "Users can view own profile" on profiles for
select using (auth.uid() = id);
-- Policy: Standard User Update Own
create policy "Users can update own profile" on profiles for
update using (auth.uid() = id);