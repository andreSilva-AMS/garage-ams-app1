-- =============================================================================
-- ReceptCar — Sécurité (complément) : révocation EXECUTE explicite du rôle
-- "anon" sur les mêmes fonctions.
--
-- Constat en vérifiant les droits réels (pg_proc.proacl) après la migration
-- 0006 : le rôle "anon" avait encore EXECUTE, en plus de PUBLIC. Supabase
-- accorde par défaut EXECUTE explicitement à anon/authenticated/service_role
-- sur toute nouvelle fonction du schéma "public" (ALTER DEFAULT PRIVILEGES
-- au niveau du projet), indépendamment du droit implicite de PUBLIC. Il faut
-- donc révoquer anon séparément.
-- =============================================================================

revoke execute on function public.create_garage_and_owner(text, text, text) from anon;
revoke execute on function public.current_garage_id() from anon;
revoke execute on function public.current_user_role() from anon;

NOTIFY pgrst, 'reload schema';
