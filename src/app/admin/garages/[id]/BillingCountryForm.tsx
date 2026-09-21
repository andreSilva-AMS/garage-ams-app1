"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ALL_BILLING_COUNTRIES, countryLabel } from "@/lib/countries";
import { updateBillingCountry } from "@/app/admin/actions";

export function BillingCountryForm({
  garageId,
  currentCountry,
}: {
  garageId: string;
  currentCountry: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(currentCountry ?? "");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await updateBillingCountry(garageId, country, reason);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setReason("");
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs underline">
        Modifier le pays
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 rounded-xl border border-border-color p-3">
      <select value={country} onChange={(e) => setCountry(e.target.value)} className="input">
        {ALL_BILLING_COUNTRIES.map((code) => (
          <option key={code} value={code}>
            {countryLabel(code, "fr")}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Raison (facultatif, journalisée)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="input"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary text-xs">
          {saving ? "Enregistrement…" : "Confirmer"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-xs">
          Annuler
        </button>
      </div>
    </form>
  );
}
