-- 1. Add 'assigned_plan_id' column to 'team_members'
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'assigned_plan_id'
) THEN
ALTER TABLE team_members
ADD COLUMN assigned_plan_id TEXT DEFAULT 'CONVIDADO';
END IF;
END $$;
-- 2. Update Function to respect assigned_plan_id
CREATE OR REPLACE FUNCTION handle_new_team_member() RETURNS TRIGGER AS $$
DECLARE member_record RECORD;
BEGIN -- Check if the new user's email exists in team_members
SELECT * INTO member_record
FROM team_members
WHERE email = NEW.email
LIMIT 1;
IF member_record IS NOT NULL THEN -- Link the user to the team member record
UPDATE team_members
SET user_id = NEW.id,
    status = 'ACTIVE',
    avatar_url = NEW.avatar_url
WHERE id = member_record.id;
-- Update Profile Plan based on invite configuration
-- If assigned_plan_id is present, force that plan.
-- Otherwise default to 'CONVIDADO' (legacy behavior support)
UPDATE profiles
SET plan = COALESCE(member_record.assigned_plan_id, 'CONVIDADO'),
    is_invited_member = true,
    name = COALESCE(member_record.name, NEW.name, 'Usuário')
WHERE id = NEW.id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;