-- =============================================================================
-- Garage AMS — Facturation (Phase 5)
-- À exécuter une fois dans : Supabase Dashboard > SQL Editor > New query > Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Colonnes de facturation sur les garages
-- ---------------------------------------------------------------------------
alter table public.garages
  add column stripe_customer_id text,
  add column trial_ends_at timestamptz;

alter table public.garages
  add constraint garages_payment_status_check
  check (payment_status in ('trialing', 'active', 'past_due', 'canceled', 'free'));

-- ---------------------------------------------------------------------------
-- 2. Historique des abonnements Stripe
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is 'Reflet local des abonnements Stripe, mis à jour par le webhook.';

create index subscriptions_garage_id_idx on public.subscriptions (garage_id);

alter table public.subscriptions enable row level security;
alter table public.subscriptions force row level security;

-- Lecture seule pour les membres du garage concerné. Toute écriture passe
-- exclusivement par le webhook Stripe, avec la clé service_role (qui
-- contourne RLS) — aucune policy d'insert/update/delete n'est nécessaire ici.
create policy "Voir l'abonnement de son garage"
  on public.subscriptions for select
  to authenticated
  using (garage_id = public.current_garage_id());

-- ---------------------------------------------------------------------------
-- 3. Essai gratuit de 14 jours à la création du garage, et plan gratuit
--    permanent pour Garage AMS Automobiles (le garage du créateur du produit).
-- ---------------------------------------------------------------------------
create or replace function public.create_garage_and_owner(
  garage_name text,
  owner_full_name text,
  garage_language text default 'fr'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_garage_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Vous devez être connecté pour créer un garage.';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Ce compte est déjà rattaché à un garage.';
  end if;

  if garage_language not in ('fr', 'en', 'es', 'pt', 'de') then
    garage_language := 'fr';
  end if;

  insert into public.garages (name, default_language, trial_ends_at)
  values (garage_name, garage_language, now() + interval '14 days')
  returning id into new_garage_id;

  insert into public.profiles (id, garage_id, role, full_name)
  values (auth.uid(), new_garage_id, 'owner', owner_full_name);

  return new_garage_id;
end;
$$;

grant execute on function public.create_garage_and_owner(text, text, text) to authenticated;

-- Garage AMS Automobiles : plan gratuit permanent, aucun passage par Stripe.
update public.garages
set subscription_plan = 'free', payment_status = 'free', trial_ends_at = null
where name = 'Garage AMS Automobiles';

NOTIFY pgrst, 'reload schema';
