"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { LANGUAGES, Lang } from "@/lib/receptions/i18n";
import { InviteEmployeeSection } from "./InviteEmployeeSection";

interface Garage {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  default_language: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export function GarageSettingsForm({
  garage,
  isOwner,
  pendingInvites,
}: {
  garage: Garage;
  isOwner: boolean;
  pendingInvites: PendingInvite[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("settings");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const [name, setName] = useState(garage.name);
  const [address, setAddress] = useState(garage.address ?? "");
  const [phone, setPhone] = useState(garage.phone ?? "");
  const [email, setEmail] = useState(garage.email ?? "");
  const [defaultLanguage, setDefaultLanguage] = useState<Lang>(
    (garage.default_language as Lang) ?? "fr",
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(garage.logo_url);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onLogoChange(file: File) {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      let logoUrl = garage.logo_url;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop() ?? "png";
        const path = `${garage.id}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("garage-logos")
          .upload(path, logoFile, { upsert: true, contentType: logoFile.type });
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
        })
        .eq("id", garage.id);
      if (updateError) throw updateError;

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">{t("title")}</h1>

      {!isOwner && (
        <p className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
          {t("ownerOnly")}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{t("logo")}</label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local, taille variable selon le fichier importé
              <img
                src={logoPreview}
                alt={t("garageName")}
                className="h-16 w-16 rounded object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded bg-neutral-100 text-2xl">
                🏢
              </div>
            )}
            <label
              className={`btn-secondary cursor-pointer ${!isOwner ? "pointer-events-none opacity-60" : ""}`}
            >
              {t("chooseFile")}
              <input
                type="file"
                accept="image/*"
                disabled={!isOwner}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onLogoChange(file);
                }}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{t("garageName")}</label>
          <input
            className="input"
            value={name}
            disabled={!isOwner}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{t("address")}</label>
          <input
            className="input"
            value={address}
            disabled={!isOwner}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("garagePhone")}</label>
            <input
              className="input"
              type="tel"
              value={phone}
              disabled={!isOwner}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{t("garageEmail")}</label>
            <input
              className="input"
              type="email"
              value={email}
              disabled={!isOwner}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-neutral-500">{t("garageContactHint")}</p>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{t("defaultLanguage")}</label>
          <select
            className="input"
            value={defaultLanguage}
            disabled={!isOwner}
            onChange={(e) => setDefaultLanguage(e.target.value as Lang)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-500">{t("defaultLanguageHint")}</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-700">{t("saved")}</p>}

        {isOwner && (
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? tCommon("saving") : tCommon("save")}
          </button>
        )}
      </form>

      {isOwner && <InviteEmployeeSection pendingInvites={pendingInvites} />}

      <Link href="/dashboard" className="mt-8 inline-block text-sm underline">
        {tNav("backToDashboard")}
      </Link>
    </main>
  );
}
