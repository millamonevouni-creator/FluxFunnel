-- 1. Otimização de RLS na tabela PROFILES
-- Remove políticas redundantes para evitar múltiplos checks por query
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Admins can do everything on profiles" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Profiles Admin Ops" on profiles;
-- Criar políticas consolidadas e performáticas
-- Usamos (select auth.uid()) em vez de auth.uid() para evitar re-avaliação por linha
create policy "Profiles_Select_Policy" on profiles for
select to authenticated,
    anon using (
        (
            select auth.uid()
        ) = id
        or is_admin() = true
    );
create policy "Profiles_Update_Policy" on profiles for
update to authenticated using (
        (
            select auth.uid()
        ) = id
        or is_admin() = true
    );
create policy "Profiles_Delete_Policy" on profiles for delete to authenticated using (is_admin() = true);
create policy "Profiles_Insert_Policy" on profiles for
insert to authenticated with check (true);
-- 2. Otimização de Índices (Foreign Keys)
create index if not exists idx_audit_logs_actor_id on audit_logs(actor_id);
create index if not exists idx_team_members_user_id on team_members(user_id);
-- 3. Limpeza de Índices Não Utilizados (Opcional, mas recomendado pelo linter)
-- drop index if exists profiles_stripe_customer_id_idx;
-- drop index if exists idx_invoices_user;
-- drop index if exists idx_subscriptions_status;
-- drop index if exists idx_team_members_owner_id;