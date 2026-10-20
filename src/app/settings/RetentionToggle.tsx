"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toggleRetention12Months } from "../billing/actions";

export function RetentionToggle({
  active,
  canToggle,
  price,
  isOwner,
}: {
  active: boolean;
  canToggle: boolean;
  price: { amount: number; currency: string } | null;
  isOwner: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("settings");
  const tBilling = useTranslations("billing");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(enable: boolean) {
    setSaving(true);
    setError(null);
    const result = await toggleRetention12Months(enable);
    if (!result.ok) {
      setError(
        result.error === "stripeError"
          ? tBilling("errors.stripeError", { detail: result.detail ?? "" })
          : tBilling(`errors.${result.error}`),
      );
      setSaving(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{t("retentionDays")}</label>

      {canToggle ? (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!isOwner || saving || !active}
            onClick={() => handleToggle(false)}
            className={!active ? "btn-primary" : "btn-secondary"}
          >
            {t("retention30")}
          </button>
          <button
            type="button"
            disabled={!isOwner || saving || active || !price}
            onClick={() => handleToggle(true)}
            className={active ? "btn-primary" : "btn-secondary"}
          >
            {t("retention365")}
            {price && (
              <span className="ml-1.5 text-xs opacity-75">
                (+{price.amount.toFixed(2)} {price.currency} / {t("retentionPerMonth")})
              </span>
            )}
          </button>
        </div>
      ) : (
        <p className="text-sm text-neutral-600">{active ? t("retention365") : t("retention30")}</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-neutral-500">{canToggle ? t("retentionHint") : t("retentionUpsellHint")}</p>
    </div>
  );
}
