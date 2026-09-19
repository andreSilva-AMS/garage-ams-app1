"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { LANGUAGES, Lang } from "@/lib/receptions/i18n";
import { PricingPlan, formatPriceHt } from "@/lib/pricing";

function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
}

const OTHER_COUNTRY = "OTHER";

export function SignupForm({ pricingPlans }: { pricingPlans: PricingPlan[] }) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("signup");

  const [garageName, setGarageName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<Lang>("fr");
  const [billingCountry, setBillingCountry] = useState<string>(
    pricingPlans[0]?.country_code ?? OTHER_COUNTRY,
  );
  const [otherCountryLabel, setOtherCountryLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  const isOtherCountry = billingCountry === OTHER_COUNTRY;
  const selectedPlan = pricingPlans.find((p) => p.country_code === billingCountry);

  function handleLanguageChange(value: Lang) {
    setLanguage(value);
    setLocaleCookie(value);
    router.refresh();
  }

  async function handleWaitlistSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: waitlistError } = await supabase.from("waitlist").insert({
      email,
      country_code: otherCountryLabel || null,
      garage_name: garageName || null,
    });

    if (waitlistError) {
      setError(waitlistError.message);
      setLoading(false);
      return;
    }

    setWaitlisted(true);
    setLoading(false);
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

  if (waitlisted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
        <h1 className="text-xl">{t("waitlistDoneTitle")}</h1>
        <p className="text-sm text-neutral-600">{t("waitlistDoneBody")}</p>
        <Link href="/login" className="text-sm underline">
          {t("goToLogin")}
        </Link>
      </main>
    );
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="ReceptCar" width={36} height={36} className="rounded-xl" />
        <span className="text-lg font-medium" style={{ fontFamily: "var(--font-plex-serif)" }}>
          ReceptCar
        </span>
      </div>
      <h1 className="mb-1 text-xl">{t("title")}</h1>
      <p className="mb-6 text-sm text-neutral-600">{t("subtitle")}</p>

      <form onSubmit={isOtherCountry ? handleWaitlistSubmit : handleSubmit} className="flex flex-col gap-4">
        <Field label={t("language")} htmlFor="language">
          <select
            id="language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Lang)}
            className="input"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("billingCountry")} htmlFor="billingCountry">
          <select
            id="billingCountry"
            value={billingCountry}
            onChange={(e) => setBillingCountry(e.target.value)}
            className="input"
          >
            {pricingPlans.map((plan) => (
              <option key={plan.country_code} value={plan.country_code}>
                {plan.country_label} — {formatPriceHt(plan)}
              </option>
            ))}
            <option value={OTHER_COUNTRY}>{t("otherCountry")}</option>
          </select>
          {selectedPlan && (
            <p className="text-xs text-neutral-500">{formatPriceHt(selectedPlan)}</p>
          )}
        </Field>

        {isOtherCountry && (
          <Field label={t("waitlistCountryLabel")} htmlFor="otherCountryLabel">
            <input
              id="otherCountryLabel"
              value={otherCountryLabel}
              onChange={(e) => setOtherCountryLabel(e.target.value)}
              className="input"
            />
          </Field>
        )}

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
            required={!isOtherCountry}
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

        {!isOtherCountry && (
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
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {isOtherCountry
            ? loading
              ? t("waitlistSubmitting")
              : t("waitlistSubmit")
            : loading
              ? t("submitting")
              : t("submit")}
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
