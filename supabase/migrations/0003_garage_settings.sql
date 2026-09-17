-- =============================================================================
-- Garage AMS — Réglages du garage : logo (Phase 4, anticipée)
-- À exécuter une fois dans : Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Bucket public pour les logos de garage.
--    Public en LECTURE (le logo doit pouvoir s'afficher sans authentification,
--    par ex. dans un e-mail envoyé au client), mais l'ÉCRITURE reste limitée
--    aux membres du garage concerné, comme pour le bucket "receptions".
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('garage-logos', 'garage-logos', true)
on conflict (id) do nothing;

create policy "Uploader le logo de son garage"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'garage-logos'
    and (storage.foldername(name))[1] = public.current_garage_id()::text
  );

create policy "Remplacer le logo de son garage"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'garage-logos'
    and (storage.foldername(name))[1] = public.current_garage_id()::text
  );

NOTIFY pgrst, 'reload schema';
