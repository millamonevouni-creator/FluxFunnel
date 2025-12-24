-- Add author_id to feedbacks table if it doesn't exist
alter table feedbacks
add column if not exists author_id uuid references auth.users on delete
set null;
-- Update existing feedbacks with a system user or leave null
-- (Optional: link by name if possible, but safer to start clean for new entries)
-- Create index for performance
create index if not exists idx_feedbacks_author_id on feedbacks(author_id);