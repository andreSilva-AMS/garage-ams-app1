import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck, PlusCircle } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { getGarageTimezone, formatGarageDateTime, startOfTodayInTimezone } from "@/lib/timezone";
import { AppShell } from "@/components/AppShell";
import { DashboardReceptions } from "./DashboardReceptions";

const LATEST_RECEPTIONS_LIMIT = 20;
const LATEST_RECEPTIONS_SHOWN = 6;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("dashboard") };
}

function daysLeftUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const t = await getTranslations("dashboard");
  const tNav = await getTranslations("nav");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await ensureProfile(supabase, user);

  if (!profile) {
    // Le profil n'a pas pu être créé (ex : inscription incomplète).
    redirect("/signup");
  }

  // Ne dépendent que de profile.garage_id, pas les unes des autres :
  // lancées en parallèle plutôt qu'en série. Le "nombre de fiches du jour"
  // est calculé côté client à partir de la même liste que "dernières
  // réceptions" (LATEST_RECEPTIONS_LIMIT), pour ne pas ajouter une 4e
  // requête réseau rien que pour un compteur.
  const [{ data: garage }, { data: recentReceptions }] = await Promise.all([
    supabase
      .from("garages")
      .select(
        "id, name, address, logo_url, default_language, billing_country, subscription_plan, payment_status, trial_ends_at, onboarding_completed",
      )
      .eq("id", profile.garage_id)
      .single(),
    supabase
      .from("receptions")
      .select("id, client_name, vehicle_plate, vehicle_brand_model, created_at, pdf_path, email_status")
      .order("created_at", { ascending: false })
      .limit(LATEST_RECEPTIONS_LIMIT),
  ]);

  if (garage && !garage.onboarding_completed && profile.role === "owner") {
    redirect("/onboarding");
  }

  const timezone = getGarageTimezone(garage ?? {});
  const startOfToday = startOfTodayInTimezone(timezone);
  const todayCount = (recentReceptions ?? []).filter(
    (r) => new Date(r.created_at) >= startOfToday,
  ).length;

  const latest = (recentReceptions ?? []).slice(0, LATEST_RECEPTIONS_SHOWN);
  const latestWithUrls = await Promise.all(
    latest.map(async (r) => {
      const { data } = r.pdf_path
        ? await supabase.storage.from("receptions").createSignedUrl(r.pdf_path, 3600)
        : { data: null };
      return {
        id: r.id,
        client_name: r.client_name,
        vehicle_plate: r.vehicle_plate,
        vehicle_brand_model: r.vehicle_brand_model,
        dateLabel: formatGarageDateTime(new Date(r.created_at), timezone),
        pdfUrl: data?.signedUrl ?? null,
        emailStatus: r.email_status as "sent" | "failed" | null,
      };
    }),
  );

  const billingBanner = (() => {
    if (!garage) return null;
    if (garage.payment_status === "past_due") return t("paymentIssue");
    if (garage.payment_status === "active" || garage.payment_status === "free") return null;
    if (garage.trial_ends_at) {
      const daysLeft = daysLeftUntil(new Date(garage.trial_ends_at));
      if (daysLeft <= 0) return t("trialExpired");
      if (daysLeft <= 5) return t("trialEndingSoon", { days: daysLeft });
    }
    return null;
  })();

  return (
    <AppShell garageName={garage?.name ?? ""} logoUrl={garage?.logo_url ?? null}>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        {billingBanner && (
          <Link
            href="/billing"
            className="mb-6 block rounded-2xl bg-amber-50 p-3 text-sm text-amber-800 underline"
          >
            {billingBanner} — {t("subscribeCta")}
          </Link>
        )}

        <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/receptions/new" className="btn-primary justify-center text-base">
            <PlusCircle className="h-5 w-5" aria-hidden="true" />
            {tNav("newReception")}
          </Link>
          <span className="badge self-start bg-accent/10 text-accent-strong sm:self-auto">
            <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {t("todayCount", { count: todayCount })}
          </span>
        </section>

        <section className="card mb-6 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">{t("latestReceptions")}</h2>
            <Link
              href="/receptions"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent"
            >
              {t("viewAllHistory")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <DashboardReceptions receptions={latestWithUrls} />
        </section>
      </main>
    </AppShell>
  );
}
