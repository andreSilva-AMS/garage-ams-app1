"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const t = useTranslations("login");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?type=recovery`,
    });

    // Toujours afficher le même message, que l'e-mail existe ou non : ne
    // pas révéler si une adresse est enregistrée dans l'application.
    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 text-center">
        <h1 className="mb-4 text-xl">{t("forgotPasswordSentTitle")}</h1>
        <p className="mb-6 text-sm text-neutral-600">
          {t("forgotPasswordSentBody", { email })}
        </p>
        <Link href="/login" className="text-sm underline">
          {t("goToLogin")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="mb-2 text-xl">{t("forgotPasswordTitle")}</h1>
      <p className="mb-6 text-sm text-neutral-600">{t("forgotPasswordBody")}</p>

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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t("submitting") : t("forgotPasswordSubmit")}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        <Link href="/login" className="underline">
          {t("goToLogin")}
        </Link>
      </p>
    </main>
  );
}
