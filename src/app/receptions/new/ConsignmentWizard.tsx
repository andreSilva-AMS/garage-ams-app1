"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { fileToResizedImage, shrinkDataUrl } from "@/lib/image";
import { getGarageTimezone } from "@/lib/timezone";
import { SignaturePad } from "@/components/SignaturePad";
import { LANGUAGES, Lang, DAMAGE_GROUPS, trDamageTag, trCategoryTitle } from "@/lib/receptions/i18n";
import { buildConsignmentPdf } from "@/lib/consignments/pdf";
import { sendConsignmentEmail } from "./consignment-actions";

interface Garage {
  id: string;
  name: string;
  address: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  default_language: string | null;
}

interface PhotoData {
  blob: Blob;
  dataUrl: string;
}
interface CaptionedPhoto extends PhotoData {
  caption: string;
}

const MAX_MARKETING_PHOTOS = 12;
const MAX_MAINTENANCE_PHOTOS = 10;

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Tag({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 active:scale-95 ${
        active ? "border-accent bg-accent text-accent-foreground" : "border-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}

function DocPhotoField({
  label,
  photo,
  onPick,
}: {
  label: string;
  photo: PhotoData | null;
  onPick: (file: File) => void;
}) {
  return (
    <Field label={label}>
      <label className="relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL)
          <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>+</span>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPick(file);
            e.target.value = "";
          }}
        />
      </label>
    </Field>
  );
}

function PhotoGrid({
  title,
  countLabel,
  photos,
  max,
  addLabel,
  removeLabel,
  captionPlaceholder,
  onAdd,
  onRemove,
  onCaptionChange,
}: {
  title: string;
  countLabel: string;
  photos: CaptionedPhoto[];
  max: number;
  addLabel: string;
  removeLabel: string;
  captionPlaceholder: string;
  onAdd: (file: File) => void;
  onRemove: (i: number) => void;
  onCaptionChange: (i: number, caption: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">
        {title} <span className="font-normal text-neutral-500">{countLabel}</span>
      </p>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-300">
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL) */}
              <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={removeLabel}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <input
              className="input text-xs"
              placeholder={captionPlaceholder}
              value={photo.caption}
              onChange={(e) => onCaptionChange(i, e.target.value)}
            />
          </div>
        ))}
        {photos.length < max && (
          <label className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-neutral-300 text-sm text-neutral-500">
            <span className="text-2xl">+</span>
            <span>{addLabel}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAdd(file);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

export function ConsignmentWizard({ garage }: { garage: Garage }) {
  const supabase = createClient();
  const t = useTranslations("consignmentWizard");
  const appLocale = useLocale() as Lang;

  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [plate, setPlate] = useState("");
  const [mileage, setMileage] = useState("");
  const [brandModel, setBrandModel] = useState("");

  const [registrationFront, setRegistrationFront] = useState<PhotoData | null>(null);
  const [registrationBack, setRegistrationBack] = useState<PhotoData | null>(null);
  const [ownerIdFront, setOwnerIdFront] = useState<PhotoData | null>(null);
  const [ownerIdBack, setOwnerIdBack] = useState<PhotoData | null>(null);
  const [dashboardPhoto, setDashboardPhoto] = useState<PhotoData | null>(null);

  const [leasingFree, setLeasingFree] = useState(true);
  const [lastInspectionDate, setLastInspectionDate] = useState("");
  const [keysCount, setKeysCount] = useState("");

  const [damageTags, setDamageTags] = useState<Set<string>>(new Set());
  const [damageText, setDamageText] = useState("");

  const [askingPrice, setAskingPrice] = useState("");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [depositDurationDays, setDepositDurationDays] = useState("");
  const [insuredBy, setInsuredBy] = useState("");

  const [marketingPhotos, setMarketingPhotos] = useState<CaptionedPhoto[]>([]);
  const [maintenancePhotos, setMaintenancePhotos] = useState<CaptionedPhoto[]>([]);

  const [signatureOwner, setSignatureOwner] = useState<string | null>(null);
  const [signatureSeller, setSignatureSeller] = useState<string | null>(null);

  const [lang, setLang] = useState<Lang>((garage.default_language as Lang) ?? "fr");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; pdfUrl: string; hasOwnerEmail: boolean } | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);

  function toggleDamage(value: string) {
    setDamageTags((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function addPhoto(file: File, setter: (p: PhotoData) => void) {
    const resized = await fileToResizedImage(file, 1600, 0.82);
    setter(resized);
  }

  async function addToGrid(file: File, list: CaptionedPhoto[], setList: (p: CaptionedPhoto[]) => void) {
    const resized = await fileToResizedImage(file, 1600, 0.82);
    setList([...list, { ...resized, caption: "" }]);
  }

  async function handleSubmit() {
    setError(null);

    if (!ownerName || !plate) {
      setError(t("errors.requiredFields"));
      return;
    }
    if (!signatureOwner || !signatureSeller) {
      setError(t("errors.signaturesRequired"));
      return;
    }

    setSaving(true);
    try {
      const consignmentId = crypto.randomUUID();
      const base = `${garage.id}/${consignmentId}`;

      async function upload(filename: string, blob: Blob) {
        const path = `${base}/${filename}`;
        const { error: uploadError } = await supabase.storage
          .from("receptions")
          .upload(path, blob, { contentType: blob.type });
        if (uploadError) throw uploadError;
        return path;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", user?.id ?? "")
        .maybeSingle();
      const createdByRole = profile?.roles?.includes("seller") ? "seller" : (profile?.roles?.[0] ?? "owner");

      const { data: inserted, error: insertError } = await supabase
        .from("consignments")
        .insert({
          id: consignmentId,
          garage_id: garage.id,
          created_by: user?.id ?? null,
          created_by_role: createdByRole,
          owner_name: ownerName,
          owner_phone: ownerPhone || null,
          owner_email: ownerEmail || null,
          vehicle_plate: plate,
          vehicle_mileage: mileage ? Number(mileage) : null,
          vehicle_brand_model: brandModel || null,
          leasing_free: leasingFree,
          last_inspection_date: lastInspectionDate || null,
          keys_count: keysCount ? Number(keysCount) : null,
          damage_tags: [...damageTags],
          damage_text: damageText || null,
          asking_price: askingPrice ? Number(askingPrice) : null,
          minimum_price: minimumPrice ? Number(minimumPrice) : null,
          commission_amount: commissionAmount ? Number(commissionAmount) : null,
          commission_percent: commissionPercent ? Number(commissionPercent) : null,
          deposit_duration_days: depositDurationDays ? Number(depositDurationDays) : null,
          insured_by: insuredBy || null,
          language: lang,
        })
        .select("consignment_number")
        .single();
      if (insertError) throw insertError;
      const dossierNumber = inserted.consignment_number as number;

      try {
        const [
          registrationFrontPath,
          registrationBackPath,
          ownerIdFrontPath,
          ownerIdBackPath,
          dashboardPhotoPath,
          marketingUploads,
          maintenanceUploads,
          signatureOwnerUpload,
          signatureSellerUpload,
          garageLogoDataUrl,
        ] = await Promise.all([
          registrationFront ? upload("permis-recto.jpg", registrationFront.blob) : Promise.resolve(null),
          registrationBack ? upload("permis-verso.jpg", registrationBack.blob) : Promise.resolve(null),
          ownerIdFront ? upload("piece-identite-recto.jpg", ownerIdFront.blob) : Promise.resolve(null),
          ownerIdBack ? upload("piece-identite-verso.jpg", ownerIdBack.blob) : Promise.resolve(null),
          dashboardPhoto ? upload("tableau-de-bord.jpg", dashboardPhoto.blob) : Promise.resolve(null),
          Promise.all(
            marketingPhotos.map(async (p, i) => ({
              path: await upload(`annonce-${i + 1}.jpg`, p.blob),
              caption: p.caption,
              dataUrl: p.dataUrl,
            })),
          ),
          Promise.all(
            maintenancePhotos.map(async (p, i) => ({
              path: await upload(`entretien-${i + 1}.jpg`, p.blob),
              caption: p.caption,
              dataUrl: p.dataUrl,
            })),
          ),
          (async () => {
            const jpeg = await shrinkDataUrl(signatureOwner, 900, 0.82);
            const path = await upload("signature-proprietaire.jpg", await (await fetch(jpeg)).blob());
            return { path, jpeg };
          })(),
          (async () => {
            const jpeg = await shrinkDataUrl(signatureSeller, 900, 0.82);
            const path = await upload("signature-vendeur.jpg", await (await fetch(jpeg)).blob());
            return { path, jpeg };
          })(),
          garage.logo_url ? urlToDataUrl(garage.logo_url) : Promise.resolve(null),
        ]);

        const doc = buildConsignmentPdf({
          dossierNumber,
          garageName: garage.name,
          garageAddress: garage.address,
          garagePhone: garage.phone,
          garageEmail: garage.email,
          garageLogoDataUrl,
          owner: { name: ownerName, phone: ownerPhone, email: ownerEmail },
          vehicle: { plate, mileage, brandModel },
          leasingFree,
          lastInspectionDate: lastInspectionDate || null,
          keysCount,
          damageTags: [...damageTags],
          damageText,
          askingPrice,
          minimumPrice,
          commissionAmount,
          commissionPercent,
          depositDurationDays,
          insuredBy,
          signatureOwnerDataUrl: signatureOwnerUpload.jpeg,
          signatureSellerDataUrl: signatureSellerUpload.jpeg,
          marketingPhotos: marketingUploads.map((p) => ({ dataUrl: p.dataUrl, caption: p.caption })),
          maintenancePhotos: maintenanceUploads.map((p) => ({ dataUrl: p.dataUrl, caption: p.caption })),
          lang,
          timezone: getGarageTimezone(garage),
        });
        const pdfBlob = doc.output("blob");
        const pdfPath = await upload("contrat.pdf", pdfBlob);

        const { error: updateError } = await supabase
          .from("consignments")
          .update({
            registration_front_path: registrationFrontPath,
            registration_back_path: registrationBackPath,
            owner_id_front_path: ownerIdFrontPath,
            owner_id_back_path: ownerIdBackPath,
            dashboard_photo_path: dashboardPhotoPath,
            signature_owner_path: signatureOwnerUpload.path,
            signature_seller_path: signatureSellerUpload.path,
            pdf_path: pdfPath,
          })
          .eq("id", consignmentId);
        if (updateError) throw updateError;

        const photoRows = [
          ...marketingUploads.map((p, i) => ({
            consignment_id: consignmentId,
            garage_id: garage.id,
            kind: "marketing" as const,
            storage_path: p.path,
            caption: p.caption || null,
            position: i,
          })),
          ...maintenanceUploads.map((p, i) => ({
            consignment_id: consignmentId,
            garage_id: garage.id,
            kind: "maintenance" as const,
            storage_path: p.path,
            caption: p.caption || null,
            position: i,
          })),
        ];
        if (photoRows.length > 0) {
          const { error: photosError } = await supabase.from("consignment_photos").insert(photoRows);
          if (photosError) throw photosError;
        }

        const { data: signed } = await supabase.storage.from("receptions").createSignedUrl(pdfPath, 3600);
        setDone({ id: consignmentId, pdfUrl: signed?.signedUrl ?? "", hasOwnerEmail: Boolean(ownerEmail) });
        if (ownerEmail) {
          void attemptSendEmail(consignmentId);
        }
      } catch (err) {
        await supabase.from("consignments").delete().eq("id", consignmentId);
        throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  async function attemptSendEmail(consignmentId: string) {
    setEmailStatus("sending");
    setEmailError(null);
    const result = await sendConsignmentEmail(consignmentId);
    if (result.ok) {
      setEmailStatus("sent");
    } else {
      setEmailStatus("error");
      setEmailError(result.error);
    }
  }

  if (done) {
    const title = !done.hasOwnerEmail
      ? t("doneTitle")
      : emailStatus === "sent"
        ? t("doneTitleSent", { email: ownerEmail })
        : emailStatus === "error"
          ? t("doneTitleError")
          : t("doneTitle");

    return (
      <main className="mx-auto max-w-lg px-4 py-10 text-center">
        <h1 className="mb-4 text-xl font-semibold">{title}</h1>
        {(!done.hasOwnerEmail || emailStatus === "sending" || emailStatus === "idle") && (
          <p className="mb-6 text-sm text-neutral-600">{t("doneBody", { garageName: garage.name })}</p>
        )}
        {!done.hasOwnerEmail && <p className="mb-6 text-sm text-neutral-500">{t("noOwnerEmail")}</p>}
        {emailStatus === "error" && (
          <p className="mb-6 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{emailError}</p>
        )}
        <div className="flex flex-col gap-3">
          {done.pdfUrl && (
            <a href={done.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              {t("viewPdf")}
            </a>
          )}
          {done.hasOwnerEmail && emailStatus !== "sent" && emailStatus !== "sending" && (
            <button type="button" className="btn-secondary" onClick={() => void attemptSendEmail(done.id)}>
              {t("resend")}
            </button>
          )}
          <Link href="/receptions/new" className="btn-primary">
            {t("newOne")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold">{t("title")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="flex flex-col gap-6"
      >
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("ownerSectionTitle")}</h2>
          <Field label={t("ownerName")}>
            <input className="input" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </Field>
          <Field label={t("ownerPhone")}>
            <input
              className="input"
              type="tel"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
            />
          </Field>
          <Field label={t("ownerEmail")}>
            <input
              className="input"
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("vehicleSectionTitle")}</h2>
          <Field label={t("plate")}>
            <input className="input" required value={plate} onChange={(e) => setPlate(e.target.value)} />
          </Field>
          <Field label={t("brandModel")}>
            <input className="input" value={brandModel} onChange={(e) => setBrandModel(e.target.value)} />
          </Field>
          <Field label={t("mileage")}>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("documentsSectionTitle")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <DocPhotoField label={t("registrationFront")} photo={registrationFront} onPick={(f) => addPhoto(f, setRegistrationFront)} />
            <DocPhotoField label={t("registrationBack")} photo={registrationBack} onPick={(f) => addPhoto(f, setRegistrationBack)} />
            <DocPhotoField label={t("ownerIdFront")} photo={ownerIdFront} onPick={(f) => addPhoto(f, setOwnerIdFront)} />
            <DocPhotoField label={t("ownerIdBack")} photo={ownerIdBack} onPick={(f) => addPhoto(f, setOwnerIdBack)} />
            <DocPhotoField label={t("dashboardPhoto")} photo={dashboardPhoto} onPick={(f) => addPhoto(f, setDashboardPhoto)} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={leasingFree} onChange={(e) => setLeasingFree(e.target.checked)} />
            {t("leasingFreeLabel")}
          </label>
          {!leasingFree && (
            <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{t("leasingWarning")}</p>
          )}

          <Field label={t("lastInspectionDate")}>
            <input
              className="input"
              type="date"
              value={lastInspectionDate}
              onChange={(e) => setLastInspectionDate(e.target.value)}
            />
          </Field>
          <Field label={t("keysCount")}>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              value={keysCount}
              onChange={(e) => setKeysCount(e.target.value)}
            />
          </Field>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("damageTitle")}</h2>
          {damageTags.size > 0 && (
            <p className="mb-3 text-sm text-muted">
              {[...damageTags].map((tag) => trDamageTag(tag, appLocale)).join(" · ")}
            </p>
          )}
          {Object.entries(DAMAGE_GROUPS).map(([groupTitle, tags]) => {
            const selectedCount = tags.filter((tag) => damageTags.has(tag)).length;
            return (
              <details key={groupTitle} className="group mb-2 rounded-xl border border-border-color">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{trCategoryTitle(groupTitle, appLocale)}</span>
                  <span className="flex items-center gap-2">
                    {selectedCount > 0 && (
                      <span className="badge bg-accent/10 text-accent-strong">{selectedCount}</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                  </span>
                </summary>
                <div className="flex flex-wrap gap-2 px-3 pb-3">
                  {tags.map((tag) => (
                    <Tag key={tag} active={damageTags.has(tag)} onClick={() => toggleDamage(tag)}>
                      {trDamageTag(tag, appLocale)}
                    </Tag>
                  ))}
                </div>
              </details>
            );
          })}
          <Field label={t("damageDetails")}>
            <textarea className="input min-h-24" value={damageText} onChange={(e) => setDamageText(e.target.value)} />
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("commercialSectionTitle")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("askingPrice")}>
              <input className="input" type="number" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} />
            </Field>
            <Field label={t("minimumPrice")}>
              <input className="input" type="number" value={minimumPrice} onChange={(e) => setMinimumPrice(e.target.value)} />
            </Field>
            <Field label={t("commissionAmount")}>
              <input
                className="input"
                type="number"
                value={commissionAmount}
                onChange={(e) => setCommissionAmount(e.target.value)}
              />
            </Field>
            <Field label={t("commissionPercent")}>
              <input
                className="input"
                type="number"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
              />
            </Field>
            <Field label={t("depositDurationDays")}>
              <input
                className="input"
                type="number"
                value={depositDurationDays}
                onChange={(e) => setDepositDurationDays(e.target.value)}
              />
            </Field>
          </div>
          <Field label={t("insuredBy")}>
            <input className="input" value={insuredBy} onChange={(e) => setInsuredBy(e.target.value)} />
          </Field>
        </section>

        <PhotoGrid
          title={t("marketingPhotosTitle")}
          countLabel={`${marketingPhotos.length}/${MAX_MARKETING_PHOTOS}`}
          photos={marketingPhotos}
          max={MAX_MARKETING_PHOTOS}
          addLabel={t("addPhoto")}
          removeLabel={t("removePhoto")}
          captionPlaceholder={t("photoCaptionPlaceholder")}
          onAdd={(f) => void addToGrid(f, marketingPhotos, setMarketingPhotos)}
          onRemove={(i) => setMarketingPhotos(marketingPhotos.filter((_, idx) => idx !== i))}
          onCaptionChange={(i, c) =>
            setMarketingPhotos(marketingPhotos.map((p, idx) => (idx === i ? { ...p, caption: c } : p)))
          }
        />

        <PhotoGrid
          title={t("maintenancePhotosTitle")}
          countLabel={`${maintenancePhotos.length}/${MAX_MAINTENANCE_PHOTOS}`}
          photos={maintenancePhotos}
          max={MAX_MAINTENANCE_PHOTOS}
          addLabel={t("addPhoto")}
          removeLabel={t("removePhoto")}
          captionPlaceholder={t("photoCaptionPlaceholder")}
          onAdd={(f) => void addToGrid(f, maintenancePhotos, setMaintenancePhotos)}
          onRemove={(i) => setMaintenancePhotos(maintenancePhotos.filter((_, idx) => idx !== i))}
          onCaptionChange={(i, c) =>
            setMaintenancePhotos(maintenancePhotos.map((p, idx) => (idx === i ? { ...p, caption: c } : p)))
          }
        />

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("signatureOwnerTitle")}</h2>
          <SignaturePad onChange={setSignatureOwner} clearLabel={t("clearSignature")} />
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("signatureSellerTitle")}</h2>
          <SignaturePad onChange={setSignatureSeller} clearLabel={t("clearSignature")} />
          <p className="text-xs text-neutral-500">{t("consent")}</p>
        </section>

        <Field label={t("docLanguage")}>
          <select className="input" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t("generating")}
            </>
          ) : (
            t("generate")
          )}
        </button>
      </form>
    </main>
  );
}
