-- =============================================================================
-- ReceptCar — Permettre la suppression d'une fiche de réception
-- Non destructif : ajoute uniquement des policies RLS manquantes (aucune
-- table ni colonne modifiée). Sans ces policies, DELETE est refusé par
-- défaut par Row Level Security, même pour le propriétaire des données.
-- =============================================================================

create policy "Supprimer les réceptions de son garage"
  on public.receptions for delete
  to authenticated
  using (garage_id = public.current_garage_id());

create policy "Supprimer les fichiers de son garage"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'receptions'
    and (storage.foldername(name))[1] = public.current_garage_id()::text
  );

NOTIFY pgrst, 'reload schema';
