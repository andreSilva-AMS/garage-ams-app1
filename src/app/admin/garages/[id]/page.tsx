import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BillingCountryForm } from "./BillingCountryForm";

export const metadata: Metadata = { title: "Détail garage — Admin" };

export default async function AdminGarageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: garage } = await supabase
    .from("garages")
    .select(
      "id, name, address, phone, email, billing_country, subscription_plan, payment_status, trial_ends_at, vat_number, checkout_billing_address_country, checkout_country_mismatch, vat_country_mismatch, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (!garage) notFound();

  // Journalise cette consultation avant d'afficher les fiches (voir
  // admin_log_reception_view, migration 0023) — un admin ne peut jamais
  // voir les réceptions d'un garage sans que ce soit tracé.
  await supabase.rpc("admin_log_reception_view", { target_garage_id: garage.id });

  const { data: receptions } = await supabase
    .from("receptions")
    .select("id, client_name, vehicle_plate, vehicle_brand_model, created_at, pdf_path, email_status")
    .eq("garage_id", garage.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const receptionsWithUrls = await Promise.all(
    (receptions ?? []).map(async (r) => {
      const { data } = r.pdf_path
        ? await supabase.storage.from("receptions").createSignedUrl(r.pdf_path, 3600)
        : { data: null };
      return { ...r, pdfUrl: data?.signedUrl ?? null };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour aux garages
      </Link>

      <div>
        <h1 className="text-xl font-semibold">{garage.name}</h1>
        <p className="text-sm text-muted">
          Créé le {new Date(garage.created_at).toLocaleDateString("fr-CH")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border-color bg-white p-4 sm:grid-cols-2">
        <div>
          <Field label="Pays de facturation" value={garage.billing_country ?? "—"} />
          <BillingCountryForm garageId={garage.id} currentCountry={garage.billing_country} />
        </div>
        <Field label="Abonnement" value={`${garage.subscription_plan} · ${garage.payment_status}`} />
        <Field label="Adresse" value={garage.address ?? "—"} />
        <Field label="Téléphone" value={garage.phone ?? "—"} />
        <Field label="E-mail" value={garage.email ?? "—"} />
        <Field label="Essai jusqu'au" value={garage.trial_ends_at ? new Date(garage.trial_ends_at).toLocaleDateString("fr-CH") : "—"} />
        <Field label="Numéro de TVA" value={garage.vat_number ?? "—"} />
        <Field
          label="Pays de l'adresse de facturation (Stripe)"
          value={garage.checkout_billing_address_country ?? "—"}
          warn={garage.checkout_country_mismatch}
        />
        {garage.checkout_country_mismatch && (
          <p className="text-xs text-amber-700 sm:col-span-2">
            ⚠ Écart entre le pays de facturation et l&apos;adresse saisie au paiement (signalé, non bloquant).
          </p>
        )}
        {garage.vat_country_mismatch && (
          <p className="text-xs text-amber-700 sm:col-span-2">
            ⚠ Écart entre le pays de facturation et le préfixe du numéro de TVA (signalé, non bloquant).
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-base font-semibold">
          Réceptions ({receptionsWithUrls.length}) — lecture seule
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border-color bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-color bg-neutral-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Véhicule</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Statut e-mail</th>
                <th className="px-3 py-2">PDF</th>
              </tr>
            </thead>
            <tbody>
              {receptionsWithUrls.map((r) => (
                <tr key={r.id} className="border-b border-border-color last:border-0">
                  <td className="px-3 py-2">
                    {r.client_name} — {r.vehicle_plate}
                  </td>
                  <td className="px-3 py-2">{r.vehicle_brand_model ?? "—"}</td>
                  <td className="px-3 py-2">{new Date(r.created_at).toLocaleString("fr-CH")}</td>
                  <td className="px-3 py-2">{r.email_status ?? "—"}</td>
                  <td className="px-3 py-2">
                    {r.pdfUrl ? (
                      <a
                        href={r.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 underline"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        PDF
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {receptionsWithUrls.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted">
                    Aucune fiche pour ce garage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className={warn ? "font-medium text-amber-700" : "font-medium"}>{value}</p>
    </div>
  );
}
