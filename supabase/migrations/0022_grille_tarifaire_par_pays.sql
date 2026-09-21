-- =============================================================================
-- ReceptCar — Grille tarifaire par pays (remplace le tarif "autre pays" unique)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Retrait du tarif fourre-tout "EU" : un pays hors grille est désormais
--    refusé à l'inscription (voir create_garage_and_owner plus bas), plus
--    jamais rattaché à un tarif par défaut.
-- ---------------------------------------------------------------------------
delete from public.pricing_plans where is_fallback = true;

-- ---------------------------------------------------------------------------
-- 2. Une ligne par pays de la liste blanche (35), avec le flag "active" qui
--    pilote désormais réellement la disponibilité à l'inscription (lancement
--    limité à la Suisse + UE ; Royaume-Uni, Norvège, Islande, Liechtenstein,
--    Andorre, Monaco, Saint-Marin restent désactivés jusqu'à activation
--    manuelle). stripe_price_id est laissé à NULL : à compléter par un
--    UPDATE une fois les Price Stripe réels connus.
-- ---------------------------------------------------------------------------
insert into public.pricing_plans (country_code, country_label, currency, amount_ht, active) values
  ('CH', 'Suisse', 'CHF', 39.00, true),
  ('FR', 'France', 'EUR', 35.00, true),
  ('IT', 'Italie', 'EUR', 29.00, true),
  ('ES', 'Espagne', 'EUR', 29.00, true),
  ('PT', 'Portugal', 'EUR', 15.00, true),
  ('DE', 'Allemagne', 'EUR', 35.00, true),
  ('AT', 'Autriche', 'EUR', 35.00, true),
  ('BE', 'Belgique', 'EUR', 35.00, true),
  ('NL', 'Pays-Bas', 'EUR', 35.00, true),
  ('LU', 'Luxembourg', 'EUR', 35.00, true),
  ('IE', 'Irlande', 'EUR', 35.00, true),
  ('DK', 'Danemark', 'EUR', 35.00, true),
  ('SE', 'Suède', 'EUR', 35.00, true),
  ('FI', 'Finlande', 'EUR', 35.00, true),
  ('GB', 'Royaume-Uni', 'EUR', 35.00, false),
  ('NO', 'Norvège', 'EUR', 35.00, false),
  ('IS', 'Islande', 'EUR', 35.00, false),
  ('LI', 'Liechtenstein', 'EUR', 35.00, false),
  ('AD', 'Andorre', 'EUR', 35.00, false),
  ('MC', 'Monaco', 'EUR', 35.00, false),
  ('SM', 'Saint-Marin', 'EUR', 35.00, false),
  ('CZ', 'Tchéquie', 'EUR', 27.00, true),
  ('SI', 'Slovénie', 'EUR', 27.00, true),
  ('HR', 'Croatie', 'EUR', 27.00, true),
  ('GR', 'Grèce', 'EUR', 27.00, true),
  ('MT', 'Malte', 'EUR', 27.00, true),
  ('CY', 'Chypre', 'EUR', 27.00, true),
  ('EE', 'Estonie', 'EUR', 27.00, true),
  ('PL', 'Pologne', 'EUR', 19.00, true),
  ('SK', 'Slovaquie', 'EUR', 19.00, true),
  ('HU', 'Hongrie', 'EUR', 19.00, true),
  ('RO', 'Roumanie', 'EUR', 19.00, true),
  ('BG', 'Bulgarie', 'EUR', 19.00, true),
  ('LV', 'Lettonie', 'EUR', 19.00, true),
  ('LT', 'Lituanie', 'EUR', 19.00, true)
on conflict (country_code) do update set
  country_label = excluded.country_label,
  currency = excluded.currency,
  amount_ht = excluded.amount_ht,
  active = excluded.active;

-- ---------------------------------------------------------------------------
-- 3. create_garage_and_owner : la validation du pays se fait désormais
--    contre pricing_plans.active (au lieu d'une liste codée en dur), pour que
--    la bascule active/inactive par pays fasse réellement effet. Le message
--    d'erreur est un identifiant stable (BILLING_COUNTRY_UNSUPPORTED),
--    traduit et enrichi d'un lien de contact côté client (voir SignupForm).
-- ---------------------------------------------------------------------------
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

  if garage_language not in ('fr', 'en', 'es', 'pt', 'de', 'it') then
    garage_language := 'fr';
  end if;

  if garage_billing_country is null then
    raise exception 'Le pays de facturation est obligatoire.';
  end if;

  if not exists (
    select 1 from public.pricing_plans
    where country_code = garage_billing_country and active
  ) then
    raise exception 'BILLING_COUNTRY_UNSUPPORTED';
  end if;

  insert into public.garages (name, default_language, billing_country, trial_ends_at)
  values (garage_name, garage_language, garage_billing_country, now() + interval '14 days')
  returning id into new_garage_id;

  insert into public.profiles (id, garage_id, role, full_name)
  values (auth.uid(), new_garage_id, 'owner', owner_full_name);

  return new_garage_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Écart, jamais bloquant, entre le pays de facturation et le préfixe pays
--    du numéro de TVA renseigné dans Stripe Checkout (même logique que
--    checkout_country_mismatch, posé par le webhook). La Grèce (code pays
--    GR, préfixe TVA "EL") est traitée à part pour ne pas remonter de faux
--    positif.
-- ---------------------------------------------------------------------------
alter table public.garages
  add column vat_country_mismatch boolean not null default false;

NOTIFY pgrst, 'reload schema';
