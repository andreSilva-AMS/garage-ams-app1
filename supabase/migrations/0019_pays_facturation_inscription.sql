-- =============================================================================
-- ReceptCar — Pays de facturation choisi à l'inscription (non destructif)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. billing_country n'est plus limité aux pays ayant un tarif dédié (la
--    contrainte de clé étrangère vers pricing_plans empêchait tout autre
--    pays européen). Remplacée par une liste blanche de pays européens.
-- ---------------------------------------------------------------------------
alter table public.garages drop constraint garages_billing_country_fkey;

alter table public.garages add constraint garages_billing_country_check
  check (
    billing_country is null or billing_country in (
      'CH', 'FR', 'PT', 'ES', 'IT',
      'DE', 'AT', 'BE', 'NL', 'LU', 'GB', 'IE', 'DK', 'SE', 'NO', 'FI', 'IS',
      'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'RO', 'BG', 'GR', 'MT', 'CY',
      'EE', 'LV', 'LT', 'LI', 'AD', 'MC', 'SM'
    )
  );

-- ---------------------------------------------------------------------------
-- 2. Tarif « autre pays » pour les pays européens sans tarif dédié. Valeur
--    par défaut : même tarif que la France — À CONFIRMER par André.
-- ---------------------------------------------------------------------------
alter table public.pricing_plans add column is_fallback boolean not null default false;

insert into public.pricing_plans (country_code, country_label, currency, amount_ht, is_fallback) values
  ('EU', 'Autre pays européen', 'EUR', 29.00, true);

comment on column public.pricing_plans.is_fallback is
  'Tarif utilisé quand le pays de facturation du garage n''a pas de ligne dédiée dans cette table. Une seule ligne doit porter is_fallback = true.';

-- ---------------------------------------------------------------------------
-- 3. Nouvelles colonnes garages : écart pays carte / pays garage constaté au
--    paiement (signalé, jamais bloquant), et numéro de TVA/entreprise
--    facultatif collecté par Stripe Checkout.
-- ---------------------------------------------------------------------------
alter table public.garages
  add column checkout_billing_address_country text,
  add column checkout_country_mismatch boolean not null default false,
  add column vat_number text;

-- ---------------------------------------------------------------------------
-- 4. billing_country n'est modifiable qu'une fois librement (premier choix,
--    à l'inscription ou lors du premier paiement pour les garages créés
--    avant cette fonctionnalité). Au-delà, seule l'administration (SQL
--    Editor / service_role, jamais une requête authentifiée classique via
--    l'app) peut le changer.
-- ---------------------------------------------------------------------------
create or replace function public.protect_billing_country()
returns trigger
language plpgsql
as $$
begin
  if NEW.billing_country is distinct from OLD.billing_country
     and OLD.billing_country is not null
     and auth.role() in ('authenticated', 'anon') then
    raise exception 'Le pays de facturation ne peut être modifié que par l''administration.';
  end if;
  return NEW;
end;
$$;

drop trigger if exists protect_billing_country_trigger on public.garages;
create trigger protect_billing_country_trigger
before update on public.garages
for each row
execute function public.protect_billing_country();

-- ---------------------------------------------------------------------------
-- 5. create_garage_and_owner : le pays de facturation devient obligatoire,
--    validé contre la même liste blanche que la contrainte ci-dessus (et non
--    plus contre pricing_plans, pour ne pas exiger un tarif dédié).
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

  if garage_billing_country not in (
    'CH', 'FR', 'PT', 'ES', 'IT',
    'DE', 'AT', 'BE', 'NL', 'LU', 'GB', 'IE', 'DK', 'SE', 'NO', 'FI', 'IS',
    'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'RO', 'BG', 'GR', 'MT', 'CY',
    'EE', 'LV', 'LT', 'LI', 'AD', 'MC', 'SM'
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

revoke execute on function public.create_garage_and_owner(text, text, text, text) from public, anon;
grant execute on function public.create_garage_and_owner(text, text, text, text) to authenticated;

NOTIFY pgrst, 'reload schema';
