-- Fix 1: Correct the is_admin function (avoid variable shadowing)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public -- Ensure we use public schema
    AS $function$
DECLARE v_is_admin BOOLEAN;
-- Use prefix to avoid ambiguity with function name
BEGIN -- Check if the user is authenticated (using session user)
IF auth.uid() IS NULL THEN RETURN FALSE;
END IF;
-- Check the profiles table for is_system_admin flag.
-- Since this is SECURITY DEFINER, it runs as owner (postgres) and bypasses RLS.
SELECT is_system_admin INTO v_is_admin
FROM profiles
WHERE id = auth.uid();
-- Return true if is_admin is true, otherwise false (handle nulls)
RETURN COALESCE(v_is_admin, FALSE);
END;
$function$;
-- Fix 2: Re-apply get_admin_profiles to use the corrected is_admin
CREATE OR REPLACE FUNCTION public.get_admin_profiles() RETURNS SETOF public.profiles LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN -- Check if the caller is an admin
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access Denied: User is not an admin';
END IF;
-- Return all profiles
RETURN QUERY
SELECT *
FROM public.profiles
ORDER BY created_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_admin_profiles() TO authenticated;