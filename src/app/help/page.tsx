import { redirect } from "next/navigation";
import { PlusCircle, ListChecks, Send, History as HistoryIcon, Settings } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("help");
  return { title: t("title") };
}

export default async function HelpPage() {
  const supabase = await createClient();
  const t = await getTranslations("help");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/dashboard");

  const { data: garage } = await supabase
    .from("garages")
    .select("name, logo_url")
    .eq("id", profile.garage_id)
    .single();
  if (!garage) redirect("/dashboard");

  const steps = [
    { icon: PlusCircle, title: t("step1Title"), body: t("step1Body") },
    { icon: ListChecks, title: t("step2Title"), body: t("step2Body") },
    { icon: Send, title: t("step3Title"), body: t("step3Body") },
    { icon: HistoryIcon, title: t("step4Title"), body: t("step4Body") },
  ];

  return (
    <AppShell garageName={garage.name} logoUrl={garage.logo_url}>
      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="mb-2 text-xl font-semibold">{t("title")}</h1>
        <p className="mb-6 text-sm text-muted">{t("intro")}</p>

        <ol className="flex flex-col gap-4">
          {steps.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card flex gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-strong">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="mt-0.5 text-sm text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t("settingsNote")}
        </p>
      </main>
    </AppShell>
  );
}
