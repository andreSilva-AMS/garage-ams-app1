"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cropLogoToSquare } from "@/lib/image";
import { LANGUAGES, Lang } from "@/lib/receptions/i18n";

interface Garage {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  default_language: string;
}

const STEP_COUNT = 3;

export function OnboardingWizard({ garage }: { garage: Garage }) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("onboarding");
  const tSettings = useTranslations("settings");
  const tCommon = useTranslations("common");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(garage.logo_url);
  const [logoBlob, setLogoBlob] = useState<Blob | null>(null);
  const [logoProcessing, setLogoProcessing] = useState(false);
  const [name, setName] = useState(garage.name);
  const [address, setAddress] = useState(garage.address ?? "");
  const [phone, setPhone] = useState(garage.phone ?? "");
  const [email, setEmail] = useState(garage.email ?? "");
  const [defaultLanguage, setDefaultLanguage] = useState<Lang>(
    (garage.default_language as Lang) ?? "fr",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogoChange(file: File) {
    setLogoProcessing(true);
    setError(null);
    try {
      const { blob, dataUrl } = await cropLogoToSquare(file);
      setLogoBlob(blob);
      setLogoPreview(dataUrl);
    } catch {
      setError(tSettings("logoProcessingError"));
    } finally {
      setLogoProcessing(false);
    }
  }

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      let logoUrl = garage.logo_url;
      if (logoBlob) {
        const path = `${garage.id}/logo.png`;
        const { error: uploadError } = await supabase.storage
          .from("garage-logos")
          .upload(path, logoBlob, { upsert: true, contentType: "image/png" });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("garage-logos").getPublicUrl(path);
        logoUrl = data.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("garages")
        .update({
          name,
          address: address || null,
          phone: phone || null,
          email: email || null,
          default_language: defaultLanguage,
          logo_url: logoUrl,
          onboarding_completed: true,
        })
        .eq("id", garage.id);
      if (updateError) throw updateError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setSaving(false);
    }
  }

  async function skip() {
    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("garages")
        .update({ onboarding_completed: true })
        .eq("id", garage.id);
      if (updateError) throw updateError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setSaving(false);
    }
  }

  const stepNames = [t("stepNames.logo"), t("stepNames.contact"), t("stepNames.language")];

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{t("step", { step })}</p>
        <button
          type="button"
          disabled={saving}
          onClick={skip}
          className="text-sm font-medium text-muted underline disabled:opacity-60"
        >
          {t("skip")}
        </button>
      </div>

      <ol className="mb-8 flex gap-2">
        {stepNames.map((label, i) => (
          <li key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${i + 1 <= step ? "bg-accent" : "bg-black/10"}`}
              aria-hidden="true"
            />
            <span
              className={`mt-1.5 block text-xs ${i + 1 === step ? "font-semibold text-foreground" : "text-muted"}`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t("logoStepTitle")}</h1>
            <p className="mt-1 text-sm text-muted">{t("logoStepBody")}</p>
          </div>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local, taille variable selon le fichier importé
              <img
                src={logoPreview}
                alt=""
                className="h-16 w-16 rounded object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded bg-neutral-100">
                <Building2 className="h-7 w-7 text-neutral-400" aria-hidden="true" />
              </div>
            )}
            <label
              className={`btn-secondary cursor-pointer ${logoProcessing ? "pointer-events-none opacity-60" : ""}`}
            >
              {logoProcessing ? tCommon("saving") : tSettings("chooseFile")}
              <input
                type="file"
                accept="image/*"
                disabled={logoProcessing}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onLogoChange(file);
                }}
              />
            </label>
          </div>
          <p className="text-xs text-neutral-500">{tSettings("logoHint")}</p>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t("contactStepTitle")}</h1>
            <p className="mt-1 text-sm text-muted">{t("contactStepBody")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{tSettings("garageName")}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{tSettings("address")}</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{tSettings("garagePhone")}</label>
              <input
                className="input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">{tSettings("garageEmail")}</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-neutral-500">{tSettings("garageContactHint")}</p>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t("languageStepTitle")}</h1>
            <p className="mt-1 text-sm text-muted">{t("languageStepBody")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{tSettings("defaultLanguage")}</label>
            <select
              className="input"
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value as Lang)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          disabled={step === 1 || saving}
          onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
          className="btn-secondary disabled:invisible"
        >
          {tCommon("back")}
        </button>
        {step < STEP_COUNT ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
            className="btn-primary"
          >
            {tCommon("continue")}
          </button>
        ) : (
          <button type="button" disabled={saving} onClick={finish} className="btn-primary">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {saving ? t("finishing") : t("finish")}
          </button>
        )}
      </div>
    </main>
  );
}
