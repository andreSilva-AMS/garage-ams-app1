-- ---------------------------------------------------------------------------
-- Adresse structurée du garage (rue/numéro, code postal, localité) au lieu
-- d'un seul champ texte libre : plus propre pour les PDF de contrat et
-- utilisable directement comme adresse du client Stripe (nécessaire au
-- calcul automatique de TVA). L'ancien champ "address" (texte libre) est
-- conservé tel quel pour compatibilité, mais n'est plus affiché ni rempli
-- une fois cette migration en place.
-- ---------------------------------------------------------------------------

alter table public.garages
  add column if not exists address_street text,
  add column if not exists address_postal_code text,
  add column if not exists address_city text;

-- ---------------------------------------------------------------------------
-- create_garage_and_owner_v3 : ajoute les 3 champs d'adresse structurée à
-- l'inscription. Nommée _v3 (et non une modification de _v2) pour la même
-- raison que le passage _v2 -> _v3 précédent : éviter tout risque sur les
-- inscriptions déjà en production pendant la bascule du code appelant.
-- _v2 reste inchangée, à supprimer plus tard une fois tout le code migré.
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
    garage_name, garage_language, garage_billing_country, now() + interval '14 days', p_has_workshop, p_has_sales,
    p_address_street, p_address_postal_code, p_address_city
  )
  returning id into new_garage_id;

  insert into public.profiles (id, garage_id, roles, full_name)
  values (auth.uid(), new_garage_id, owner_roles, owner_full_name);

  return new_garage_id;
end;
$$;

revoke execute on function public.create_garage_and_owner_v3(
  text, text, text, text, boolean, boolean, text, text, text
) from public, anon;
grant execute on function public.create_garage_and_owner_v3(
  text, text, text, text, boolean, boolean, text, text, text
) to authenticated;
