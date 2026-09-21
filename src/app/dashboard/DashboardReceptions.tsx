"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

interface Reception {
  id: string;
  client_name: string;
  vehicle_plate: string;
  vehicle_brand_model: string | null;
  dateLabel: string;
  pdfUrl: string | null;
}

export function DashboardReceptions({ receptions }: { receptions: Reception[] }) {
  const t = useTranslations("receptionsHistory");
  const tDash = useTranslations("dashboard");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receptions;
    return receptions.filter(
      (r) => r.client_name.toLowerCase().includes(q) || r.vehicle_plate.toLowerCase().includes(q),
    );
  }, [receptions, query]);

  if (receptions.length === 0) {
    return <EmptyState icon={FileText} message={tDash("noReceptionsYet")} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        className="input"
        placeholder={t("searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 && <p className="text-sm text-muted">{t("searchEmpty")}</p>}

      <ul className="flex flex-col gap-2">
        {filtered.map((r) => (
          <li
            key={r.id}
            className="flex flex-col gap-2 rounded-xl border border-border-color p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                {r.client_name} — {r.vehicle_plate}
              </p>
              <p className="truncate text-sm text-muted">
                {r.vehicle_brand_model || "—"} · {r.dateLabel}
              </p>
            </div>
            {r.pdfUrl && (
              <a
                href={r.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-sm font-medium underline"
              >
                {t("pdf")}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
