-- Migration: Add Missing Indexes (Performance Tuning)
-- Description: Adds covering indexes for foreign keys identified by Supabase Linter.
-- 1. audit_logs (actor_id)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
-- 2. feedbacks (author_id)
CREATE INDEX IF NOT EXISTS idx_feedbacks_author_id ON feedbacks(author_id);
-- 3. invoices (user_id)
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
-- 4. team_members (owner_id)
CREATE INDEX IF NOT EXISTS idx_team_members_owner_id ON team_members(owner_id);
-- 5. team_members (user_id)
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);