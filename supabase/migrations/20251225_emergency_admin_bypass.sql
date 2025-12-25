-- Emergency Fix: Hardcode Master Admin Email to bypass DB lookup issues temporarily
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $function$
DECLARE v_is_admin BOOLEAN;
v_email TEXT;
BEGIN -- Check if the user is authenticated
IF auth.uid() IS NULL THEN RETURN FALSE;
END IF;
-- 1. Emergency Bypass for Master Email (Get email from auth.users via subquery or jwt)
-- Note: accessing auth.users directly in SECURITY DEFINER is possible but requires permissions.
-- Better: use auth.jwt() ->> 'email'
v_email := auth.jwt()->>'email';
IF v_email = 'millamon.evouni@gmail.com' THEN RETURN TRUE;
END IF;
-- 2. Standard DB Check (for other admins)
SELECT is_system_admin INTO v_is_admin
FROM profiles
WHERE id = auth.uid();
RETURN COALESCE(v_is_admin, FALSE);
END;
$function$;
-- Re-apply RPC to ensure it uses the new function version (just in case of inlining)
CREATE OR REPLACE FUNCTION public.get_admin_profiles() RETURNS SETOF public.profiles LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access Denied: User is not an admin';
END IF;
RETURN QUERY
SELECT *
FROM public.profiles
ORDER BY created_at DESC;
END;
$$;