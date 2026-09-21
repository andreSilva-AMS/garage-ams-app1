"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Lang } from "@/lib/receptions/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { resendConfirmationEmail } from "@/app/auth/confirm/actions";

function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("login");
  const appLocale = useLocale() as Lang;
  const timedOut = searchParams.get("timeout") === "1";
  const confirmError = searchParams.get("confirmError") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [language, setLanguage] = useState<Lang>(appLocale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleLanguageChange(value: Lang) {
    setLanguage(value);
    setLocaleCookie(value);
    router.refresh();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUnconfirmed(false);
    setResendStatus("idle");

    // Marqueur lu par le middleware pour appliquer le même choix lors du
    // rafraîchissement automatique du jeton (voir middleware.ts).
    document.cookie = remember
      ? "sb_remember=; path=/; max-age=0"
      : "sb_remember=0; path=/; SameSite=Lax";

    const supabase = createClient({ remember });
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Compte existant mais e-mail jamais confirmé (lien reçu cassé,
      // expiré, ou jamais cliqué) : proposer un renvoi plutôt qu'un simple
      // message d'erreur, ici même sans avoir besoin de cliquer un lien.
      const isUnconfirmed =
        signInError.code === "email_not_confirmed" ||
        /email not confirmed/i.test(signInError.message);
      if (isUnconfirmed) {
        setUnconfirmed(true);
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleResend() {
    setResendStatus("sending");
    await resendConfirmationEmail(email, "email");
    // Toujours "envoyé", que l'adresse existe ou non (même logique que le
    // renvoi sur /auth/confirm).
    setResendStatus("sent");
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher value={language} onChange={handleLanguageChange} />
      </div>

      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="ReceptCar" width={36} height={36} className="rounded-xl" />
        <span className="text-lg font-medium" style={{ fontFamily: "var(--font-plex-serif)" }}>
          ReceptCar
        </span>
      </div>
      <h1 className="mb-6 text-xl">{t("title")}</h1>

      {timedOut && (
        <p className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
          {t("sessionTimedOut")}
        </p>
      )}

      {confirmError && (
        <p className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
          {t("confirmError")}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            {t("password")}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            {t("rememberMe")}
          </label>
          <Link href="/forgot-password" className="text-sm underline">
            {t("forgotPasswordLink")}
          </Link>
        </div>

        {unconfirmed && (
          <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
            <p className="mb-2">{t("emailNotConfirmed")}</p>
            {resendStatus === "sent" ? (
              <p className="font-medium">{t("emailNotConfirmedSent", { email })}</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendStatus === "sending"}
                className="font-medium underline"
              >
                {resendStatus === "sending" ? t("emailNotConfirmedSending") : t("emailNotConfirmedResend")}
              </button>
            )}
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        {t("noAccount")}{" "}
        <Link href="/signup" className="underline">
          {t("signupLink")}
        </Link>
      </p>
    </main>
  );
}
