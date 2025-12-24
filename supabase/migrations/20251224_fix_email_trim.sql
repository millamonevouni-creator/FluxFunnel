-- 20251224_fix_email_trim.sql
-- 1. LIMPEZA DE DADOS: Remove espaços em branco dos emails na tabela de convites
UPDATE team_members
SET email = TRIM(email);
-- 2. CORREÇÃO DA TRIGGER (V4): Adiciona TRIM() na comparação para garantir o match
CREATE OR REPLACE FUNCTION handle_new_team_member() RETURNS TRIGGER AS $$
DECLARE member_record RECORD;
auth_user RECORD;
meta_plan TEXT;
meta_name TEXT;
BEGIN -- Busca ROBUSTA: Ignora case e espaços em branco
SELECT * INTO member_record
FROM team_members
WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
LIMIT 1;
-- Busca Metadados do Auth
SELECT * INTO auth_user
FROM auth.users
WHERE id = NEW.id;
IF auth_user IS NOT NULL THEN meta_plan := auth_user.raw_user_meta_data->>'plan';
meta_name := auth_user.raw_user_meta_data->>'name';
END IF;
-- Lógica de Atualização
IF member_record IS NOT NULL THEN
UPDATE team_members
SET user_id = NEW.id,
    status = 'ACTIVE',
    avatar_url = NEW.avatar_url
WHERE id = member_record.id;
UPDATE profiles
SET plan = COALESCE(
        meta_plan,
        member_record.assigned_plan_id,
        'CONVIDADO'
    ),
    is_invited_member = true,
    name = COALESCE(
        meta_name,
        member_record.name,
        NEW.name,
        'Usuário Convidado'
    )
WHERE id = NEW.id;
ELSIF meta_plan IS NOT NULL THEN
UPDATE profiles
SET plan = meta_plan,
    is_invited_member = true,
    name = COALESCE(meta_name, NEW.name, 'Usuário')
WHERE id = NEW.id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. FORÇA A CORREÇÃO DO USUÁRIO AKANE (Novamente, com TRIM/LOWER para garantir)
UPDATE profiles
SET plan = 'CONVIDADO',
    is_invited_member = true
WHERE LOWER(TRIM(email)) = 'akanestorepayments@gmail.com';
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{plan}',
        '"CONVIDADO"'
    )
WHERE LOWER(TRIM(email)) = 'akanestorepayments@gmail.com';