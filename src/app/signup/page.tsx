import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "./SignupForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("signup");
  return { title: t("title") };
}

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("pricing_plans").select("country_code").eq("active", true);

  const activeCountryCodes = (data ?? []).map((row) => row.country_code);

  return <SignupForm activeCountryCodes={activeCountryCodes} />;
}
