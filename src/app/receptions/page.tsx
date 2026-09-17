import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ReceptionsPage() {
  const supabase = await createClient();

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
        <h1 className="text-xl font-semibold">Historique des réceptions</h1>
        <Link href="/receptions/new" className="btn-primary">
          Nouvelle réception
        </Link>
      </div>

      {withUrls.length === 0 && (
        <p className="text-sm text-neutral-500">Aucune fiche pour l&apos;instant.</p>
      )}

      <ul className="flex flex-col gap-2">
        {withUrls.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-md border border-neutral-200 p-3"
          >
            <div>
              <p className="font-medium">
                {r.client_name} — {r.vehicle_plate}
              </p>
              <p className="text-sm text-neutral-500">
                {r.vehicle_brand_model || "—"} ·{" "}
                {new Date(r.created_at).toLocaleString("fr-CH")}
              </p>
            </div>
            {r.pdfUrl && (
              <a href={r.pdfUrl} target="_blank" rel="noreferrer" className="text-sm underline">
                PDF
              </a>
            )}
          </li>
        ))}
      </ul>

      <Link href="/dashboard" className="mt-8 inline-block text-sm underline">
        Retour au tableau de bord
      </Link>
    </main>
  );
}
