-- =============================================================================
-- ReceptCar — Retrait d'un employé + annulation d'une invitation
-- Non destructif : nouvelles colonnes nullables + nouvelle policy uniquement.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Nom du créateur figé au moment du retrait d'un employé. created_by est
--    déjà en ON DELETE SET NULL sur ces deux tables (voir 0002/0026) : la
--    fiche survit déjà à la suppression du profil. Cette colonne permet,
--    au moment du retrait (action serveur), de garder un nom affichable même
--    une fois created_by repassé à NULL. Aucune UI n'affiche aujourd'hui le
--    créateur d'une fiche ; la colonne existe pour que ce soit possible sans
--    perdre l'information le jour où ce sera ajouté.
-- ---------------------------------------------------------------------------
alter table public.receptions add column creator_name_snapshot text;
alter table public.consignments add column creator_name_snapshot text;

-- ---------------------------------------------------------------------------
-- 2. Annulation d'invitation : aucune policy DELETE n'existait sur
--    garage_invites (seulement SELECT/INSERT, voir 0014). Le propriétaire
--    doit pouvoir annuler une invitation de SON garage, ce qui invalide le
--    lien envoyé (la page /join cherche l'invitation par token : si la ligne
--    n'existe plus, elle affiche "invitation invalide").
-- ---------------------------------------------------------------------------
create policy "Le propriétaire annule les invitations de son garage"
  on public.garage_invites for delete
  to authenticated
  using (garage_id = public.current_garage_id() and 'owner' = any(public.current_user_roles()));

NOTIFY pgrst, 'reload schema';
