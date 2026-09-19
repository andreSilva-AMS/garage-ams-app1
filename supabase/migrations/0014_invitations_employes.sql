-- =============================================================================
-- ReceptCar — Inviter des employés à rejoindre le garage
-- Non destructif : nouvelle table + nouvelle fonction uniquement, aucune
-- table ni colonne existante modifiée.
-- =============================================================================

create table public.garage_invites (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages (id) on delete cascade,
  email text not null,
  role text not null check (role in ('mechanic', 'reception')),
  token uuid not null default gen_random_uuid(),
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz
);

comment on table public.garage_invites is
  'Invitation envoyée par un propriétaire pour qu''un employé rejoigne son garage.';

create unique index garage_invites_token_idx on public.garage_invites (token);
create index garage_invites_garage_id_idx on public.garage_invites (garage_id);

alter table public.garage_invites enable row level security;
alter table public.garage_invites force row level security;

-- Seul le propriétaire voit/crée les invitations de SON garage. Aucune policy
-- SELECT par token : la page d'acceptation (avant connexion au garage) passe
-- par le client "service role" côté serveur, jamais exposé au navigateur.
create policy "Le propriétaire voit les invitations de son garage"
  on public.garage_invites for select
  to authenticated
  using (garage_id = public.current_garage_id() and public.current_user_role() = 'owner');

create policy "Le propriétaire invite pour son garage"
  on public.garage_invites for insert
  to authenticated
  with check (garage_id = public.current_garage_id() and public.current_user_role() = 'owner');

-- ---------------------------------------------------------------------------
-- Fonction d'acceptation : rattache le compte connecté (déjà créé via
-- supabase.auth.signUp côté client) au garage de l'invitation, avec le rôle
-- prévu. Vérifie que l'invitation existe, n'est pas expirée/déjà utilisée, et
-- que l'e-mail du compte correspond bien à celui invité.
-- ---------------------------------------------------------------------------
create or replace function public.accept_garage_invite(
  p_token uuid,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.garage_invites%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Vous devez être connecté.';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Ce compte est déjà rattaché à un garage.';
  end if;

  select * into v_invite from public.garage_invites where token = p_token;
  if not found then
    raise exception 'Invitation introuvable.';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'Cette invitation a déjà été utilisée.';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'Cette invitation a expiré.';
  end if;

  select email into v_email from auth.users where id = auth.uid();
  if v_email is distinct from v_invite.email then
    raise exception 'Cette invitation ne correspond pas à votre adresse e-mail.';
  end if;

  insert into public.profiles (id, garage_id, role, full_name)
  values (auth.uid(), v_invite.garage_id, v_invite.role, p_full_name);

  update public.garage_invites set accepted_at = now() where id = v_invite.id;

  return v_invite.garage_id;
end;
$$;

revoke execute on function public.accept_garage_invite(uuid, text) from public, anon;
grant execute on function public.accept_garage_invite(uuid, text) to authenticated;

NOTIFY pgrst, 'reload schema';
