"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DeleteReceptionButton } from "./DeleteReceptionButton";

interface Reception {
  id: string;
  client_name: string;
  vehicle_plate: string;
  vehicle_brand_model: string | null;
  dateLabel: string;
  pdfUrl: string | null;
}

export function ReceptionsList({ receptions }: { receptions: Reception[] }) {
  const t = useTranslations("receptionsHistory");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receptions;
    return receptions.filter(
      (r) => r.client_name.toLowerCase().includes(q) || r.vehicle_plate.toLowerCase().includes(q),
    );
  }, [receptions, query]);

  return (
    <>
      {receptions.length > 0 && (
        <input
          type="search"
          className="input mb-4"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      {receptions.length === 0 && <p className="text-sm text-neutral-500">{t("empty")}</p>}
      {receptions.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-neutral-500">{t("searchEmpty")}</p>
      )}

      <ul className="flex flex-col gap-2">
        {filtered.map((r) => (
          <li
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                {r.client_name} — {r.vehicle_plate}
              </p>
              <p className="text-sm text-neutral-500">
                {r.vehicle_brand_model || "—"} · {r.dateLabel}
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
    </>
  );
}
