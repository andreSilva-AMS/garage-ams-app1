"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fileToResizedImage, shrinkDataUrl } from "@/lib/image";
import { SignaturePad } from "@/components/SignaturePad";
import {
  LANGUAGES,
  Lang,
  DAMAGE_GROUPS,
  trDamageTag,
  WORK_TAGS,
  trWorkTag,
} from "@/lib/receptions/i18n";
import { buildReceptionPdf } from "@/lib/receptions/pdf";

type Angle = "front" | "back" | "left" | "right";
interface PhotoData {
  blob: Blob;
  dataUrl: string;
}
interface Garage {
  id: string;
  name: string;
  address: string | null;
}

const ANGLE_LABELS: Record<Angle, string> = {
  front: "Avant",
  back: "Arrière",
  left: "Côté gauche",
  right: "Côté droit",
};

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
      className={`rounded-full border px-3 py-1.5 text-sm ${
        active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}

export function ReceptionWizard({ garage }: { garage: Garage }) {
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ pdfUrl: string } | null>(null);

  const [client, setClient] = useState({
    name: "",
    phone: "",
    email: "",
    plate: "",
    mileage: "",
    brandModel: "",
  });
  const [photos, setPhotos] = useState<Partial<Record<Angle, PhotoData>>>({});
  const [cardGrey, setCardGrey] = useState<PhotoData | null>(null);
  const [damageTags, setDamageTags] = useState<Set<string>>(new Set());
  const [damageText] = useState("");
  const [workTags, setWorkTags] = useState<Set<string>>(new Set());
  const [workText, setWorkText] = useState("");
  const [lang, setLang] = useState<Lang>("fr");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  function toggle(set: Set<string>, setFn: (v: Set<string>) => void, value: string) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setFn(next);
  }

  function validateStep(): boolean {
    setError(null);
    if (step === 1) {
      if (!client.name.trim() || !client.plate.trim()) {
        setError("Nom du client et plaque requis");
        return false;
      }
    }
    if (step === 2) {
      const missing = (["front", "back", "left", "right"] as Angle[]).filter((a) => !photos[a]);
      if (missing.length) {
        setError("Il manque des photos du véhicule");
        return false;
      }
    }
    if (step === 3 && workTags.size === 0 && !workText.trim()) {
      setError("Précisez au moins une intervention");
      return false;
    }
    if (step === 4 && !signatureDataUrl) {
      setError("Signature requise");
      return false;
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(5, s + 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function handlePhotoChange(angle: Angle, file: File) {
    const resized = await fileToResizedImage(file, 780, 0.5);
    setPhotos((p) => ({ ...p, [angle]: resized }));
  }

  async function handleCardGreyChange(file: File) {
    const resized = await fileToResizedImage(file, 900, 0.55);
    setCardGrey(resized);
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const receptionId = crypto.randomUUID();
      const base = `${garage.id}/${receptionId}`;

      async function upload(filename: string, blob: Blob) {
        const path = `${base}/${filename}`;
        const { error: uploadError } = await supabase.storage
          .from("receptions")
          .upload(path, blob, { contentType: blob.type });
        if (uploadError) throw uploadError;
        return path;
      }

      const photoPaths: Partial<Record<Angle, string>> = {};
      const photoDataUrls: Partial<Record<Angle, string>> = {};
      for (const angle of ["front", "back", "left", "right"] as Angle[]) {
        const p = photos[angle];
        if (p) {
          photoPaths[angle] = await upload(`${angle}.jpg`, p.blob);
          photoDataUrls[angle] = p.dataUrl;
        }
      }
      const cardGreyPath = cardGrey ? await upload("carte-grise.jpg", cardGrey.blob) : null;

      const signatureJpeg = signatureDataUrl
        ? await shrinkDataUrl(signatureDataUrl, 900, 0.82)
        : null;
      const signaturePath = signatureJpeg
        ? await upload("signature.jpg", await (await fetch(signatureJpeg)).blob())
        : null;

      const doc = buildReceptionPdf({
        garageName: garage.name,
        garageAddress: garage.address,
        client,
        workTags: [...workTags],
        workText,
        damageTags: [...damageTags],
        damageText,
        photos: photoDataUrls,
        cardGreyDataUrl: cardGrey?.dataUrl ?? null,
        signatureDataUrl: signatureJpeg,
        lang,
      });
      const pdfBlob = doc.output("blob");
      const pdfPath = await upload("fiche.pdf", pdfBlob);

      const { error: insertError } = await supabase.from("receptions").insert({
        id: receptionId,
        garage_id: garage.id,
        client_name: client.name,
        client_phone: client.phone || null,
        client_email: client.email || null,
        vehicle_plate: client.plate,
        vehicle_mileage: client.mileage ? Number(client.mileage) : null,
        vehicle_brand_model: client.brandModel || null,
        damage_tags: [...damageTags],
        damage_text: damageText || null,
        work_tags: [...workTags],
        work_text: workText || null,
        language: lang,
        photo_front_path: photoPaths.front ?? null,
        photo_back_path: photoPaths.back ?? null,
        photo_left_path: photoPaths.left ?? null,
        photo_right_path: photoPaths.right ?? null,
        photo_card_grey_path: cardGreyPath,
        signature_path: signaturePath,
        pdf_path: pdfPath,
      });
      if (insertError) throw insertError;

      const { data: signed } = await supabase.storage
        .from("receptions")
        .createSignedUrl(pdfPath, 3600);
      setDone({ pdfUrl: signed?.signedUrl ?? "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 text-center">
        <h1 className="mb-4 text-xl font-semibold">Fiche enregistrée</h1>
        <p className="mb-6 text-sm text-neutral-600">
          La fiche de réception a été créée et sauvegardée pour {garage.name}.
        </p>
        <div className="flex flex-col gap-3">
          <a href={done.pdfUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Voir le PDF
          </a>
          <Link href="/receptions/new" className="text-sm underline">
            Nouvelle réception
          </Link>
          <Link href="/dashboard" className="text-sm underline">
            Retour au tableau de bord
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <p className="mb-1 text-sm text-neutral-500">Étape {step} / 5</p>
      <div className="mb-6 h-1 w-full rounded bg-neutral-200">
        <div
          className="h-1 rounded bg-neutral-900 transition-all"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {step === 1 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Client &amp; véhicule</h2>
          <Field label="Nom du client">
            <input
              className="input"
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Téléphone">
              <input
                className="input"
                type="tel"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
              />
            </Field>
            <Field label="E-mail du client">
              <input
                className="input"
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plaque d'immatriculation">
              <input
                className="input"
                value={client.plate}
                onChange={(e) => setClient({ ...client, plate: e.target.value })}
              />
            </Field>
            <Field label="Kilométrage">
              <input
                className="input"
                type="number"
                value={client.mileage}
                onChange={(e) => setClient({ ...client, mileage: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Marque / modèle">
            <input
              className="input"
              value={client.brandModel}
              onChange={(e) => setClient({ ...client, brandModel: e.target.value })}
            />
          </Field>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold">Photos du véhicule</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["front", "back", "left", "right"] as Angle[]).map((angle) => (
              <label
                key={angle}
                className="flex aspect-square flex-col items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-neutral-50 text-sm"
              >
                {photos[angle] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), rien à optimiser
                  <img
                    src={photos[angle]!.dataUrl}
                    alt={ANGLE_LABELS[angle]}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>📷 {ANGLE_LABELS[angle]}</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoChange(angle, file);
                  }}
                />
              </label>
            ))}
          </div>

          <label className="flex items-center gap-3 rounded-md border border-neutral-300 p-3">
            {cardGrey ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), rien à optimiser
              <img src={cardGrey.dataUrl} alt="Carte grise" className="h-14 w-14 rounded object-cover" />
            ) : (
              <span className="text-2xl">🪪</span>
            )}
            <span className="text-sm">
              <b>Carte grise</b>
              <br />
              Photo du permis de circulation
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCardGreyChange(file);
              }}
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium">
              Dommages constatés à la réception{" "}
              <span className="font-normal text-neutral-500">(protection du garage)</span>
            </p>
            {Object.entries(DAMAGE_GROUPS).map(([title, tags]) => (
              <div key={title} className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase text-neutral-500">{title}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      active={damageTags.has(tag)}
                      onClick={() => toggle(damageTags, setDamageTags, tag)}
                    >
                      {trDamageTag(tag, lang)}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Travaux demandés</h2>
          <p className="text-sm font-medium">Interventions courantes</p>
          <div className="flex flex-wrap gap-2">
            {WORK_TAGS.map((tag) => (
              <Tag key={tag} active={workTags.has(tag)} onClick={() => toggle(workTags, setWorkTags, tag)}>
                {trWorkTag(tag, lang)}
              </Tag>
            ))}
          </div>
          <Field label="Détails / autres demandes du client">
            <textarea
              className="input min-h-24"
              value={workText}
              onChange={(e) => setWorkText(e.target.value)}
            />
          </Field>
        </section>
      )}

      {step === 4 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Signature du client</h2>
          <SignaturePad onChange={setSignatureDataUrl} />
          <p className="text-xs text-neutral-500">
            En signant, le client certifie l&apos;exactitude des informations ci-dessus et
            accepte l&apos;état du véhicule tel que constaté et documenté par photos lors de la
            réception.
          </p>
        </section>
      )}

      {step === 5 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Récapitulatif</h2>
          <Field label="Langue du document envoyé au client">
            <select
              className="input"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="rounded-md border border-neutral-200 p-4 text-sm">
            <SummaryRow k="Client" v={client.name} />
            <SummaryRow k="Téléphone" v={client.phone || "—"} />
            <SummaryRow k="E-mail" v={client.email || "—"} />
            <SummaryRow k="Véhicule" v={client.brandModel || "—"} />
            <SummaryRow k="Plaque" v={client.plate} />
            <SummaryRow k="Kilométrage" v={`${client.mileage || "—"} km`} />
            <SummaryRow
              k="Travaux"
              v={[...workTags, ...(workText ? [workText] : [])].join(" · ") || "—"}
            />
            <SummaryRow
              k="Dommages notés"
              v={[...damageTags, ...(damageText ? [damageText] : [])].join(" · ") || "—"}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="btn-primary"
          >
            {saving ? "Génération en cours…" : "Générer la fiche PDF"}
          </button>
        </section>
      )}

      {error && step !== 5 && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button type="button" onClick={back} className="text-sm underline">
            Retour
          </button>
        ) : (
          <span />
        )}
        {step < 5 && (
          <button type="button" onClick={next} className="btn-primary">
            Continuer
          </button>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-100 py-1.5 last:border-0">
      <span className="text-neutral-500">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
