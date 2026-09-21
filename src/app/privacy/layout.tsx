import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Lang } from "@/lib/receptions/i18n";

// Titres alignés sur CONTENT[locale].title dans page.tsx (contenu légal
// autonome, non stocké dans messages/*.json).
const TITLES: Record<Lang, string> = {
  fr: "Politique de confidentialité",
  en: "Privacy Policy",
  es: "Política de privacidad",
  pt: "Política de privacidade",
  de: "Datenschutzrichtlinie",
  it: "Informativa sulla privacy",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Lang;
  return { title: TITLES[locale] ?? TITLES.fr };
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
