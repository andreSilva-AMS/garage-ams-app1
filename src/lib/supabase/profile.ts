import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Filet de sécurité : si un utilisateur est authentifié mais n'a pas encore
 * de profil (cas d'une inscription avec confirmation par e-mail : le profil
 * n'a pu être créé qu'après retour de confirmation), on le crée ici à partir
 * des informations stockées lors de l'inscription (user_metadata).
 *
 * Retourne directement le profil (existant ou nouvellement créé) : pour le
 * cas courant d'un utilisateur qui a déjà un profil, cela évite à l'appelant
 * une seconde lecture de "profiles" juste après (une requête réseau de moins
 * à chaque chargement du tableau de bord).
 */
export async function ensureProfile(supabase: SupabaseClient, user: User) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("garage_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const fullName = user.user_metadata?.full_name as string | undefined;
  const inviteToken = user.user_metadata?.invite_token as string | undefined;

  if (inviteToken) {
    await supabase.rpc("accept_garage_invite", {
      p_token: inviteToken,
      p_full_name: fullName ?? null,
    });
  } else {
    const garageName = user.user_metadata?.garage_name as string | undefined;
    const preferredLanguage = user.user_metadata?.preferred_language as string | undefined;
    const billingCountry = user.user_metadata?.billing_country as string | undefined;

    if (!garageName) return null;

    await supabase.rpc("create_garage_and_owner", {
      garage_name: garageName,
      owner_full_name: fullName ?? null,
      garage_language: preferredLanguage ?? "fr",
      garage_billing_country: billingCountry ?? null,
    });
  }

  const { data: created } = await supabase
    .from("profiles")
    .select("garage_id, role")
    .eq("id", user.id)
    .maybeSingle();

  return created;
}
