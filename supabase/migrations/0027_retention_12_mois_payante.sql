-- =============================================================================
-- ReceptCar — Option "rétention 12 mois" facturée (ligne ajoutée à
-- l'abonnement Stripe existant, pas un paiement séparé).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Prix du supplément par pays, dans la même table que le tarif de base
--    (même devise que amount_ht). Calculé à ~20% du tarif de base, arrondi,
--    validé par André :
--    CH 39 -> 8 ; FR/Europe de l'Ouest 35 -> 7 ; IT/ES 29 -> 6 ;
--    Europe centrale/Sud 27 -> 5 ; Europe de l'Est 19 -> 4 ; Portugal 15 -> 3.
-- ---------------------------------------------------------------------------
alter table public.pricing_plans
  add column retention_365_amount_ht numeric(10, 2),
  add column retention_365_stripe_price_id text;

update public.pricing_plans set retention_365_amount_ht = case amount_ht
  when 39.00 then 8.00
  when 35.00 then 7.00
  when 29.00 then 6.00
  when 27.00 then 5.00
  when 19.00 then 4.00
  when 15.00 then 3.00
  else null
end;

comment on column public.pricing_plans.retention_365_amount_ht is
  'Supplément mensuel HT pour la rétention 12 mois (option), même devise que amount_ht.';
comment on column public.pricing_plans.retention_365_stripe_price_id is
  'Price Stripe du supplément rétention 12 mois pour ce pays (ligne ajoutée à l''abonnement existant).';

-- ---------------------------------------------------------------------------
-- 2. Garages : identifiant de la ligne d'abonnement Stripe pour cette option,
--    nécessaire pour la retirer précisément (stripe.subscriptionItems.del)
--    sans avoir à relister les lignes de l'abonnement à chaque fois.
-- ---------------------------------------------------------------------------
alter table public.garages add column retention_item_id text;

comment on column public.garages.retention_item_id is
  'ID de la ligne d''abonnement Stripe ("si_...") pour l''option rétention 12 mois, si active.';

NOTIFY pgrst, 'reload schema';
