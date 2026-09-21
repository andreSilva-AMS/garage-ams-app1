"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EmailOtpType } from "@supabase/supabase-js";
import { confirmEmail, resendConfirmationEmail } from "./actions";

export function ConfirmPanel({
  tokenHash,
  type,
}: {
  tokenHash: string | null;
  type: EmailOtpType | null;
}) {
  const t = useTranslations("authConfirm");
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const isRecovery = type === "recovery";
  const invalidLink = !tokenHash || !type || failed;

  function handleConfirm() {
    if (!tokenHash || !type) return;
    startTransition(async () => {
      const result = await confirmEmail(tokenHash, type);
      // N'est atteint que si le serveur n'a PAS redirigé, donc en cas d'échec.
      if (!result.ok) setFailed(true);
    });
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 text-center">
      <h1 className="text-xl">
        {invalidLink ? t("expiredTitle") : isRecovery ? t("recoveryTitle") : t("title")}
      </h1>
      <p className="text-sm text-neutral-600">
        {invalidLink ? t("expiredBody") : isRecovery ? t("recoveryBody") : t("body")}
      </p>

      {invalidLink ? (
        <ResendForm type={type ?? "email"} />
      ) : (
        <button type="button" onClick={handleConfirm} disabled={isPending} className="btn-primary">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isPending ? t("confirming") : isRecovery ? t("continueButton") : t("confirmButton")}
        </button>
      )}
    </div>
  );
}

function ResendForm({ type }: { type: EmailOtpType }) {
  const t = useTranslations("authConfirm");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleResend(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    await resendConfirmationEmail(email, type);
    // Toujours "envoyé", que l'adresse existe ou non (voir resendConfirmationEmail).
    setStatus("sent");
  }

  if (status === "sent") {
    return <p className="text-sm text-green-700">{t("resendSent", { email })}</p>;
  }

  return (
    <form onSubmit={handleResend} className="flex w-full flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("resendEmailPlaceholder")}
        className="input"
      />
      <button type="submit" disabled={status === "sending"} className="btn-secondary">
        {status === "sending" ? t("resendSending") : t("resendButton")}
      </button>
    </form>
  );
}
