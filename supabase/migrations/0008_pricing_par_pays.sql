-- =============================================================================
-- ReceptCar — Tarifs HT par pays (non destructif)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Table de configuration des tarifs (1 ligne = 1 pays pris en charge).
--    Lecture publique (nécessaire avant inscription/connexion pour afficher
--    le prix), écriture réservée à l'administration (SQL Editor / service_role
--    uniquement — aucune policy d'insert/update/delete pour anon/authenticated,
--    volontairement, comme pour la table "subscriptions").
-- ---------------------------------------------------------------------------
create table public.pricing_plans (
  country_code text primary key,
  country_label text not null,
  currency text not null,
  amount_ht numeric(10, 2) not null,
  billing_period text not null default 'month',
  stripe_price_id text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.pricing_plans is
  'Tarif HT par pays de facturation. Source unique de vérité pour le prix affiché et le Stripe Price utilisé au paiement.';

insert into public.pricing_plans (country_code, country_label, currency, amount_ht, stripe_price_id) values
  ('CH', 'Suisse', 'CHF', 39.00, null),
  ('FR', 'France', 'EUR', 29.00, null),
  ('PT', 'Portugal', 'EUR', 19.00, null),
  ('ES', 'Espagne', 'EUR', 15.00, null);

alter table public.pricing_plans enable row level security;
alter table public.pricing_plans force row level security;

create policy "Tout le monde peut voir les tarifs actifs"
  on public.pricing_plans for select
  to anon, authenticated
  using (active = true);

-- ---------------------------------------------------------------------------
-- 2. Liste d'attente pour les pays non couverts (insertion publique, lecture
--    réservée à l'administration : on ne veut pas qu'une liste d'e-mails
--    soit lisible via l'API, même par un compte authentifié).
-- ---------------------------------------------------------------------------
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  country_code text,
  garage_name text,
  created_at timestamptz not null default now()
);

comment on table public.waitlist is
  'Demandes de garages situés dans un pays sans tarif publié.';

alter table public.waitlist enable row level security;
alter table public.waitlist force row level security;

create policy "S'inscrire à la liste d'attente"
  on public.waitlist for insert
  to anon, authenticated
  with check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(email) <= 254
    and (country_code is null or char_length(country_code) <= 10)
    and (garage_name is null or char_length(garage_name) <= 200)
  );

-- ---------------------------------------------------------------------------
-- 3. Pays de facturation du garage (déterminé à l'inscription, jamais par
--    IP). Colonne nullable : n'affecte aucun garage existant.
-- ---------------------------------------------------------------------------
alter table public.garages
  add column billing_country text references public.pricing_plans (country_code);

-- Le seul garage payant déjà existant (compte de test d'André) est
-- rattaché à la Suisse pour ne pas le laisser dans un état incomplet.
-- Garage AMS Automobiles (plan gratuit) n'a pas besoin de ce champ.
update public.garages
set billing_country = 'CH'
where trim(name) <> 'Garage AMS Automobiles' and payment_status <> 'free';

-- ---------------------------------------------------------------------------
-- 4. create_garage_and_owner : capture le pays de facturation choisi à
--    l'inscription et vérifie qu'il correspond à un tarif actif.
-- ---------------------------------------------------------------------------
drop function if exists public.create_garage_and_owner(text, text, text);

create or replace function public.create_garage_and_owner(
  garage_name text,
  owner_full_name text,
  garage_language text default 'fr',
  garage_billing_country text default null
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

  if garage_language not in ('fr', 'en', 'es', 'pt', 'de') then
    garage_language := 'fr';
  end if;

  if garage_billing_country is not null
     and not exists (
       select 1 from public.pricing_plans
       where country_code = garage_billing_country and active
     ) then
    raise exception 'Pays de facturation non pris en charge.';
  end if;

  insert into public.garages (name, default_language, billing_country, trial_ends_at)
  values (garage_name, garage_language, garage_billing_country, now() + interval '14 days')
  returning id into new_garage_id;

  insert into public.profiles (id, garage_id, role, full_name)
  values (auth.uid(), new_garage_id, 'owner', owner_full_name);

  return new_garage_id;
end;
$$;

-- Rappel (voir migrations 0006/0007) : toute fonction (re)créée dans ce
-- projet reçoit EXECUTE pour anon/public par défaut. On révoque
-- systématiquement pour ne garder que "authenticated".
revoke execute on function public.create_garage_and_owner(text, text, text, text) from public, anon;
grant execute on function public.create_garage_and_owner(text, text, text, text) to authenticated;

NOTIFY pgrst, 'reload schema';
