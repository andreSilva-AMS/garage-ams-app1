"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import type { Lang } from "@/lib/receptions/i18n";

type InviteRole = "mechanic" | "reception";

const ROLE_LABEL: Record<Lang, Record<InviteRole, string>> = {
  fr: { mechanic: "Mécanicien", reception: "Réception" },
  en: { mechanic: "Mechanic", reception: "Reception" },
  es: { mechanic: "Mecánico", reception: "Recepción" },
  pt: { mechanic: "Mecânico", reception: "Receção" },
  de: { mechanic: "Mechaniker", reception: "Empfang" },
  it: { mechanic: "Meccanico", reception: "Reception" },
};

const INVITE_EMAIL: Record<
  Lang,
  { subject: (garageName: string) => string; body: (garageName: string, role: string, url: string) => string }
> = {
  fr: {
    subject: (g) => `Invitation à rejoindre ${g} sur ReceptCar`,
    body: (g, role, url) =>
      `Vous avez été invité(e) à rejoindre l'équipe de "${g}" sur ReceptCar, en tant que ${role}.\n\nPour créer votre compte, cliquez sur ce lien :\n${url}\n\nCe lien expire dans 7 jours.`,
  },
  en: {
    subject: (g) => `Invitation to join ${g} on ReceptCar`,
    body: (g, role, url) =>
      `You've been invited to join the "${g}" team on ReceptCar, as ${role}.\n\nTo create your account, click this link:\n${url}\n\nThis link expires in 7 days.`,
  },
  es: {
    subject: (g) => `Invitación para unirse a ${g} en ReceptCar`,
    body: (g, role, url) =>
      `Ha sido invitado/a a unirse al equipo de "${g}" en ReceptCar, como ${role}.\n\nPara crear su cuenta, haga clic en este enlace:\n${url}\n\nEste enlace caduca en 7 días.`,
  },
  pt: {
    subject: (g) => `Convite para se juntar a ${g} no ReceptCar`,
    body: (g, role, url) =>
      `Foi convidado(a) para se juntar à equipa de "${g}" no ReceptCar, como ${role}.\n\nPara criar a sua conta, clique neste link:\n${url}\n\nEste link expira em 7 dias.`,
  },
  de: {
    subject: (g) => `Einladung zu ${g} auf ReceptCar`,
    body: (g, role, url) =>
      `Sie wurden eingeladen, dem Team von "${g}" auf ReceptCar beizutreten, als ${role}.\n\nUm Ihr Konto zu erstellen, klicken Sie auf diesen Link:\n${url}\n\nDieser Link läuft in 7 Tagen ab.`,
  },
  it: {
    subject: (g) => `Invito a unirti a ${g} su ReceptCar`,
    body: (g, role, url) =>
      `Sei stato invitato a unirti al team di "${g}" su ReceptCar, come ${role}.\n\nPer creare il tuo account, clicca su questo link:\n${url}\n\nQuesto link scade tra 7 giorni.`,
  },
};

export async function inviteEmployee(
  email: string,
  role: InviteRole,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Vous devez être connecté." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "owner") {
    return { ok: false, error: "Seul le propriétaire peut inviter des employés." };
  }

  const { data: garage } = await supabase
    .from("garages")
    .select("name, default_language")
    .eq("id", profile.garage_id)
    .single();
  if (!garage) return { ok: false, error: "Garage introuvable." };

  const { data: invite, error: insertError } = await supabase
    .from("garage_invites")
    .insert({ garage_id: profile.garage_id, email, role, invited_by: user.id })
    .select("token")
    .single();
  if (insertError || !invite) {
    return { ok: false, error: insertError?.message ?? "Impossible de créer l'invitation." };
  }

  const lang = (garage.default_language as Lang) ?? "fr";
  const t = INVITE_EMAIL[lang] ?? INVITE_EMAIL.fr;
  const roleLabel = (ROLE_LABEL[lang] ?? ROLE_LABEL.fr)[role];
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join?token=${invite.token}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromAddress =
    (process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev").match(/<([^>]+)>/)?.[1] ??
    process.env.RESEND_FROM_EMAIL ??
    "onboarding@resend.dev";

  const { error: sendError } = await resend.emails.send({
    from: `${garage.name} <${fromAddress}>`,
    to: [email],
    replyTo: user.email ?? undefined,
    subject: t.subject(garage.name),
    text: t.body(garage.name, roleLabel, joinUrl),
  });
  if (sendError) {
    return { ok: false, error: sendError.message };
  }

  return { ok: true };
}
