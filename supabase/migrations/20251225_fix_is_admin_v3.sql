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
CREATE OR REPLACE FUNCTION public.get_admin_profiles(p_page INT DEFAULT 1, p_page_size INT DEFAULT 20) RETURNS TABLE (
        id UUID,
        email TEXT,
        role TEXT,
        plan TEXT,
        status TEXT,
        created_at TIMESTAMPTZ,
        last_sign_in_at TIMESTAMPTZ,
        is_system_admin BOOLEAN,
        total_count BIGINT
    ) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_offset INT;
v_total BIGINT;
BEGIN -- Check if the caller is an admin
IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access Denied: User is not an admin';
END IF;
-- Calculate Offset
v_offset := (p_page - 1) * p_page_size;
-- Get Total Count
SELECT COUNT(*) INTO v_total
FROM public.profiles;
-- Return paginated profiles with total count attached to each row
RETURN QUERY
SELECT p.id,
    p.email,
    p.role,
    p.plan,
    p.status,
    p.created_at,
    p.last_sign_in_at,
    p.is_system_admin,
    v_total as total_count
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT p_page_size OFFSET v_offset;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_admin_profiles() TO authenticated;