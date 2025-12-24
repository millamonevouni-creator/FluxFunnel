-- 20251223_fix_plan_final.sql
-- 1. Corrige a TRIGGER para ser Case-Insensitive (ignorar maiúsculas/minúsculas no email)
CREATE OR REPLACE FUNCTION handle_new_team_member() RETURNS TRIGGER AS $$
DECLARE member_record RECORD;
auth_user RECORD;
meta_plan TEXT;
meta_name TEXT;
BEGIN -- Busca Case-Insensitive no team_members
SELECT * INTO member_record
FROM team_members
WHERE LOWER(email) = LOWER(NEW.email)
LIMIT 1;
-- Busca Metadados do Auth
SELECT * INTO auth_user
FROM auth.users
WHERE id = NEW.id;
IF auth_user IS NOT NULL THEN meta_plan := auth_user.raw_user_meta_data->>'plan';
meta_name := auth_user.raw_user_meta_data->>'name';
END IF;
-- Lógica de Atualização
IF member_record IS NOT NULL THEN -- Link Team Member
UPDATE team_members
SET user_id = NEW.id,
    status = 'ACTIVE',
    avatar_url = NEW.avatar_url
WHERE id = member_record.id;
-- Update Profile
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
ELSIF meta_plan IS NOT NULL THEN -- Caso tenha metadata mas não achou team_member (borda)
UPDATE profiles
SET plan = meta_plan,
    is_invited_member = true,
    name = COALESCE(meta_name, NEW.name, 'Usuário')
WHERE id = NEW.id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 2. CORREÇÃO IMEDIATA PARA O USUÁRIO ATUAL (akanestorepayments@gmail.com)
-- Força o plano para CONVIDADO agora mesmo.
UPDATE profiles
SET plan = 'CONVIDADO',
    is_invited_member = true
WHERE email ILIKE 'akanestorepayments@gmail.com';
-- 3. Garante que os metadados do Auth também estejam sincronizados (opcional, mas bom pra consistência)
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"plan": "CONVIDADO"}'::jsonb
WHERE email ILIKE 'akanestorepayments@gmail.com';