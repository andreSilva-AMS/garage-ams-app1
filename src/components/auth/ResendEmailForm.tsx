"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { EmailOtpType } from "@supabase/supabase-js";
import { resendConfirmationEmail } from "@/app/auth/confirm/actions";

const COOLDOWN_SECONDS = 60;

/**
 * Renvoi d'e-mail de confirmation/réinitialisation, avec un délai de 60s
 * entre deux envois. Si `email` est fourni (ex. juste après l'inscription,
 * adresse déjà connue), pas de champ à ressaisir — un simple bouton suffit.
 * Sinon (ex. lien expiré où on ne sait plus à qui il appartenait), un champ
 * e-mail est affiché.
 */
export function ResendEmailForm({
  type,
  email: knownEmail,
  label,
  className = "",
}: {
  type: EmailOtpType;
  email?: string;
  /** Remplace le texte par défaut du bouton (ex. un libellé en forme de lien). */
  label?: string;
  className?: string;
}) {
  const t = useTranslations("emailConfirme.resend");
  const [email, setEmail] = useState(knownEmail ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || status === "sending" || cooldown > 0) return;
    setStatus("sending");
    await resendConfirmationEmail(email, type);
    setStatus("sent");
    startCooldown();
  }

  const disabled = status === "sending" || cooldown > 0 || !email;

  return (
    <form onSubmit={handleSubmit} className={`flex w-full flex-col gap-3 ${className}`}>
      {!knownEmail && (
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          className="input"
        />
      )}
      <button
        type="submit"
        disabled={disabled}
        className={label ? "text-sm underline disabled:opacity-50" : "btn-secondary"}
      >
        {status === "sending"
          ? t("sending")
          : cooldown > 0
            ? t("cooldown", { s: cooldown })
            : (label ?? t("button"))}
      </button>
      {status === "sent" && cooldown > 0 && (
        <p className="text-sm text-green-700">{t("sent")}</p>
      )}
    </form>
  );
}
