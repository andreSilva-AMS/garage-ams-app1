import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { OnboardingWizard } from "./OnboardingWizard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding");
  return { title: t("pageTitle") };
}

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await ensureProfile(supabase, user);

  if (!profile) {
    redirect("/signup");
  }

  const { data: garage } = await supabase
    .from("garages")
    .select("id, name, address, phone, email, logo_url, default_language, onboarding_completed")
    .eq("id", profile.garage_id)
    .single();

  // Seul le propriétaire configure le garage ; un employé invité ne doit
  // jamais se retrouver bloqué sur cet assistant.
  if (!garage || garage.onboarding_completed || profile.role !== "owner") {
    redirect("/dashboard");
  }

  return <OnboardingWizard garage={garage} />;
}
