-- Create notifications table
create table if not exists notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade,
    title text not null,
    message text not null,
    type text not null,
    -- FEEDBACK_REPLY, STATUS_CHANGE, SYSTEM_ANNOUNCEMENT
    is_read boolean default false,
    related_entity_id uuid,
    -- e.g., feedback_id
    created_at timestamptz default now()
);
-- Enable RLS
alter table notifications enable row level security;
-- Policies
create policy "Users can view their own notifications" on notifications for
select using (auth.uid() = user_id);
create policy "Admins can create notifications" on notifications for
insert with check (
        exists (
            select 1
            from profiles
            where id = auth.uid()
                and is_system_admin = true
        )
    );
-- Indexes
create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_is_read on notifications(is_read);