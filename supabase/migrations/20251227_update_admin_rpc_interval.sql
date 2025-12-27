-- Drop the function first because return type changed
DROP FUNCTION IF EXISTS public.get_admin_profiles(INT, INT);
-- Re-create the function
CREATE OR REPLACE FUNCTION public.get_admin_profiles(p_page INT, p_page_size INT) RETURNS TABLE (
        id UUID,
        email TEXT,
        role TEXT,
        plan TEXT,
        status TEXT,
        created_at TIMESTAMPTZ,
        last_login TIMESTAMPTZ,
        is_system_admin BOOLEAN,
        name TEXT,
        avatar_url TEXT,
        company_name TEXT,
        job_title TEXT,
        total_count BIGINT,
        subscription_interval TEXT -- New Column
    ) SECURITY DEFINER
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
-- Return paginated profiles
RETURN QUERY
SELECT p.id,
    p.email,
    CASE
        WHEN p.is_system_admin THEN 'admin'::TEXT
        ELSE 'user'::TEXT
    END as role,
    p.plan,
    p.status,
    p.created_at,
    p.last_login,
    p.is_system_admin,
    p.name,
    p.avatar_url,
    COALESCE(p.company_name, '') as company_name,
    COALESCE(p.job_title, '') as job_title,
    v_total as total_count,
    s.interval as subscription_interval
FROM public.profiles p
    LEFT JOIN LATERAL (
        SELECT interval
        FROM public.subscriptions
        WHERE user_id = p.id
            AND (
                status = 'active'
                OR status = 'trialing'
            )
        ORDER BY created DESC
        LIMIT 1
    ) s ON true
ORDER BY p.created_at DESC
LIMIT p_page_size OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;