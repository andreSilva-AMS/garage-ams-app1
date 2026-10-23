import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getGarageTimezone, formatGarageDateTime } from "@/lib/timezone";
import { AppShell } from "@/components/AppShell";
import { ReceptionsList } from "./ReceptionsList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("receptionsHistory");
  return { title: t("title") };
}

export default async function ReceptionsPage() {
  const supabase = await createClient();
  const t = await getTranslations("receptionsHistory");
  const tNav = await getTranslations("nav");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profil + garage en une seule requête (jointure PostgREST) plutôt que deux
  // allers-retours séquentiels : la clé étrangère profiles.garage_id est sans
  // ambiguïté, donc "garages(...)" est résolu automatiquement.
  const [{ data: profile }, { data: receptions }, { data: consignments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("garage_id, roles, garages(name, logo_url, billing_country, default_language, retention_days)")
      .eq("id", user.id)
      .single(),
    supabase
      .from("receptions")
      .select("id, client_name, vehicle_plate, vehicle_brand_model, created_at, pdf_path")
      .order("created_at", { ascending: false }),
    supabase
      .from("consignments")
      .select("id, owner_name, vehicle_plate, vehicle_brand_model, created_at, pdf_path")
      .order("created_at", { ascending: false }),
  ]);
  // PostgREST peut renvoyer l'objet joint directement ou dans un tableau à un
  // élément selon la version du driver : on gère les deux par prudence.
  const garage = profile ? (Array.isArray(profile.garages) ? profile.garages[0] : profile.garages) : null;
  const timezone = getGarageTimezone(garage ?? {});

  async function withSignedUrl<
    T extends { id: string; vehicle_plate: string; vehicle_brand_model: string | null; created_at: string; pdf_path: string | null },
  >(rows: T[], clientName: (row: T) => string, type: "reception" | "consignment") {
    return Promise.all(
      rows.map(async (r) => {
        const { data } = r.pdf_path
          ? await supabase.storage.from("receptions").createSignedUrl(r.pdf_path, 3600)
          : { data: null };
        return {
          id: r.id,
          type,
          client_name: clientName(r),
          vehicle_plate: r.vehicle_plate,
          vehicle_brand_model: r.vehicle_brand_model,
          dateLabel: formatGarageDateTime(new Date(r.created_at), timezone),
          pdfUrl: data?.signedUrl ?? null,
          createdAt: r.created_at,
        };
      }),
    );
  }

  const [receptionsWithUrls, consignmentsWithUrls] = await Promise.all([
    withSignedUrl(receptions ?? [], (r) => r.client_name, "reception"),
    withSignedUrl(consignments ?? [], (c) => c.owner_name, "consignment"),
  ]);

  const withUrls = [...receptionsWithUrls, ...consignmentsWithUrls].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const isOwner = profile?.roles.includes("owner") ?? false;

  return (
    <AppShell garageName={garage?.name ?? ""} logoUrl={garage?.logo_url ?? null} isOwner={isOwner}>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          <Link href="/receptions/new" className="btn-primary">
            {tNav("newReception")}
          </Link>
        </div>

        <p className="mb-6 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
          {t("retentionNotice", { days: garage?.retention_days ?? 30 })}
        </p>

        <ReceptionsList receptions={withUrls} />
      </main>
    </AppShell>
  );
}
