import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasActiveAccess } from "@/lib/billing";
import { ReceptionWizard } from "./ReceptionWizard";
import { ConsignmentWizard } from "./ConsignmentWizard";
import { NewDossierTypeChoice } from "./NewDossierTypeChoice";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("newReception") };
}

export default async function NewReceptionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profil + garage en une seule requête (jointure PostgREST) plutôt que deux
  // allers-retours séquentiels : la clé étrangère profiles.garage_id est sans
  // ambiguïté, donc "garages(...)" est résolu automatiquement.
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "garage_id, roles, garages(id, name, address, address_street, address_postal_code, address_city, phone, email, logo_url, default_language, billing_country, subscription_plan, payment_status, trial_ends_at, has_workshop, has_sales)",
    )
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/dashboard");
  // PostgREST peut renvoyer l'objet joint directement ou dans un tableau à un
  // élément selon la version du driver : on gère les deux par prudence.
  const garage = Array.isArray(profile.garages) ? profile.garages[0] : profile.garages;
  if (!garage) redirect("/dashboard");
  if (!hasActiveAccess(garage)) redirect("/billing");

  const canReception =
    garage.has_workshop &&
    profile.roles.some((r: string) => ["owner", "mechanic", "reception"].includes(r));
  const canConsignment =
    garage.has_sales && profile.roles.some((r: string) => ["owner", "seller"].includes(r));

  if (!canReception && !canConsignment) redirect("/dashboard");

  if (canReception && canConsignment) {
    if (type === "consignment") return <ConsignmentWizard garage={garage} />;
    if (type === "reception") return <ReceptionWizard garage={garage} />;
    return <NewDossierTypeChoice />;
  }

  if (canConsignment) return <ConsignmentWizard garage={garage} />;
  return <ReceptionWizard garage={garage} />;
}
