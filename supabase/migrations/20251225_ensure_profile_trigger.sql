-- Migração para garantir que novos usuários tenham perfis criados corretamente
-- Data: 2025-12-25
-- 1. Drop existing trigger if exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- 2. Create or Replace the Handler Function
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
INSERT INTO public.profiles (
        id,
        email,
        name,
        avatar_url,
        role,
        plan,
        status,
        created_at,
        updated_at
    )
VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', new.email),
        -- Fallback to email if name is missing
        new.raw_user_meta_data->>'avatar_url',
        'USER',
        -- Default role
        COALESCE(new.raw_user_meta_data->>'plan', 'FREE'),
        -- Use plan from metadata or default to FREE
        'ACTIVE',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    updated_at = NOW();
RETURN new;
END;
$$;
-- 3. Re-create the Trigger
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- 4. Fix permissions just in case
GRANT USAGE ON SCHEMA public TO postgres,
    anon,
    authenticated,
    service_role;
GRANT ALL ON TABLE public.profiles TO postgres,
    service_role;
GRANT SELECT,
    UPDATE,
    INSERT ON TABLE public.profiles TO authenticated;