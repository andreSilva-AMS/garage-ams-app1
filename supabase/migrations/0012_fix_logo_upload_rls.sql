-- =============================================================================
-- ReceptCar — Corrige l'upload du logo (RLS)
--
-- Bug : le bucket "garage-logos" n'avait que des policies INSERT et UPDATE,
-- pas de SELECT. Or l'upload du logo utilise upsert:true (contrairement aux
-- autres photos), ce qui se traduit côté Postgres par un
-- INSERT ... ON CONFLICT (bucket_id, name) DO UPDATE : Postgres a alors
-- besoin de la policy SELECT pour évaluer la ligne existante, même lors
-- d'un tout premier upload. Sans elle, l'écriture échoue avec
-- "new row violates row-level security policy".
-- =============================================================================

create policy "Voir le logo de son garage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'garage-logos'
    and (storage.foldername(name))[1] = public.current_garage_id()::text
  );

NOTIFY pgrst, 'reload schema';
