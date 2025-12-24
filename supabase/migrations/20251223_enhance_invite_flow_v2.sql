-- 1. Add 'name' column to 'team_members' if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'name'
) THEN
ALTER TABLE team_members
ADD COLUMN name TEXT;
END IF;
END $$;
-- 2. Update/Redefine Function to handle new team members with Name snyc and Strict Plan Assignment
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
-- CRITICAL:
-- 1. Update Profile Plan to 'CONVIDADO'
-- 2. Mark as invited member
-- 3. Pre-fill Name if provided in invite (and profile doesn't have a custom one yet, or just overwrite for consistency)
UPDATE profiles
SET plan = 'CONVIDADO',
    is_invited_member = true,
    -- Use the name from team_members if available, otherwise keep existing (or default)
    name = COALESCE(member_record.name, NEW.name, 'Usuário')
WHERE id = NEW.id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. Ensure Trigger is active (re-create just to be safe, though REPLACE FUNCTION works instantly)
DROP TRIGGER IF EXISTS on_auth_user_created_link_team ON profiles;
CREATE TRIGGER on_auth_user_created_link_team
AFTER
INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION handle_new_team_member();