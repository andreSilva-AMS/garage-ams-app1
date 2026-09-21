-- =============================================================================
-- ReceptCar — Assistant de première connexion (Phase E)
-- =============================================================================

alter table public.garages
  add column onboarding_completed boolean not null default false;

-- Rétroactif : les garages déjà en activité ne doivent pas se voir imposer
-- l'assistant de première connexion au prochain chargement du tableau de bord.
update public.garages
set onboarding_completed = true;

NOTIFY pgrst, 'reload schema';
