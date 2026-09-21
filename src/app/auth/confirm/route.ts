import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Point d'entrée des liens de confirmation par e-mail (inscription et
 * invitation employé passent tous les deux par supabase.auth.signUp(), donc
 * par ce même lien). Échange le token_hash contre une session, puis
 * redirige — voir ensureProfile() pour la suite (création du garage ou
 * rattachement à une invitation selon les métadonnées du compte).
 *
 * Nécessite que le modèle d'e-mail "Confirm signup" dans Supabase pointe
 * vers /auth/confirm?token_hash={{ .TokenHash }}&type=email (au lieu du
 * lien par défaut {{ .ConfirmationURL }}), sinon cette route n'est jamais
 * appelée.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Un lien "mot de passe oublié" doit amener sur le formulaire de
      // nouveau mot de passe, pas directement sur le tableau de bord.
      redirectTo.pathname = type === "recovery" ? "/reset-password" : "/dashboard";
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/login";
  redirectTo.searchParams.set("confirmError", "1");
  return NextResponse.redirect(redirectTo);
}
