-- =============================================================================
-- ReceptCar — Photos de dégâts supplémentaires (jusqu'à 10 par fiche)
-- Non destructif : nouvelle table uniquement, aucune colonne existante
-- modifiée. Les fichiers utilisent le même bucket "receptions" et donc les
-- mêmes policies de stockage déjà en place (dossier <garage_id>/<reception_id>).
-- =============================================================================

create table public.reception_extra_photos (
  id uuid primary key default gen_random_uuid(),
  reception_id uuid not null references public.receptions (id) on delete cascade,
  garage_id uuid not null references public.garages (id) on delete cascade,
  storage_path text not null,
  caption text,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.reception_extra_photos is
  'Photos de dégâts additionnelles (au-delà des 4 angles + carte grise), jusqu''à 10 par fiche.';

create index reception_extra_photos_reception_id_idx
  on public.reception_extra_photos (reception_id);

alter table public.reception_extra_photos enable row level security;
alter table public.reception_extra_photos force row level security;

create policy "Voir les photos supplémentaires de son garage"
  on public.reception_extra_photos for select
  to authenticated
  using (garage_id = public.current_garage_id());

create policy "Ajouter des photos supplémentaires pour son garage"
  on public.reception_extra_photos for insert
  to authenticated
  with check (garage_id = public.current_garage_id());

NOTIFY pgrst, 'reload schema';
