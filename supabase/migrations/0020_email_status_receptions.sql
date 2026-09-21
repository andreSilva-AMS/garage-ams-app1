-- =============================================================================
-- ReceptCar — Statut d'envoi e-mail des fiches (pour affichage tableau de bord)
-- =============================================================================

alter table public.receptions
  add column email_status text check (email_status in ('sent', 'failed'));

-- Rétroactif : les fiches déjà marquées envoyées (email_sent_at renseigné)
-- passent à 'sent' pour rester cohérentes avec le nouvel indicateur.
update public.receptions
set email_status = 'sent'
where email_sent_at is not null;

NOTIFY pgrst, 'reload schema';
