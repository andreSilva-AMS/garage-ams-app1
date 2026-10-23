"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EmailOtpType } from "@supabase/supabase-js";
import { confirmEmail } from "./actions";

/**
 * Le jeton est garanti présent ici : la page parente redirige déjà vers
 * /auth/email-confirme?state=invalid quand il manque. Un seul état possible
 * tant qu'on n'a pas cliqué — confirmEmail() redirige elle-même vers la page
 * de résultat dans tous les cas (succès, expiré, invalide, erreur).
 */
export function ConfirmPanel({ tokenHash, type }: { tokenHash: string; type: EmailOtpType }) {
  const t = useTranslations("authConfirm");
  const [isPending, startTransition] = useTransition();
  const isRecovery = type === "recovery";

  function handleConfirm() {
    startTransition(() => {
      confirmEmail(tokenHash, type);
    });
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 text-center">
      <h1 className="text-xl">{isRecovery ? t("recoveryTitle") : t("title")}</h1>
      <p className="text-sm text-neutral-600">{isRecovery ? t("recoveryBody") : t("body")}</p>
      <button type="button" onClick={handleConfirm} disabled={isPending} className="btn-primary">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isPending ? t("confirming") : isRecovery ? t("continueButton") : t("confirmButton")}
      </button>
    </div>
  );
}
