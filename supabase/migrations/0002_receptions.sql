-- =============================================================================
-- Garage AMS — Module Réception véhicule (Phase 2)
-- À exécuter une fois dans : Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Ajout de l'allemand aux langues disponibles (garage + réceptions)
-- ---------------------------------------------------------------------------
alter table public.garages drop constraint garages_default_language_check;
alter table public.garages add constraint garages_default_language_check
  check (default_language in ('fr', 'en', 'es', 'pt', 'de'));

-- ---------------------------------------------------------------------------
-- 1. Table des fiches de réception
-- ---------------------------------------------------------------------------
create table public.receptions (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,

  -- Client
  client_name text not null,
  client_phone text,
  client_email text,

  -- Véhicule
  vehicle_plate text not null,
  vehicle_mileage integer,
  vehicle_brand_model text,

  -- Dommages constatés (étiquettes standard + texte libre)
  damage_tags text[] not null default '{}',
  damage_text text,

  -- Travaux demandés (étiquettes standard + texte libre)
  work_tags text[] not null default '{}',
  work_text text,

  -- Langue du document envoyé au client
  language text not null default 'fr'
    check (language in ('fr', 'en', 'es', 'pt', 'de')),

  -- Chemins des fichiers dans le bucket de stockage "receptions"
  photo_front_path text,
  photo_back_path text,
  photo_left_path text,
  photo_right_path text,
  photo_card_grey_path text,
  signature_path text,
  pdf_path text,

  -- Suivi de l'envoi e-mail
  email_sent_at timestamptz,

  created_at timestamptz not null default now()
);

comment on table public.receptions is 'Une fiche de réception véhicule, rattachée à garage_id.';

create index receptions_garage_id_idx on public.receptions (garage_id);

-- ---------------------------------------------------------------------------
-- 2. Row Level Security : même principe que pour les autres tables.
-- ---------------------------------------------------------------------------
alter table public.receptions enable row level security;
alter table public.receptions force row level security;

create policy "Voir les réceptions de son garage"
  on public.receptions for select
  to authenticated
  using (garage_id = public.current_garage_id());

create policy "Créer une réception pour son garage"
  on public.receptions for insert
  to authenticated
  with check (garage_id = public.current_garage_id());

create policy "Modifier les réceptions de son garage"
  on public.receptions for update
  to authenticated
  using (garage_id = public.current_garage_id())
  with check (garage_id = public.current_garage_id());

-- ---------------------------------------------------------------------------
-- 3. Stockage des fichiers (photos, signature, PDF)
--    Un seul bucket privé "receptions". Chaque fichier est rangé sous
--    <garage_id>/<reception_id>/nom-du-fichier, ce qui permet d'appliquer
--    la même isolation par garage que pour les tables.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('receptions', 'receptions', false)
on conflict (id) do nothing;

create policy "Voir les fichiers de son garage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'receptions'
    and (storage.foldername(name))[1] = public.current_garage_id()::text
  );

create policy "Uploader des fichiers pour son garage"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'receptions'
    and (storage.foldername(name))[1] = public.current_garage_id()::text
  );

create policy "Mettre à jour les fichiers de son garage"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'receptions'
    and (storage.foldername(name))[1] = public.current_garage_id()::text
  );

-- ---------------------------------------------------------------------------
-- 4. Rappel : ne pas oublier de recharger le cache de l'API après cette
--    migration (même commande que lors de la Phase 1) :
--    NOTIFY pgrst, 'reload schema';
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
