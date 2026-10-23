"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Lang } from "@/lib/receptions/i18n";

type InviteRole = "mechanic" | "reception" | "seller";

const ROLE_LABEL: Record<Lang, Record<InviteRole, string>> = {
  fr: { mechanic: "Mécanicien", reception: "Réception", seller: "Vendeur" },
  en: { mechanic: "Mechanic", reception: "Reception", seller: "Seller" },
  es: { mechanic: "Mecánico", reception: "Recepción", seller: "Vendedor" },
  pt: { mechanic: "Mecânico", reception: "Receção", seller: "Vendedor" },
  de: { mechanic: "Mechaniker", reception: "Empfang", seller: "Verkäufer" },
  it: { mechanic: "Meccanico", reception: "Reception", seller: "Venditore" },
  sq: { mechanic: "Mekanik", reception: "Pranim", seller: "Shitës" },
  el: { mechanic: "Μηχανικός", reception: "Υποδοχή", seller: "Πωλητής" },
  ru: { mechanic: "Механик", reception: "Приёмка", seller: "Продавец" },
};

const INVITE_EMAIL: Record<
  Lang,
  { subject: (garageName: string) => string; body: (garageName: string, roles: string, url: string) => string }
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
  sq: {
    subject: (g) => `Ftesë për t'u bashkuar me ${g} në ReceptCar`,
    body: (g, role, url) =>
      `Jeni ftuar të bashkoheni me ekipin "${g}" në ReceptCar si ${role}.\n\nPër të krijuar llogarinë tuaj, klikoni në këtë lidhje:\n${url}\n\nKjo lidhje do të skadojë pas 7 ditësh.`,
  },
  el: {
    subject: (g) => `Πρόσκληση για συμμετοχή στο ${g} μέσω του ReceptCar`,
    body: (g, role, url) =>
      `Έχετε προσκληθεί να γίνετε μέλος της ομάδας «${g}» στο ReceptCar, με την ιδιότητα του ${role}.\n\nΓια να δημιουργήσετε τον λογαριασμό σας, κάντε κλικ στον παρακάτω σύνδεσμο:\n${url}\n\nΟ σύνδεσμος αυτός λήγει σε 7 ημέρες.`,
  },
  ru: {
    subject: (g) => `Приглашение присоединиться к ${g} на ReceptCar`,
    body: (g, role, url) =>
      `Вас пригласили присоединиться к команде «${g}» на ReceptCar в качестве ${role}.\n\nЧтобы создать учетную запись, перейдите по этой ссылке:\n${url}\n\nСрок действия этой ссылки истекает через 7 дней.`,
  },
};

export async function inviteEmployee(
  email: string,
  roles: InviteRole[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Vous devez être connecté." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, roles")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.roles.includes("owner")) {
    return { ok: false, error: "Seul le propriétaire peut inviter des employés." };
  }

  if (roles.length === 0) {
    return { ok: false, error: "Au moins un rôle doit être sélectionné." };
  }

  const { data: garage } = await supabase
    .from("garages")
    .select("name, default_language, has_workshop, has_sales")
    .eq("id", profile.garage_id)
    .single();
  if (!garage) return { ok: false, error: "Garage introuvable." };

  const allowedRoles: InviteRole[] = [
    ...(garage.has_workshop ? (["reception", "mechanic"] as const) : []),
    ...(garage.has_sales ? (["seller"] as const) : []),
  ];
  if (roles.some((r) => !allowedRoles.includes(r))) {
    return { ok: false, error: "Rôle non autorisé pour les activités de ce garage." };
  }

  const { data: invite, error: insertError } = await supabase
    .from("garage_invites")
    .insert({ garage_id: profile.garage_id, email, roles, invited_by: user.id })
    .select("token")
    .single();
  if (insertError || !invite) {
    return { ok: false, error: insertError?.message ?? "Impossible de créer l'invitation." };
  }

  const lang = (garage.default_language as Lang) ?? "fr";
  const t = INVITE_EMAIL[lang] ?? INVITE_EMAIL.fr;
  const roleLabel = roles.map((r) => (ROLE_LABEL[lang] ?? ROLE_LABEL.fr)[r]).join(", ");
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

/**
 * Annule une invitation en attente. S'appuie sur la policy RLS "owner-only"
 * de garage_invites (voir migration 0030) plutôt que sur un client
 * service-role : pas de privilège à élever pour cette opération.
 * Supprimer la ligne invalide le lien déjà envoyé (la page /join cherche
 * l'invitation par token ; absente, elle affiche "invitation invalide").
 */
export async function cancelInvite(inviteId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Vous devez être connecté." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, roles")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.roles.includes("owner")) {
    return { ok: false, error: "Seul le propriétaire peut annuler une invitation." };
  }

  const { error } = await supabase
    .from("garage_invites")
    .delete()
    .eq("id", inviteId)
    .eq("garage_id", profile.garage_id);
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Retire l'accès d'un employé : coupe l'accès immédiatement (suppression du
 * profil, donc plus aucune policy RLS basée sur current_garage_id() ne le
 * reconnaît), efface son adresse e-mail et supprime son compte d'authentif-
 * ication. Dans ce modèle de données, un profil = un seul garage (pas de
 * table d'appartenance multi-garage), donc "n'appartient à aucun autre
 * garage" est toujours vrai ici — on supprime systématiquement le compte via
 * l'API Admin plutôt que de le laisser orphelin (ce qui créerait un risque :
 * ensureProfile() recréerait un garage ou une invitation au prochain login).
 * Les fiches déjà créées par cette personne restent (created_by passe à NULL
 * via la contrainte existante, voir 0002/0026) ; leur nom est figé dans
 * creator_name_snapshot avant la suppression du profil.
 *
 * Utilise le client service-role car aucune policy RLS n'autorise la
 * suppression d'un profil ou l'appel à l'API Admin : l'autorisation réelle
 * (le vérificateur "est owner du même garage, pas soi-même, garage garde
 * ≥1 owner") est faite ici, en code, avant d'utiliser ce client.
 */
export async function removeMember(memberId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Vous devez être connecté." };

  if (memberId === user.id) {
    return { ok: false, error: "Vous ne pouvez pas vous retirer vous-même." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, roles")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.roles.includes("owner")) {
    return { ok: false, error: "Seul le propriétaire peut retirer un employé." };
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("garage_id, full_name, roles")
    .eq("id", memberId)
    .single();
  if (!target || target.garage_id !== profile.garage_id) {
    return { ok: false, error: "Employé introuvable." };
  }

  if (target.roles.includes("owner")) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("garage_id", profile.garage_id)
      .contains("roles", ["owner"]);
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "Un garage doit toujours garder au moins un propriétaire." };
    }
  }

  const service = createServiceClient();

  await service
    .from("receptions")
    .update({ creator_name_snapshot: target.full_name })
    .eq("garage_id", profile.garage_id)
    .eq("created_by", memberId);
  await service
    .from("consignments")
    .update({ creator_name_snapshot: target.full_name })
    .eq("garage_id", profile.garage_id)
    .eq("created_by", memberId);

  const { error: deleteProfileError } = await service.from("profiles").delete().eq("id", memberId);
  if (deleteProfileError) {
    return { ok: false, error: deleteProfileError.message };
  }

  const { error: deleteUserError } = await service.auth.admin.deleteUser(memberId);
  if (deleteUserError) {
    return { ok: false, error: deleteUserError.message };
  }

  return { ok: true };
}
