-- Enable RLS on profiles if not already (it is, but good practice)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- 1. Policy for Admins to View All Profiles
-- Drop existing potential conflicting policies if acts as obstruction, 
-- but usually we add permissive policies.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR
SELECT TO authenticated USING (
        (
            SELECT is_system_admin
            FROM public.profiles
            WHERE id = auth.uid()
        ) = true
    );
-- 2. Policy for Audit Logs
-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- Allow authenticated users to Insert logs (client-side logging)
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR
INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);
-- Allow Admins to View Audit Logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR
SELECT TO authenticated USING (
        (
            SELECT is_system_admin
            FROM public.profiles
            WHERE id = auth.uid()
        ) = true
    );
-- 3. Fix Templates RLS for Marketplace
-- Allow Public templates to be viewed by anyone authenticated
DROP POLICY IF EXISTS "Authenticated can view public templates" ON public.templates;
CREATE POLICY "Authenticated can view public templates" ON public.templates FOR
SELECT TO authenticated USING (is_public = true);
-- Allow Admins to View ALL templates (for moderation)
DROP POLICY IF EXISTS "Admins can view all templates" ON public.templates;
CREATE POLICY "Admins can view all templates" ON public.templates FOR
SELECT TO authenticated USING (
        (
            SELECT is_system_admin
            FROM public.profiles
            WHERE id = auth.uid()
        ) = true
    );
-- 4. Fix Roadmap/Feedbacks RLS
-- Allow everyone to read feedbacks
DROP POLICY IF EXISTS "Anyone can read feedbacks" ON public.feedbacks;
CREATE POLICY "Anyone can read feedbacks" ON public.feedbacks FOR
SELECT TO authenticated USING (true);
-- Allow creation
DROP POLICY IF EXISTS "Authenticated can create feedback" ON public.feedbacks;
CREATE POLICY "Authenticated can create feedback" ON public.feedbacks FOR
INSERT TO authenticated WITH CHECK (true);