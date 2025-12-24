-- 20251223_fix_invite_plan_trigger.sql
-- Essa migration melhora a trigger de novos membros para usar os metadados do auth.users
-- Isso garante que se o convite (Edge Function) definiu o plano como CONVIDADO, ele será respeitado.
CREATE OR REPLACE FUNCTION handle_new_team_member() RETURNS TRIGGER AS $$
DECLARE member_record RECORD;
auth_user RECORD;
meta_plan TEXT;
meta_name TEXT;
BEGIN -- 1. Tentar pegar metadados brutos do auth.users (Fonte da verdade do Convite)
--    Segurança: Function é SECURITY DEFINER, então pode ler auth.users
SELECT * INTO auth_user
FROM auth.users
WHERE id = NEW.id;
IF auth_user IS NOT NULL THEN meta_plan := auth_user.raw_user_meta_data->>'plan';
meta_name := auth_user.raw_user_meta_data->>'name';
END IF;
-- 2. Verificar se existe convite pendente na tabela team_members
SELECT * INTO member_record
FROM team_members
WHERE email = NEW.email
LIMIT 1;
-- LÓGICA DE ATRIBUIÇÃO:
IF member_record IS NOT NULL THEN -- 2.1. Linkar usuário ao team_member
UPDATE team_members
SET user_id = NEW.id,
    status = 'ACTIVE',
    avatar_url = NEW.avatar_url
WHERE id = member_record.id;
-- 2.2. Atualizar perfil com dados do convite (Metadata tem prioridade, depois team_members)
UPDATE profiles
SET plan = COALESCE(
        meta_plan,
        member_record.assigned_plan_id,
        'CONVIDADO'
    ),
    is_invited_member = true,
    -- Prioridade Nome: Metadata > Team Member Record > Profile Existente > Fallback
    name = COALESCE(
        meta_name,
        member_record.name,
        NEW.name,
        'Usuário Convidado'
    )
WHERE id = NEW.id;
-- 3. Caso especial: Não achou em team_members, mas tem metadata de plano (Link direto?)
ELSIF meta_plan IS NOT NULL
AND meta_plan != 'FREE' THEN
UPDATE profiles
SET plan = meta_plan,
    is_invited_member = true,
    name = COALESCE(meta_name, NEW.name, 'Usuário')
WHERE id = NEW.id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Comentário para forçar atualização no Supabase se rodar via editor SQL
COMMENT ON FUNCTION handle_new_team_member IS 'V3: Uses auth.users metadata to guarantee CONVIDADO plan assignment';