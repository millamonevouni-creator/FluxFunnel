-- EMERGENCY FIX: Profile Trigger Schema Mismatch
-- 2025-12-25
-- Detected by Audit Probe: `role` and `updated_at` columns are MISSING in `profiles`.
-- The trigger MUST NOT reference them.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
INSERT INTO public.profiles (
        id,
        email,
        name,
        avatar_url,
        -- role removed
        plan,
        status,
        created_at -- updated_at removed
    )
VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', new.email),
        new.raw_user_meta_data->>'avatar_url',
        -- 'USER' removed
        COALESCE(new.raw_user_meta_data->>'plan', 'FREE'),
        'ACTIVE',
        NOW() -- NOW() removed
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name);
-- updated_at = NOW() removed
RETURN new;
END;
$$;