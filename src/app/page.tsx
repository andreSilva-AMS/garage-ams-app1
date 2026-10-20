import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "./LandingPage";
import type { Lang } from "@/lib/receptions/i18n";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  const locale = (await getLocale()) as Lang;
  return <LandingPage appLocale={locale} />;
}
