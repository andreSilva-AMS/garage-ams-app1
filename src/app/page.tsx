import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "./LandingPage";
import type { Lang } from "@/lib/receptions/i18n";

const TITLE = "ReceptCar — Réception véhicule digitale pour garages";
const DESCRIPTION =
  "Photos, checklist des dommages, signature du client et PDF envoyé automatiquement. La réception véhicule digitale pour garages et dépôts-ventes. Essai gratuit 30 jours.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      type: "website",
      url: "https://receptcar.com",
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
    },
  };
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ReceptCar",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, Android, iOS",
  description: DESCRIPTION,
  url: "https://receptcar.com",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  const locale = (await getLocale()) as Lang;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LandingPage appLocale={locale} />
    </>
  );
}
