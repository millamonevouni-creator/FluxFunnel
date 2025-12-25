-- 1. Correct Policy for Admins to View All Profiles
-- Use boolean comparison explicitly for clarity
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR
SELECT TO authenticated USING (public.is_admin() = true);
-- 2. Policy for Audit Logs (Re-apply as it was rolled back)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR
INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR
SELECT TO authenticated USING (public.is_admin() = true);
-- 3. Fix Templates RLS (Re-apply)
DROP POLICY IF EXISTS "Authenticated can view public templates" ON public.templates;
CREATE POLICY "Authenticated can view public templates" ON public.templates FOR
SELECT TO authenticated USING (is_public = true);
DROP POLICY IF EXISTS "Admins can view all templates" ON public.templates;
CREATE POLICY "Admins can view all templates" ON public.templates FOR
SELECT TO authenticated USING (public.is_admin() = true);
-- 4. Fix Roadmap/Feedbacks RLS (Re-apply)
DROP POLICY IF EXISTS "Anyone can read feedbacks" ON public.feedbacks;
CREATE POLICY "Anyone can read feedbacks" ON public.feedbacks FOR
SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated can create feedback" ON public.feedbacks;
CREATE POLICY "Authenticated can create feedback" ON public.feedbacks FOR
INSERT TO authenticated WITH CHECK (true);