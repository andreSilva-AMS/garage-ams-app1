"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { cropLogoToSquare } from "@/lib/image";
import { LANGUAGES, Lang } from "@/lib/receptions/i18n";
import { InviteEmployeeSection } from "./InviteEmployeeSection";
import { TeamSection } from "./TeamSection";
import { RetentionToggle } from "./RetentionToggle";

interface Garage {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  default_language: string;
  retention_days: number;
  payment_status: string;
  has_workshop: boolean;
  has_sales: boolean;
}

interface PendingInvite {
  id: string;
  email: string;
  roles: string[];
  created_at: string;
}

interface TeamMember {
  id: string;
  full_name: string | null;
  roles: string[];
}

export function GarageSettingsForm({
  garage,
  isOwner,
  pendingInvites,
  teamMembers,
  retentionPrice,
}: {
  garage: Garage;
  isOwner: boolean;
  pendingInvites: PendingInvite[];
  teamMembers: TeamMember[];
  retentionPrice: { amount: number; currency: string } | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const [name, setName] = useState(garage.name);
  const [address, setAddress] = useState(garage.address ?? "");
  const [phone, setPhone] = useState(garage.phone ?? "");
  const [email, setEmail] = useState(garage.email ?? "");
  const [defaultLanguage, setDefaultLanguage] = useState<Lang>(
    (garage.default_language as Lang) ?? "fr",
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(garage.logo_url);
  const [logoBlob, setLogoBlob] = useState<Blob | null>(null);
  const [logoProcessing, setLogoProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onLogoChange(file: File) {
    setLogoProcessing(true);
    setError(null);
    try {
      const { blob, dataUrl } = await cropLogoToSquare(file);
      setLogoBlob(blob);
      setLogoPreview(dataUrl);
    } catch {
      setError(t("logoProcessingError"));
    } finally {
      setLogoProcessing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      let logoUrl = garage.logo_url;
      if (logoBlob) {
        // Toujours un PNG carré 256×256 : voir cropLogoToSquare().
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
              <div className="flex h-16 w-16 items-center justify-center rounded bg-neutral-100">
                <Building2 className="h-7 w-7 text-neutral-400" aria-hidden="true" />
              </div>
            )}
            <label
              className={`btn-secondary cursor-pointer ${!isOwner || logoProcessing ? "pointer-events-none opacity-60" : ""}`}
            >
              {logoProcessing ? tCommon("saving") : t("chooseFile")}
              <input
                type="file"
                accept="image/*"
                disabled={!isOwner || logoProcessing}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onLogoChange(file);
                }}
              />
            </label>
          </div>
          <p className="text-xs text-neutral-500">{t("logoHint")}</p>
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

      <div className="mt-6">
        <RetentionToggle
          active={garage.retention_days === 365}
          canToggle={garage.payment_status === "active"}
          price={retentionPrice}
          isOwner={isOwner}
        />
      </div>

      {isOwner && (
        <InviteEmployeeSection
          pendingInvites={pendingInvites}
          hasWorkshop={garage.has_workshop}
          hasSales={garage.has_sales}
        />
      )}

      <TeamSection teamMembers={teamMembers} />
    </main>
  );
}
