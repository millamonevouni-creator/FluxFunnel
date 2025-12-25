-- Migration: Ensure is_admin function exists and is robust
-- Description: Creates or Replaces the is_admin function to correctly check if a user is a system admin.
-- This is critical for RLS policies "Admins can delete feedbacks" etc.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
DECLARE is_admin BOOLEAN;
BEGIN -- Check if the user is authenticated
IF auth.uid() IS NULL THEN RETURN FALSE;
END IF;
-- Check the profiles table for is_system_admin flag
SELECT is_system_admin INTO is_admin
FROM public.profiles
WHERE id = auth.uid();
-- Return true if is_admin is true, otherwise false (handle nulls)
RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;