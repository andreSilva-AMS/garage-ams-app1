"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DeleteReceptionButton } from "./DeleteReceptionButton";

export interface DossierItem {
  id: string;
  type: "reception" | "consignment";
  client_name: string;
  vehicle_plate: string;
  vehicle_brand_model: string | null;
  dateLabel: string;
  pdfUrl: string | null;
}

export function ReceptionsList({ receptions }: { receptions: DossierItem[] }) {
  const t = useTranslations("receptionsHistory");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "reception" | "consignment">("all");

  const hasConsignments = useMemo(() => receptions.some((r) => r.type === "consignment"), [receptions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return receptions.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (!q) return true;
      return r.client_name.toLowerCase().includes(q) || r.vehicle_plate.toLowerCase().includes(q);
    });
  }, [receptions, query, typeFilter]);

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

      {hasConsignments && (
        <div className="mb-4 flex gap-2">
          {(["all", "reception", "consignment"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTypeFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                typeFilter === f ? "border-accent bg-accent text-accent-foreground" : "border-neutral-300"
              }`}
            >
              {t(`typeFilter.${f}`)}
            </button>
          ))}
        </div>
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
                {hasConsignments && (
                  <span className="badge ml-2 bg-accent/10 text-accent-strong">
                    {t(`typeBadge.${r.type}`)}
                  </span>
                )}
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
              <DeleteReceptionButton receptionId={r.id} type={r.type} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
