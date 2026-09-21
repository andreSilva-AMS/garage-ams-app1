-- =============================================================================
-- ReceptCar — admin_add_admin par e-mail (plus pratique côté interface : pas
-- besoin de connaître l'UUID d'un compte pour le promouvoir admin).
-- =============================================================================

drop function if exists public.admin_add_admin(uuid, text);

create or replace function public.admin_add_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'Réservé aux administrateurs de la plateforme.';
  end if;

  select id into target_id from auth.users where email = target_email;
  if target_id is null then
    raise exception 'Aucun compte existant pour cet e-mail. La personne doit d''abord créer un compte.';
  end if;

  insert into public.platform_admins (user_id, email, role, added_by)
  values (target_id, target_email, 'admin', auth.uid())
  on conflict (user_id) do nothing;

  insert into public.admin_audit_log (admin_user_id, action, details)
  values (
    auth.uid(), 'admin_added',
    jsonb_build_object('target_user_id', target_id, 'target_email', target_email)
  );
end;
$$;

revoke execute on function public.admin_add_admin(text) from public, anon;
grant execute on function public.admin_add_admin(text) to authenticated;

NOTIFY pgrst, 'reload schema';
