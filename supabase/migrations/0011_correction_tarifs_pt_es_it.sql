-- =============================================================================
-- ReceptCar — Correction tarifs Portugal/Espagne + ajout Italie
-- Portugal et Espagne avaient été inversés lors de la saisie initiale.
-- =============================================================================

update public.pricing_plans set amount_ht = 15.00 where country_code = 'PT';
update public.pricing_plans set amount_ht = 19.00 where country_code = 'ES';

insert into public.pricing_plans (country_code, country_label, currency, amount_ht, stripe_price_id)
values ('IT', 'Italie', 'EUR', 19.00, null)
on conflict (country_code) do nothing;
