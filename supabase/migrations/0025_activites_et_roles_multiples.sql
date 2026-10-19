-- =============================================================================
-- ReceptCar — Activités d'entreprise (atelier / vente) + rôles multiples
-- Fondations du module dépôt-vente : aucune table de réception existante
-- n'est modifiée, aucune donnée perdue.
--
-- Note d'application : plusieurs instructions DROP (policy/function) ont
-- échoué de façon répétée via l'outil d'application de migrations pendant le
-- déploiement (timeout systématique, sans blocage visible côté base — cause
-- non identifiée, probablement l'outil lui-même). Contournements choisis,
-- documentés ci-dessous à chaque fois : ALTER POLICY au lieu de DROP+CREATE,
-- et renommage de la nouvelle fonction en *_v2 au lieu de remplacer
-- l'ancienne. Nettoyage (colonnes/fonctions orphelines ci-dessous) à faire
-- dans une migration ultérieure une fois l'outil stabilisé.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Activités du garage. Les garages déjà créés passent automatiquement en
--    atelier uniquement (valeur par défaut appliquée rétroactivement par
--    ADD COLUMN ... DEFAULT, qui backfill toutes les lignes existantes).
-- ---------------------------------------------------------------------------
alter table public.garages
  add column has_workshop boolean not null default true,
  add column has_sales boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. Rôles multiples par utilisateur. profiles.roles (tableau) remplace
--    profiles.role (un seul rôle) : un même compte peut être par exemple à la
--    fois mécanicien ET réceptionniste. 'seller' est ajouté pour le
--    dépôt-vente. Les comptes existants gardent exactement leur rôle actuel
--    (converti en tableau à un seul élément).
--
--    profiles.role (l'ancienne colonne) est volontairement CONSERVÉE pour
--    l'instant (DROP COLUMN a échoué à l'application, voir note en tête de
--    fichier) : elle garde son défaut ('reception'), n'est plus lue par
--    aucune policy ni par le code applicatif, donc inoffensive. À supprimer
--    dans une migration de nettoyage ultérieure.
-- ---------------------------------------------------------------------------
alter table public.profiles add column roles text[];
update public.profiles set roles = array[role];
alter table public.profiles alter column roles set not null;
alter table public.profiles add constraint profiles_roles_check
  check (
    array_length(roles, 1) > 0
    and roles <@ array['owner', 'mechanic', 'reception', 'seller']
  );

-- ---------------------------------------------------------------------------
-- 3. current_user_roles() (tableau) : nouvelle fonction utilisée par les 3
--    policies ci-dessous à la place de current_user_role(). L'ancienne
--    fonction current_user_role() est conservée (DROP a échoué, voir note en
--    tête de fichier) : plus référencée par aucune policy, inoffensive.
--
--    Les 3 policies sont mises à jour via ALTER POLICY (et non DROP+CREATE,
--    qui échouait systématiquement à l'application) : une clause USING/WITH
--    CHECK peut être changée sans recréer la policy.
-- ---------------------------------------------------------------------------
create or replace function public.current_user_roles()
returns text[]
language sql
security definer
set search_path = public
stable
as $$
  select roles from public.profiles where id = auth.uid();
$$;

revoke execute on function public.current_user_roles() from public, anon;
grant execute on function public.current_user_roles() to authenticated;

alter policy "Le propriétaire modifie son garage" on public.garages
  using (id = public.current_garage_id() and 'owner' = any(public.current_user_roles()))
  with check (id = public.current_garage_id() and 'owner' = any(public.current_user_roles()));

alter policy "Le propriétaire voit les invitations de son garage" on public.garage_invites
  using (garage_id = public.current_garage_id() and 'owner' = any(public.current_user_roles()));

alter policy "Le propriétaire invite pour son garage" on public.garage_invites
  with check (garage_id = public.current_garage_id() and 'owner' = any(public.current_user_roles()));

-- ---------------------------------------------------------------------------
-- 4. garage_invites.roles (tableau), + rôle "seller" possible. L'ancienne
--    colonne "role" est conservée mais rendue NULLABLE (plus de défaut, donc
--    DROP NOT NULL plutôt que DROP COLUMN, qui échouait à l'application) :
--    le code applicatif ne l'alimente plus, elle restera NULL pour toute
--    nouvelle invitation. Table vide au moment de cette migration (aucune
--    invitation en attente), donc pas de backfill nécessaire.
-- ---------------------------------------------------------------------------
alter table public.garage_invites add column roles text[];
alter table public.garage_invites alter column roles set not null;
alter table public.garage_invites add constraint garage_invites_roles_check
  check (
    array_length(roles, 1) > 0
    and roles <@ array['mechanic', 'reception', 'seller']
  );
alter table public.garage_invites alter column role drop not null;

-- ---------------------------------------------------------------------------
-- 5. create_garage_and_owner_v2 : accepte les activités cochées à
--    l'inscription et calcule les rôles initiaux de l'administrateur en
--    fonction de celles-ci (ex. atelier seul -> owner+reception+mechanic).
--
--    Nommée _v2 (et non un simple remplacement de create_garage_and_owner)
--    car DROP FUNCTION sur l'ancienne signature à 4 arguments échouait
--    systématiquement à l'application, et faire coexister les deux sous le
--    même nom (même avec des arguments supplémentaires non optionnels)
--    s'est révélé ambigu pour PostgREST ("is not unique") : le nouveau nom
--    évite tout risque de casser les inscriptions déjà en production pendant
--    la bascule. L'ancienne fonction create_garage_and_owner (4 arguments)
--    est conservée telle quelle, inchangée, pour ne rien casser avant que
--    tout le code appelant soit mis à jour ; à supprimer ensuite.
-- ---------------------------------------------------------------------------
create or replace function public.create_garage_and_owner_v2(
  garage_name text,
  owner_full_name text,
  garage_language text,
  garage_billing_country text,
  p_has_workshop boolean,
  p_has_sales boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_garage_id uuid;
  owner_roles text[] := array['owner'];
begin
  if auth.uid() is null then
    raise exception 'Vous devez être connecté pour créer un garage.';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Ce compte est déjà rattaché à un garage.';
  end if;

  if garage_language not in ('fr', 'en', 'es', 'pt', 'de', 'it') then
    garage_language := 'fr';
  end if;

  if garage_billing_country is null then
    raise exception 'Le pays de facturation est obligatoire.';
  end if;

  if garage_billing_country not in (
    'CH', 'FR', 'PT', 'ES', 'IT',
    'DE', 'AT', 'BE', 'NL', 'LU', 'GB', 'IE', 'DK', 'SE', 'NO', 'FI', 'IS',
    'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'RO', 'BG', 'GR', 'MT', 'CY',
    'EE', 'LV', 'LT', 'LI', 'AD', 'MC', 'SM'
  ) then
    raise exception 'Pays de facturation non pris en charge.';
  end if;

  if not p_has_workshop and not p_has_sales then
    raise exception 'Au moins une activité (atelier ou vente) doit être sélectionnée.';
  end if;

  if p_has_workshop then
    owner_roles := owner_roles || array['reception', 'mechanic'];
  end if;
  if p_has_sales then
    owner_roles := owner_roles || array['seller'];
  end if;

  insert into public.garages (name, default_language, billing_country, trial_ends_at, has_workshop, has_sales)
  values (garage_name, garage_language, garage_billing_country, now() + interval '14 days', p_has_workshop, p_has_sales)
  returning id into new_garage_id;

  insert into public.profiles (id, garage_id, roles, full_name)
  values (auth.uid(), new_garage_id, owner_roles, owner_full_name);

  return new_garage_id;
end;
$$;

revoke execute on function public.create_garage_and_owner_v2(text, text, text, text, boolean, boolean) from public, anon;
grant execute on function public.create_garage_and_owner_v2(text, text, text, text, boolean, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. accept_garage_invite : insère "roles" (tableau) au lieu de "role".
-- ---------------------------------------------------------------------------
create or replace function public.accept_garage_invite(
  p_token uuid,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.garage_invites%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Vous devez être connecté.';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Ce compte est déjà rattaché à un garage.';
  end if;

  select * into v_invite from public.garage_invites where token = p_token;
  if not found then
    raise exception 'Invitation introuvable.';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'Cette invitation a déjà été utilisée.';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'Cette invitation a expiré.';
  end if;

  select email into v_email from auth.users where id = auth.uid();
  if v_email is distinct from v_invite.email then
    raise exception 'Cette invitation ne correspond pas à votre adresse e-mail.';
  end if;

  insert into public.profiles (id, garage_id, roles, full_name)
  values (auth.uid(), v_invite.garage_id, v_invite.roles, p_full_name);

  update public.garage_invites set accepted_at = now() where id = v_invite.id;

  return v_invite.garage_id;
end;
$$;

revoke execute on function public.accept_garage_invite(uuid, text) from public, anon;
grant execute on function public.accept_garage_invite(uuid, text) to authenticated;

NOTIFY pgrst, 'reload schema';
