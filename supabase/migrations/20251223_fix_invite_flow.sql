-- 1. Add user_id column to team_members if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'user_id'
) THEN
ALTER TABLE team_members
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
END IF;
END $$;
-- 2. Add is_invited_member column to profiles if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'is_invited_member'
) THEN
ALTER TABLE profiles
ADD COLUMN is_invited_member BOOLEAN DEFAULT false;
END IF;
END $$;
-- 3. Create or Replace Function to handle new team members
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
-- Update the user's profile to reflect they are an invited member and set plan to CONVIDADO
UPDATE profiles
SET plan = 'CONVIDADO',
    is_invited_member = true
WHERE id = NEW.id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 4. Create Trigger on profiles table (fires after insert)
DROP TRIGGER IF EXISTS on_auth_user_created_link_team ON profiles;
CREATE TRIGGER on_auth_user_created_link_team
AFTER
INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION handle_new_team_member();
-- 5. Backfill: Link existing users to team_members
UPDATE team_members tm
SET user_id = p.id,
    status = 'ACTIVE'
FROM profiles p
WHERE tm.email = p.email
    AND tm.user_id IS NULL;
-- 6. Backfill: Ensure existing linked members have CONVIDADO plan if strictly invited
UPDATE profiles p
SET plan = 'CONVIDADO',
    is_invited_member = true
FROM team_members tm
WHERE p.id = tm.user_id
    AND p.plan = 'FREE';
-- Only upgrade FREE users, don't downgrade PRO/PREMIUM