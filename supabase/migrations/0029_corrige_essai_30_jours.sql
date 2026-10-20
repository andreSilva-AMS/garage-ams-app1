-- ---------------------------------------------------------------------------
-- Corrige deux bugs de create_garage_and_owner_v3 (même signature, donc
-- create or replace suffit, pas besoin d'un _v4) :
--
-- 1. L'essai gratuit annoncé partout (page d'accueil, inscription, CGU) est
--    de 30 jours, mais la fonction accordait en réalité 14 jours depuis sa
--    toute première version (jamais mis à jour quand la durée annoncée est
--    passée de 14 à 30 jours).
-- 2. La liste des langues valides n'incluait pas l'albanais, le grec et le
--    russe (ajoutés après coup à l'application) : un garage inscrit dans
--    l'une de ces langues se retrouvait silencieusement basculé en français.
-- ---------------------------------------------------------------------------
create or replace function public.create_garage_and_owner_v3(
  garage_name text,
  owner_full_name text,
  garage_language text,
  garage_billing_country text,
  p_has_workshop boolean,
  p_has_sales boolean,
  p_address_street text,
  p_address_postal_code text,
  p_address_city text
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

  if garage_language not in ('fr', 'en', 'es', 'pt', 'de', 'it', 'sq', 'el', 'ru') then
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

  if coalesce(trim(p_address_street), '') = ''
     or coalesce(trim(p_address_postal_code), '') = ''
     or coalesce(trim(p_address_city), '') = '' then
    raise exception 'L''adresse du garage est obligatoire.';
  end if;

  if p_has_workshop then
    owner_roles := owner_roles || array['reception', 'mechanic'];
  end if;
  if p_has_sales then
    owner_roles := owner_roles || array['seller'];
  end if;

  insert into public.garages (
    name, default_language, billing_country, trial_ends_at, has_workshop, has_sales,
    address_street, address_postal_code, address_city
  )
  values (
    garage_name, garage_language, garage_billing_country, now() + interval '30 days', p_has_workshop, p_has_sales,
    p_address_street, p_address_postal_code, p_address_city
  )
  returning id into new_garage_id;

  insert into public.profiles (id, garage_id, roles, full_name)
  values (auth.uid(), new_garage_id, owner_roles, owner_full_name);

  return new_garage_id;
end;
$$;
