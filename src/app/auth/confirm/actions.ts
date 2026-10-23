"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Consomme le token de confirmation (inscription, invitation employé ou
 * réinitialisation de mot de passe — tous passent par ce même mécanisme).
 * Appelée uniquement au clic sur « Confirmer mon compte », jamais au simple
 * chargement de la page : un lien qui agirait dès le GET serait consommé par
 * les scanners de sécurité des messageries (Outlook Safe Links, Gmail, etc.)
 * avant que l'utilisateur ne clique lui-même, ce qui grillait le lien à usage
 * unique et bloquait toute confirmation.
 *
 * Redirige systématiquement vers la page de résultat (jamais de retour
 * "erreur" affiché sur cette page-ci) : Supabase ne distingue de façon fiable
 * que l'expiration (`otp_expired`) du reste ; tout autre refus de l'API est
 * traité comme lien invalide/déjà utilisé, et seule une exception imprévue
 * (réseau, etc.) atterrit sur l'état "erreur".
 */
export async function confirmEmail(tokenHash: string, type: EmailOtpType) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (error) {
      const state = error.code === "otp_expired" ? "expired" : "invalid";
      redirect(`/auth/email-confirme?state=${state}&type=${type}`);
    }
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("confirmEmail failed", err);
    redirect("/auth/email-confirme?state=error");
  }

  redirect(type === "recovery" ? "/reset-password" : "/auth/email-confirme?state=success");
}

// next/navigation's redirect() throws a special control-flow error — ne pas
// la confondre avec une vraie erreur serveur lorsqu'on wrap en try/catch.
function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/**
 * Renvoie un nouvel e-mail de confirmation ou de réinitialisation, selon le
 * contexte d'origine. Répond toujours pareil côté UI, que l'adresse existe ou
 * non, pour ne pas permettre de deviner quels comptes existent.
 */
export async function resendConfirmationEmail(email: string, type: EmailOtpType) {
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (type === "recovery") {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/confirm?type=recovery`,
    });
    return { ok: !error };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${appUrl}/auth/confirm` },
  });
  return { ok: !error };
}
