import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const SUPPORTED_LOCALES = ["fr", "en", "es", "pt", "de", "it"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
// Repli final si le navigateur n'indique aucune des langues prises en
// charge (ex. Accept-Language absent, ou une langue tierce comme le
// japonais) : l'anglais reste compris plus largement que le français par un
// visiteur dont on ne connaît pas encore le pays.
export const DEFAULT_LOCALE: SupportedLocale = "en";

/** Langue préférée du navigateur (en-tête Accept-Language), si prise en charge. */
async function browserLocale(): Promise<SupportedLocale | null> {
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  if (!acceptLanguage) return null;

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0].toLowerCase());

  for (const lang of preferred) {
    if (isSupported(lang)) return lang;
  }
  return null;
}

/**
 * La langue de l'interface suit la langue par défaut du garage (partagée par
 * toute l'équipe), une fois connecté. Avant la connexion (login/signup), on
 * retombe sur un cookie choisi explicitement par la personne (ex. via le
 * sélecteur de langue), puis sur la langue de son navigateur (ex. français
 * par défaut en Suisse romande), et enfin sur l'anglais.
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
  if (cookieLocale && isSupported(cookieLocale)) return cookieLocale;

  return (await browserLocale()) ?? DEFAULT_LOCALE;
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
