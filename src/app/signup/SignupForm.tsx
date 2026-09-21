"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Lang } from "@/lib/receptions/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  PRIORITY_BILLING_COUNTRIES,
  countryLabel,
  sortedOtherCountries,
} from "@/lib/countries";

function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
}

export function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("signup");
  const appLocale = useLocale() as Lang;

  const [garageName, setGarageName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [language, setLanguage] = useState<Lang>(appLocale);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  function handleLanguageChange(value: Lang) {
    setLanguage(value);
    setLocaleCookie(value);
    router.refresh();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          garage_name: garageName,
          full_name: fullName,
          preferred_language: language,
          billing_country: billingCountry,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // La confirmation par e-mail est activée : le garage sera créé
      // automatiquement à la première connexion (voir ensureProfile()).
      setPendingConfirmation(true);
      setLoading(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc("create_garage_and_owner", {
      garage_name: garageName,
      owner_full_name: fullName,
      garage_language: language,
      garage_billing_country: billingCountry,
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
        <p className="text-sm text-neutral-600">{t("pendingBody", { email, garageName })}</p>
        <Link href="/login" className="text-sm underline">
          {t("goToLogin")}
        </Link>
      </main>
    );
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
      <h1 className="mb-1 text-xl">{t("title")}</h1>
      <p className="mb-6 text-sm text-neutral-600">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={t("garageName")} htmlFor="garageName">
          <input
            id="garageName"
            required
            value={garageName}
            onChange={(e) => setGarageName(e.target.value)}
            className="input"
            placeholder="Garage AMS Automobiles Sàrl"
          />
        </Field>

        <Field label={t("fullName")} htmlFor="fullName">
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            placeholder="André Da Silva"
          />
        </Field>

        <Field label={t("email")} htmlFor="email">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>

        <Field label={t("password")} htmlFor="password">
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </Field>

        <Field label={t("billingCountry")} htmlFor="billingCountry">
          <select
            id="billingCountry"
            required
            value={billingCountry}
            onChange={(e) => setBillingCountry(e.target.value)}
            className="input"
          >
            <option value="" disabled>
              {t("billingCountryPlaceholder")}
            </option>
            <optgroup label={t("billingCountryMainGroup")}>
              {PRIORITY_BILLING_COUNTRIES.map((code) => (
                <option key={code} value={code}>
                  {countryLabel(code, appLocale)}
                </option>
              ))}
            </optgroup>
            <optgroup label={t("billingCountryOtherGroup")}>
              {sortedOtherCountries(appLocale).map((code) => (
                <option key={code} value={code}>
                  {countryLabel(code, appLocale)}
                </option>
              ))}
            </optgroup>
          </select>
          <p className="text-xs text-neutral-500">{t("billingCountryHint")}</p>
        </Field>

        <label className="flex items-start gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            required
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            {t.rich("acceptTerms", {
              terms: (chunks) => (
                <Link href="/terms" target="_blank" className="underline">
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link href="/privacy" target="_blank" className="underline">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading || !acceptedTerms} className="btn-primary">
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        {t("haveAccount")}{" "}
        <Link href="/login" className="underline">
          {t("loginLink")}
        </Link>
      </p>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
