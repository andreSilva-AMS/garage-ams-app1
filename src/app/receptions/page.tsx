import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getGarageTimezone, formatGarageDateTime } from "@/lib/timezone";
import { ReceptionsList } from "./ReceptionsList";

export default async function ReceptionsPage() {
  const supabase = await createClient();
  const t = await getTranslations("receptionsHistory");
  const tNav = await getTranslations("nav");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id")
    .eq("id", user.id)
    .single();

  const [{ data: garage }, { data: receptions }] = await Promise.all([
    profile
      ? supabase
          .from("garages")
          .select("billing_country, default_language, retention_days")
          .eq("id", profile.garage_id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("receptions")
      .select("id, client_name, vehicle_plate, vehicle_brand_model, created_at, pdf_path")
      .order("created_at", { ascending: false }),
  ]);
  const timezone = getGarageTimezone(garage ?? {});

  const withUrls = await Promise.all(
    (receptions ?? []).map(async (r) => {
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
      };
    }),
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
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

      <Link href="/dashboard" className="mt-8 inline-block text-sm underline">
        {tNav("backToDashboard")}
      </Link>
    </main>
  );
}
