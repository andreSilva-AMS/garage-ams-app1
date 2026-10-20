import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { GarageSettingsForm } from "./GarageSettingsForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
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

  const isOwner = profile.roles.includes("owner");

  // Ne dépendent que du profil déjà chargé, pas les unes des autres :
  // lancées en parallèle plutôt qu'en série.
  const [{ data: garage }, { data: pendingInvites }, { data: teamMembers }] = await Promise.all([
    supabase
      .from("garages")
      .select(
        "id, name, address, address_street, address_postal_code, address_city, phone, email, logo_url, default_language, retention_days, payment_status, billing_country, has_workshop, has_sales",
      )
      .eq("id", profile.garage_id)
      .single(),
    isOwner
      ? supabase
          .from("garage_invites")
          .select("id, email, roles, created_at")
          .is("accepted_at", null)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
    supabase
      .from("profiles")
      .select("id, full_name, roles")
      .eq("garage_id", profile.garage_id)
      .order("created_at", { ascending: true }),
  ]);
  if (!garage) redirect("/dashboard");

  const { data: retentionPlan } = garage.billing_country
    ? await supabase
        .from("pricing_plans")
        .select("retention_365_amount_ht, currency")
        .eq("country_code", garage.billing_country)
        .maybeSingle()
    : { data: null };

  return (
    <AppShell garageName={garage.name} logoUrl={garage.logo_url}>
      <GarageSettingsForm
        garage={garage}
        isOwner={isOwner}
        pendingInvites={pendingInvites ?? []}
        teamMembers={teamMembers ?? []}
        retentionPrice={
          retentionPlan?.retention_365_amount_ht
            ? { amount: retentionPlan.retention_365_amount_ht, currency: retentionPlan.currency }
            : null
        }
      />
    </AppShell>
  );
}
