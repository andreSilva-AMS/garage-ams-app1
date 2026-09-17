-- =============================================================================
-- Garage AMS — Fondations multi-garage (Phase 1)
-- À exécuter une fois dans : Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Table des garages (un enregistrement par client/entreprise abonnée)
-- ---------------------------------------------------------------------------
create table public.garages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  logo_url text,
  default_language text not null default 'fr'
    check (default_language in ('fr', 'en', 'es', 'pt')),
  franchise_amount numeric(10, 2) not null default 0,
  subscription_plan text not null default 'trial',
  payment_status text not null default 'trialing',
  created_at timestamptz not null default now()
);

comment on table public.garages is 'Un garage = un client (tenant) de la plateforme.';

-- ---------------------------------------------------------------------------
-- 2. Table des profils utilisateurs (1 profil = 1 compte auth Supabase)
--    Chaque profil est rattaché à exactement un garage.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  garage_id uuid not null references public.garages (id) on delete cascade,
  role text not null default 'reception'
    check (role in ('owner', 'mechanic', 'reception')),
  full_name text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Rattache chaque utilisateur authentifié à un garage_id et un rôle.';

create index profiles_garage_id_idx on public.profiles (garage_id);

-- ---------------------------------------------------------------------------
-- 3. Fonctions utilitaires (SECURITY DEFINER)
--    Elles lisent le garage_id / rôle de l'utilisateur connecté SANS
--    déclencher les policies RLS de "profiles" elles-mêmes (ce qui créerait
--    une boucle infinie). On les utilise ensuite DANS les policies.
-- ---------------------------------------------------------------------------
create or replace function public.current_garage_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select garage_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- 4. Activation de Row Level Security : sans policy explicite, PERSONNE
--    (à part le rôle admin "service_role") ne peut lire ou écrire.
-- ---------------------------------------------------------------------------
alter table public.garages enable row level security;
alter table public.garages force row level security;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

-- ---------------------------------------------------------------------------
-- 5. Policies : chaque garage ne voit QUE ses propres données.
-- ---------------------------------------------------------------------------

-- Un utilisateur connecté peut voir son propre garage, et uniquement celui-ci.
create policy "Voir son propre garage"
  on public.garages for select
  to authenticated
  using (id = public.current_garage_id());

-- Seul le propriétaire ("owner") peut modifier les infos du garage.
create policy "Le propriétaire modifie son garage"
  on public.garages for update
  to authenticated
  using (id = public.current_garage_id() and public.current_user_role() = 'owner')
  with check (id = public.current_garage_id() and public.current_user_role() = 'owner');

-- Un utilisateur connecté voit les profils de SON garage uniquement
-- (utile plus tard pour afficher la liste de l'équipe).
create policy "Voir les collègues du même garage"
  on public.profiles for select
  to authenticated
  using (garage_id = public.current_garage_id());

-- Remarque : il n'y a volontairement AUCUNE policy INSERT sur "garages" ou
-- "profiles" pour les utilisateurs normaux. La création d'un garage se fait
-- exclusivement via la fonction contrôlée ci-dessous, pour empêcher un
-- utilisateur de s'inventer un garage_id arbitraire ou de rejoindre un
-- garage qui n'est pas le sien.

-- ---------------------------------------------------------------------------
-- 6. Fonction d'inscription : crée le garage ET le compte propriétaire
--    en une seule opération atomique. Appelée depuis l'app juste après
--    supabase.auth.signUp().
-- ---------------------------------------------------------------------------
create or replace function public.create_garage_and_owner(
  garage_name text,
  owner_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_garage_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Vous devez être connecté pour créer un garage.';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Ce compte est déjà rattaché à un garage.';
  end if;

  insert into public.garages (name)
  values (garage_name)
  returning id into new_garage_id;

  insert into public.profiles (id, garage_id, role, full_name)
  values (auth.uid(), new_garage_id, 'owner', owner_full_name);

  return new_garage_id;
end;
$$;

grant execute on function public.create_garage_and_owner(text, text) to authenticated;
