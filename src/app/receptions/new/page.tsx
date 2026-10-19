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

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, roles")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/dashboard");

  const { data: garage } = await supabase
    .from("garages")
    .select(
      "id, name, address, phone, email, logo_url, default_language, billing_country, subscription_plan, payment_status, trial_ends_at, has_workshop, has_sales",
    )
    .eq("id", profile.garage_id)
    .single();
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
