-- Limpeza de Perfis Órfãos
-- Remove qualquer registro em public.profiles que não tenha um correspondente em auth.users
DELETE FROM public.profiles
WHERE id NOT IN (
        SELECT id
        FROM auth.users
    );
-- Opcional: Garantir que futuras exclusões funcionem via Constraint (apenas se não existir)
-- ALTER TABLE public.profiles
-- DROP CONSTRAINT IF EXISTS profiles_id_fkey,
-- ADD CONSTRAINT profiles_id_fkey
-- FOREIGN KEY (id)
-- REFERENCES auth.users(id)
-- ON DELETE CASCADE;