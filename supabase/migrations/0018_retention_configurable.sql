-- =============================================================================
-- ReceptCar — Phase 4 : durée de conservation configurable par garage
-- Non destructif : nouvelle colonne avec valeur par défaut, aucune donnée
-- existante modifiée. 30 jours par défaut ; 365 jours (12 mois) réservé aux
-- garages avec un accès actif (payant ou gratuit permanent) — appliqué côté
-- application (settings), pas par une contrainte SQL.
-- =============================================================================

alter table public.garages add column if not exists retention_days integer
  not null default 30
  check (retention_days in (30, 365));

NOTIFY pgrst, 'reload schema';
