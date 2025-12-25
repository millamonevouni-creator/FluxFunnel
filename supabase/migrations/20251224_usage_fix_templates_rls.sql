-- FIX: Allow Admins to Moderate Templates
-- Previously, only owners could update templates, causing Admin Moderation to fail silently (optimistic UI update masked the error).
create policy "Admins can update templates" on templates for
update to authenticated using (is_admin());
create policy "Admins can delete templates" on templates for delete to authenticated using (is_admin());
-- HOTFIX: Manually approve the stuck template
update templates
set status = 'APPROVED',
    is_public = true
where custom_label like '%Novo Projeto 1%';