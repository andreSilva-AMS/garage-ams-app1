-- =============================================================================
-- ReceptCar — Sécurité : révocation EXECUTE public sur les fonctions
-- SECURITY DEFINER exposées par erreur via l'API REST (alertes Supabase
-- anon_security_definer_function_executable /
-- authenticated_security_definer_function_executable).
--
-- Postgres accorde EXECUTE à PUBLIC par défaut à la création d'une fonction ;
-- ces migrations ne l'avaient jamais révoqué. N'importe qui pouvait donc
-- appeler create_garage_and_owner / current_garage_id / current_user_role
-- via /rest/v1/rpc/<nom>, y compris sans être connecté.
-- =============================================================================

revoke execute on function public.create_garage_and_owner(text, text, text) from public;
revoke execute on function public.current_garage_id() from public;
revoke execute on function public.current_user_role() from public;

grant execute on function public.create_garage_and_owner(text, text, text) to authenticated;
grant execute on function public.current_garage_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;

NOTIFY pgrst, 'reload schema';
