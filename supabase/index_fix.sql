-- INDEX OPTIMIZATION SCRIPT
-- Addresses "Unindexed foreign keys" warning.

-- 1. Create index for team_members(owner_id)
-- This improves performance when looking up members of a specific team owner.
create index if not exists idx_team_members_owner_id on team_members(owner_id);

-- NOTE ON "Unused Index" (idx_templates_owner_id):
-- The linter flagged 'idx_templates_owner_id' as unused.
-- Ideally, you should KEEP this index because your app definitely filters templates by owner (e.g., "My Templates").
-- It might show as "unused" simply because you haven't performed many searches on templates recently.
-- Removing it might cause performance issues later when you have more templates.
