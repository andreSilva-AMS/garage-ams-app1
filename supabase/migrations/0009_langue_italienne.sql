-- =============================================================================
-- ReceptCar — Ajout de l'italien aux langues disponibles (non destructif)
-- =============================================================================

alter table public.garages drop constraint garages_default_language_check;
alter table public.garages add constraint garages_default_language_check
  check (default_language in ('fr', 'en', 'es', 'pt', 'de', 'it'));

alter table public.receptions drop constraint receptions_language_check;
alter table public.receptions add constraint receptions_language_check
  check (language in ('fr', 'en', 'es', 'pt', 'de', 'it'));

drop function if exists public.create_garage_and_owner(text, text, text, text);

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

revoke execute on function public.create_garage_and_owner(text, text, text, text) from public, anon;
grant execute on function public.create_garage_and_owner(text, text, text, text) to authenticated;

NOTIFY pgrst, 'reload schema';
