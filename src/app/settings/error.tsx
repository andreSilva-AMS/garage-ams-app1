"use client";

import { useTranslations } from "next-intl";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common");
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-lg font-medium">{t("errorTitle")}</h1>
      <p className="text-sm text-neutral-600">{t("errorBody")}</p>
      <button type="button" onClick={reset} className="btn-primary mt-2">
        {t("retry")}
      </button>
    </main>
  );
}
