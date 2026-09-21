import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Lang } from "@/lib/receptions/i18n";

// Titres alignés sur CONTENT[locale].title dans page.tsx (contenu légal
// autonome, non stocké dans messages/*.json).
const TITLES: Record<Lang, string> = {
  fr: "Conditions d'utilisation",
  en: "Terms of Use",
  es: "Condiciones de uso",
  pt: "Termos de utilização",
  de: "Nutzungsbedingungen",
  it: "Termini di utilizzo",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Lang;
  return { title: TITLES[locale] ?? TITLES.fr };
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
