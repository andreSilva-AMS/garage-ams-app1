"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function JoinForm({
  token,
  email,
  role,
  garageName,
}: {
  token: string;
  email: string;
  role: "mechanic" | "reception";
  garageName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("join");
  const tDashboard = useTranslations("dashboard");

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, invite_token: token },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // Confirmation par e-mail activée : l'équipe sera rejointe
      // automatiquement à la première connexion (voir ensureProfile()).
      setPendingConfirmation(true);
      setLoading(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc("accept_garage_invite", {
      p_token: token,
      p_full_name: fullName,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (pendingConfirmation) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
        <h1 className="text-xl">{t("pendingTitle")}</h1>
        <p className="text-sm text-neutral-600">{t("pendingBody", { email })}</p>
        <Link href="/login" className="text-sm underline">
          {t("goToLogin")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="ReceptCar" width={36} height={36} className="rounded-xl" />
        <span className="text-lg font-medium" style={{ fontFamily: "var(--font-plex-serif)" }}>
          ReceptCar
        </span>
      </div>
      <h1 className="mb-1 text-xl">{t("title", { garageName })}</h1>
      <p className="mb-6 text-sm text-neutral-600">
        {t("subtitle", { email, role: tDashboard(`role.${role}`) })}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="fullName" className="text-sm font-medium">
            {t("fullName")}
          </label>
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>
    </main>
  );
}
