-- Create a secure function to list all profiles for admins only
CREATE OR REPLACE FUNCTION public.get_admin_profiles() RETURNS SETOF public.profiles LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Check if the caller is an admin using the helpers
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access Denied: User is not an admin';
END IF;
-- Return all profiles
RETURN QUERY
SELECT *
FROM public.profiles
ORDER BY created_at DESC;
END;
$$;
-- Grant execute permission to authenticated users (logic inside handles auth)
GRANT EXECUTE ON FUNCTION public.get_admin_profiles() TO authenticated;