"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Bloc d'erreur générique (icône + titre + message + bouton "Réessayer"),
 * utilisé par tous les error.tsx de route pour éviter de répéter le même
 * balisage dans chaque segment.
 */
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("common");
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="text-lg font-medium">{t("errorTitle")}</h1>
      <p className="text-sm text-neutral-600">{t("errorBody")}</p>
      <button type="button" onClick={onRetry} className="btn-primary mt-2">
        {t("retry")}
      </button>
    </main>
  );
}
