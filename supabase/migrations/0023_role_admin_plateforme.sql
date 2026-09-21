-- =============================================================================
-- ReceptCar — Rôle admin plateforme (commit 1/5)
-- Comptes avec accès à /admin, indépendants des garages : un admin n'a jamais
-- de ligne dans "profiles", donc n'apparaît jamais dans "Équipe du garage"
-- d'un client (qui ne lit que profiles, filtré par garage_id).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Table des admins plateforme.
-- ---------------------------------------------------------------------------
create table public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin')),
  added_at timestamptz not null default now(),
  added_by uuid references auth.users (id)
);

comment on table public.platform_admins is
  'Comptes avec accès à /admin. Indépendante de garages/profiles : jamais de garage_id.';

-- ---------------------------------------------------------------------------
-- 2. Journal d'audit des actions admin (qui, quoi, quand, sur quel garage).
--    Écriture UNIQUEMENT via les fonctions SECURITY DEFINER ci-dessous —
--    aucune policy INSERT n'est accordée directement, pour qu'une action
--    admin ne puisse jamais contourner la journalisation.
-- ---------------------------------------------------------------------------
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users (id),
  action text not null,
  target_garage_id uuid references public.garages (id),
  details jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_target_garage_idx on public.admin_audit_log (target_garage_id);
create index admin_audit_log_admin_user_idx on public.admin_audit_log (admin_user_id);

-- ---------------------------------------------------------------------------
-- 3. Fonction utilitaire SECURITY DEFINER (même schéma que current_garage_id()
--    / current_user_role() dans la migration 0001) : lit platform_admins SANS
--    déclencher ses propres policies RLS, pour éviter toute récursion quand
--    on l'utilise DANS une policy de platform_admins.
-- ---------------------------------------------------------------------------
create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid());
$$;

revoke execute on function public.is_platform_admin() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. RLS.
-- ---------------------------------------------------------------------------
alter table public.platform_admins enable row level security;
alter table public.platform_admins force row level security;

create policy "Un admin voit la liste des admins"
  on public.platform_admins for select
  to authenticated
  using (public.is_platform_admin());

alter table public.admin_audit_log enable row level security;
alter table public.admin_audit_log force row level security;

create policy "Un admin voit le journal d'audit"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_platform_admin());

-- Lecture seule de TOUS les garages / réceptions pour un admin — en plus des
-- policies existantes ("Voir son propre garage" / "Voir les réceptions de
-- son garage"), jamais à leur place : un garage normal ne voit toujours que
-- le sien. Aucune policy INSERT/UPDATE/DELETE n'est accordée aux admins sur
-- receptions : impossible de modifier une fiche, même par erreur.
create policy "Un admin voit tous les garages"
  on public.garages for select
  to authenticated
  using (public.is_platform_admin());

create policy "Un admin voit toutes les réceptions"
  on public.receptions for select
  to authenticated
  using (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- 5. Le trigger qui protège billing_country (migration 0019) laisse
--    désormais passer un admin plateforme, en plus du service_role.
-- ---------------------------------------------------------------------------
create or replace function public.protect_billing_country()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if NEW.billing_country is distinct from OLD.billing_country
     and OLD.billing_country is not null
     and auth.role() in ('authenticated', 'anon')
     and not public.is_platform_admin() then
    raise exception 'Le pays de facturation ne peut être modifié que par l''administration.';
  end if;
  return NEW;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Actions admin sensibles : chacune vérifie l'appartenance à
--    platform_admins, fait le changement, ET journalise dans le même appel
--    (atomique — impossible d'oublier de logguer). Le pays et le statut TVA
--    ne sont donc modifiables par un admin QUE via ces fonctions, jamais par
--    un UPDATE direct depuis le client.
-- ---------------------------------------------------------------------------
create or replace function public.admin_update_billing_country(
  target_garage_id uuid,
  new_country text,
  reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Réservé aux administrateurs de la plateforme.';
  end if;

  update public.garages set billing_country = new_country where id = target_garage_id;

  insert into public.admin_audit_log (admin_user_id, action, target_garage_id, details)
  values (
    auth.uid(), 'billing_country_change', target_garage_id,
    jsonb_build_object('new_country', new_country, 'reason', reason)
  );
end;
$$;

revoke execute on function public.admin_update_billing_country(uuid, text, text) from public, anon;
grant execute on function public.admin_update_billing_country(uuid, text, text) to authenticated;

create or replace function public.admin_add_admin(target_user_id uuid, target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Réservé aux administrateurs de la plateforme.';
  end if;

  insert into public.platform_admins (user_id, email, role, added_by)
  values (target_user_id, target_email, 'admin', auth.uid());

  insert into public.admin_audit_log (admin_user_id, action, details)
  values (
    auth.uid(), 'admin_added',
    jsonb_build_object('target_user_id', target_user_id, 'target_email', target_email)
  );
end;
$$;

revoke execute on function public.admin_add_admin(uuid, text) from public, anon;
grant execute on function public.admin_add_admin(uuid, text) to authenticated;

create or replace function public.admin_remove_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Réservé aux administrateurs de la plateforme.';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Impossible de se retirer soi-même de la liste des admins.';
  end if;

  delete from public.platform_admins where user_id = target_user_id;

  insert into public.admin_audit_log (admin_user_id, action, details)
  values (auth.uid(), 'admin_removed', jsonb_build_object('target_user_id', target_user_id));
end;
$$;

revoke execute on function public.admin_remove_admin(uuid) from public, anon;
grant execute on function public.admin_remove_admin(uuid) to authenticated;

-- Journalise chaque consultation des réceptions d'un garage par un admin
-- (pas seulement les modifications, qui de toute façon ne sont pas permises).
create or replace function public.admin_log_reception_view(target_garage_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Réservé aux administrateurs de la plateforme.';
  end if;

  insert into public.admin_audit_log (admin_user_id, action, target_garage_id)
  values (auth.uid(), 'receptions_viewed', target_garage_id);
end;
$$;

revoke execute on function public.admin_log_reception_view(uuid) from public, anon;
grant execute on function public.admin_log_reception_view(uuid) to authenticated;

NOTIFY pgrst, 'reload schema';
