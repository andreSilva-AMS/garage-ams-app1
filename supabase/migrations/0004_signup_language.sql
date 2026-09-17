-- =============================================================================
-- Garage AMS — Langue choisie à l'inscription
-- À exécuter une fois dans : Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================================

-- On recrée la fonction avec un paramètre supplémentaire "garage_language",
-- utilisé pour initialiser default_language dès la création du garage
-- (au lieu de toujours démarrer sur 'fr'). Une signature différente crée une
-- nouvelle fonction en PostgreSQL : on supprime donc explicitement l'ancienne
-- version à 2 paramètres pour éviter d'avoir les deux en même temps.
drop function if exists public.create_garage_and_owner(text, text);

create or replace function public.create_garage_and_owner(
  garage_name text,
  owner_full_name text,
  garage_language text default 'fr'
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

  insert into public.garages (name, default_language)
  values (garage_name, garage_language)
  returning id into new_garage_id;

  insert into public.profiles (id, garage_id, role, full_name)
  values (auth.uid(), new_garage_id, 'owner', owner_full_name);

  return new_garage_id;
end;
$$;

grant execute on function public.create_garage_and_owner(text, text, text) to authenticated;

NOTIFY pgrst, 'reload schema';
