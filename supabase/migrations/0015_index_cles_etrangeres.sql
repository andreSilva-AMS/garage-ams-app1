-- =============================================================================
-- ReceptCar — Index manquants sur les clés étrangères (performance)
-- Non destructif : ajoute uniquement des index, aucune donnée touchée.
-- Repéré par l'audit de performance Supabase (unindexed_foreign_keys).
-- =============================================================================

create index if not exists garage_invites_invited_by_idx
  on public.garage_invites (invited_by);

create index if not exists garages_billing_country_idx
  on public.garages (billing_country);

create index if not exists reception_extra_photos_garage_id_idx
  on public.reception_extra_photos (garage_id);

create index if not exists receptions_created_by_idx
  on public.receptions (created_by);
