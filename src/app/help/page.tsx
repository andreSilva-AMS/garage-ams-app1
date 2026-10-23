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

  // Profil + garage en une seule requête (jointure PostgREST) plutôt que deux
  // allers-retours séquentiels : la clé étrangère profiles.garage_id est sans
  // ambiguïté, donc "garages(...)" est résolu automatiquement.
  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, roles, garages(name, logo_url)")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/dashboard");
  // PostgREST peut renvoyer l'objet joint directement ou dans un tableau à un
  // élément selon la version du driver : on gère les deux par prudence.
  const garage = Array.isArray(profile.garages) ? profile.garages[0] : profile.garages;
  if (!garage) redirect("/dashboard");
  const isOwner = profile.roles.includes("owner");

  const steps = [
    { icon: PlusCircle, title: t("step1Title"), body: t("step1Body") },
    { icon: ListChecks, title: t("step2Title"), body: t("step2Body") },
    { icon: Send, title: t("step3Title"), body: t("step3Body") },
    { icon: HistoryIcon, title: t("step4Title"), body: t("step4Body") },
  ];

  return (
    <AppShell garageName={garage.name} logoUrl={garage.logo_url} isOwner={isOwner}>
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
