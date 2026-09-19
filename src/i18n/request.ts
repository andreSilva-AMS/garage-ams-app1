import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const SUPPORTED_LOCALES = ["fr", "en", "es", "pt", "de", "it"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
// Anglais par défaut : avant inscription/connexion, on ne sait pas encore
// d'où vient la personne (produit vendu dans plusieurs pays) — l'anglais
// est compris plus largement que le français par un premier visiteur.
export const DEFAULT_LOCALE: SupportedLocale = "en";

/**
 * La langue de l'interface suit la langue par défaut du garage (partagée par
 * toute l'équipe), une fois connecté. Avant la connexion (login/signup), on
 * retombe sur un cookie choisi par la personne qui s'inscrit.
 */
async function resolveLocale(): Promise<SupportedLocale> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("garage_id")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        const { data: garage } = await supabase
          .from("garages")
          .select("default_language")
          .eq("id", profile.garage_id)
          .maybeSingle();
        if (garage?.default_language && isSupported(garage.default_language)) {
          return garage.default_language;
        }
      }
    }
  } catch {
    // pas de session valide : on retombe sur le cookie ci-dessous
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  return cookieLocale && isSupported(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
}

function isSupported(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
