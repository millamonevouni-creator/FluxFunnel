-- TEMPORARY DEBUG POLICY
-- Allow everyone to read profiles to rule out RLS
CREATE POLICY "debug_read_all" ON "public"."profiles" FOR
SELECT USING (true);