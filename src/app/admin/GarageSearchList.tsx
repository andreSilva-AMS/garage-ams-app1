"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface Garage {
  id: string;
  name: string;
  billing_country: string | null;
  subscription_plan: string;
  payment_status: string;
  vat_number: string | null;
  created_at: string;
}

export function GarageSearchList({ garages }: { garages: Garage[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return garages;
    return garages.filter(
      (g) => g.name.toLowerCase().includes(q) || (g.billing_country ?? "").toLowerCase().includes(q),
    );
  }, [garages, query]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        placeholder="Rechercher par nom ou pays…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input max-w-sm"
      />

      <div className="overflow-x-auto rounded-2xl border border-border-color bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-color bg-neutral-50 text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Garage</th>
              <th className="px-3 py-2">Pays</th>
              <th className="px-3 py-2">Abonnement</th>
              <th className="px-3 py-2">TVA</th>
              <th className="px-3 py-2">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-b border-border-color last:border-0 hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <Link href={`/admin/garages/${g.id}`} className="font-medium underline">
                    {g.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{g.billing_country ?? "—"}</td>
                <td className="px-3 py-2">
                  {g.subscription_plan} · {g.payment_status}
                </td>
                <td className="px-3 py-2">{g.vat_number ?? "—"}</td>
                <td className="px-3 py-2">{new Date(g.created_at).toLocaleDateString("fr-CH")}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  Aucun garage ne correspond à cette recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
