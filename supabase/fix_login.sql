-- EMERGENCY LOGIN FIX
-- 1. Updates the password for 'millamon.evouni@gmail.com' to '342511'
-- 2. Ensures the user profile exists in public.profiles
-- 3. Grants System Admin privileges

-- Enable pgcrypto for password hashing if not enabled
create extension if not exists pgcrypto;

-- 1. Force Update Password
update auth.users
set encrypted_password = crypt('342511', gen_salt('bf'))
where email = 'millamon.evouni@gmail.com';

-- 2. Ensure Profile Exists & Sync
insert into public.profiles (id, email, name, is_system_admin, plan, status)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'name', 'Millamon Admin'), 
  true, 
  'PREMIUM',
  'ACTIVE'
from auth.users 
where email = 'millamon.evouni@gmail.com'
on conflict (id) do update 
set 
  is_system_admin = true,
  plan = 'PREMIUM',
  status = 'ACTIVE';

-- 3. Confirm email (just in case)
update auth.users
set email_confirmed_at = now()
where email = 'millamon.evouni@gmail.com' and email_confirmed_at is null;
