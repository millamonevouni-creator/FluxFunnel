-- 1. Security Hardening for Functions
-- Setting search_path to an empty string to prevent search-path-based attacks
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER
SET search_path = '' AS $$
select pg_catalog.coalesce(
        (
            select is_system_admin
            from public.profiles
            where id = auth.uid()
        ),
        false
    );
$$;
CREATE OR REPLACE FUNCTION public.get_project_public(p_id uuid) RETURNS SETOF public.projects LANGUAGE sql SECURITY DEFINER
SET search_path = '' AS $$
SELECT *
FROM public.projects
WHERE id = p_id;
$$;
CREATE OR REPLACE FUNCTION public.get_accessible_projects() RETURNS SETOF public.projects LANGUAGE sql SECURITY DEFINER
SET search_path = '' AS $$
SELECT *
FROM public.projects
WHERE owner_id = auth.uid()
    OR owner_id IN (
        SELECT owner_id
        FROM public.team_members
        WHERE user_id = auth.uid()
    );
$$;
-- Note: handle_new_team_member is a trigger function (plpgsql)
CREATE OR REPLACE FUNCTION public.handle_new_team_member() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' AS $$
DECLARE member_record RECORD;
auth_user RECORD;
meta_plan TEXT;
BEGIN
SELECT * INTO member_record
FROM public.team_members
WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
LIMIT 1;
SELECT * INTO auth_user
FROM auth.users
WHERE id = NEW.id;
IF auth_user IS NOT NULL THEN meta_plan := auth_user.raw_user_meta_data->>'plan';
END IF;
IF member_record IS NOT NULL THEN
UPDATE public.team_members
SET user_id = NEW.id,
    status = 'ACTIVE',
    avatar_url = NEW.avatar_url
WHERE id = member_record.id;
UPDATE public.profiles
SET plan = pg_catalog.coalesce(
        meta_plan,
        member_record.assigned_plan_id,
        'CONVIDADO'
    ),
    is_invited_member = true
WHERE id = NEW.id;
ELSIF meta_plan IS NOT NULL THEN
UPDATE public.profiles
SET plan = meta_plan,
    is_invited_member = true
WHERE id = NEW.id;
END IF;
RETURN NEW;
END;
$$;
-- 2. Audit Logs RLS
-- Enable RLS and add policy for admins only
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR
SELECT TO authenticated USING (public.is_admin());
-- 3. Cleanup Unused Indexes
-- Removing indexes identified as unused by Supabase Advisor
DROP INDEX IF EXISTS public.idx_team_members_owner_id;
DROP INDEX IF EXISTS public.profiles_stripe_customer_id_idx;
DROP INDEX IF EXISTS public.idx_invoices_user;
DROP INDEX IF EXISTS public.idx_audit_logs_actor_id;
DROP INDEX IF EXISTS public.idx_team_members_user_id;
DROP INDEX IF EXISTS public.idx_subscriptions_status;