CREATE OR REPLACE FUNCTION public.debug_admin_state() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_uid uuid;
v_email text;
v_is_admin boolean;
v_profile_exists boolean;
v_profile_admin_flag boolean;
BEGIN v_uid := auth.uid();
v_email := auth.jwt()->>'email';
v_is_admin := public.is_admin();
SELECT EXISTS(
        SELECT 1
        FROM profiles
        WHERE id = v_uid
    ) INTO v_profile_exists;
IF v_profile_exists THEN
SELECT is_system_admin INTO v_profile_admin_flag
FROM profiles
WHERE id = v_uid;
END IF;
RETURN jsonb_build_object(
    'uid',
    v_uid,
    'email',
    v_email,
    'is_admin_func_result',
    v_is_admin,
    'profile_exists',
    v_profile_exists,
    'profile_admin_flag_in_db',
    v_profile_admin_flag,
    'jwt_claims',
    auth.jwt()
);
END;
$$;
GRANT EXECUTE ON FUNCTION public.debug_admin_state() TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_admin_state() TO anon;
-- Allow anon for extreme debugging