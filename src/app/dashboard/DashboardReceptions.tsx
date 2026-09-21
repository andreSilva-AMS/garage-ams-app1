"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { sendReceptionEmail } from "../receptions/actions";

interface Reception {
  id: string;
  client_name: string;
  vehicle_plate: string;
  vehicle_brand_model: string | null;
  dateLabel: string;
  pdfUrl: string | null;
  emailStatus: "sent" | "failed" | null;
}

export function DashboardReceptions({ receptions }: { receptions: Reception[] }) {
  const t = useTranslations("receptionsHistory");
  const tDash = useTranslations("dashboard");
  const [query, setQuery] = useState("");
  // Écrase le statut reçu du serveur pour les lignes où l'employé vient de
  // relancer l'envoi, en attendant le prochain chargement de la page.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, "sending" | "sent" | "failed">>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receptions;
    return receptions.filter(
      (r) => r.client_name.toLowerCase().includes(q) || r.vehicle_plate.toLowerCase().includes(q),
    );
  }, [receptions, query]);

  async function handleResend(id: string) {
    setStatusOverrides((prev) => ({ ...prev, [id]: "sending" }));
    const result = await sendReceptionEmail(id);
    setStatusOverrides((prev) => ({ ...prev, [id]: result.ok ? "sent" : "failed" }));
  }

  function openPdf(url: string | null) {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

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

      <ul className="divide-y divide-border-color">
        {filtered.map((r) => {
          const status = statusOverrides[r.id] ?? r.emailStatus;
          return (
            <li key={r.id}>
              <div
                className="flex min-h-11 flex-col gap-2 py-3 sm:flex-row sm:items-center"
                onClick={() => openPdf(r.pdfUrl)}
                style={{ cursor: r.pdfUrl ? "pointer" : "default" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {r.client_name} — {r.vehicle_plate}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {r.vehicle_brand_model || "—"} · {r.dateLabel}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {status === "sent" && (
                    <span className="badge bg-green-50 text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("emailSent")}
                    </span>
                  )}
                  {status === "sending" && (
                    <span className="badge bg-neutral-100 text-muted">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      {t("resending")}
                    </span>
                  )}
                  {status === "failed" && (
                    <>
                      <span className="badge bg-red-50 text-red-700">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        {t("emailFailed")}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResend(r.id);
                        }}
                        className="text-sm font-medium underline"
                      >
                        {t("resend")}
                      </button>
                    </>
                  )}

                  {r.pdfUrl && (
                    <a
                      href={r.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t("pdf")}
                      onClick={(e) => e.stopPropagation()}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-black/5"
                    >
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
