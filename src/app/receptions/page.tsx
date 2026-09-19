import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { DeleteReceptionButton } from "./DeleteReceptionButton";

export default async function ReceptionsPage() {
  const supabase = await createClient();
  const t = await getTranslations("receptionsHistory");
  const tNav = await getTranslations("nav");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: receptions } = await supabase
    .from("receptions")
    .select("id, client_name, vehicle_plate, vehicle_brand_model, created_at, pdf_path")
    .order("created_at", { ascending: false });

  const withUrls = await Promise.all(
    (receptions ?? []).map(async (r) => {
      const { data } = r.pdf_path
        ? await supabase.storage.from("receptions").createSignedUrl(r.pdf_path, 3600)
        : { data: null };
      return { ...r, pdfUrl: data?.signedUrl ?? null };
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
        {t("retentionNotice")}
      </p>

      {withUrls.length === 0 && <p className="text-sm text-neutral-500">{t("empty")}</p>}

      <ul className="flex flex-col gap-2">
        {withUrls.map((r) => (
          <li
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                {r.client_name} — {r.vehicle_plate}
              </p>
              <p className="text-sm text-neutral-500">
                {r.vehicle_brand_model || "—"} ·{" "}
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {r.pdfUrl && (
                <a href={r.pdfUrl} target="_blank" rel="noreferrer" className="text-sm underline">
                  {t("pdf")}
                </a>
              )}
              <DeleteReceptionButton receptionId={r.id} />
            </div>
          </li>
        ))}
      </ul>

      <Link href="/dashboard" className="mt-8 inline-block text-sm underline">
        {tNav("backToDashboard")}
      </Link>
    </main>
  );
}
