-- Enable RLS on templates (if not already)
alter table templates enable row level security;
-- Policy: Admins can do everything
create policy "Admins can do everything on templates" on templates for all using (
    exists (
        select 1
        from profiles
        where profiles.id = auth.uid()
            and profiles.is_system_admin = true
    )
);
-- Also ensure admins can view all profiles (needed for the EXISTS check above if strict RLS is on profiles)
create policy "Admins can view all profiles" on profiles for
select using (
        auth.uid() = id
        OR is_system_admin = true
        OR exists (
            select 1
            from profiles as p
            where p.id = auth.uid()
                and p.is_system_admin = true
        )
    );