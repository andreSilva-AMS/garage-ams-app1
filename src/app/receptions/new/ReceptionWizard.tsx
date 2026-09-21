"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  FileText,
  Gauge,
  IdCard,
  Loader2,
  RotateCcw,
  Share2,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { fileToResizedImage, shrinkDataUrl } from "@/lib/image";
import { getGarageTimezone } from "@/lib/timezone";
import { SignaturePad } from "@/components/SignaturePad";
import { CarOutline } from "@/components/CarOutline";
import {
  LANGUAGES,
  Lang,
  DAMAGE_GROUPS,
  trDamageTag,
  trCategoryTitle,
  WORK_TAGS,
  trWorkTag,
} from "@/lib/receptions/i18n";
import { buildReceptionPdf } from "@/lib/receptions/pdf";
import { sendReceptionEmail, translateTexts } from "../actions";

type Angle = "front" | "back" | "left" | "right";
type FuelLevel = "empty" | "quarter" | "half" | "three_quarter" | "full";
const FUEL_LEVELS: FuelLevel[] = ["empty", "quarter", "half", "three_quarter", "full"];
interface PhotoData {
  blob: Blob;
  dataUrl: string;
}
interface ExtraPhoto extends PhotoData {
  caption: string;
}
const MAX_EXTRA_PHOTOS = 10;
interface Garage {
  id: string;
  name: string;
  address: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  default_language: string | null;
  billing_country: string | null;
}

// Sauvegarde locale du texte saisi (pas les photos/signature, trop lourdes
// et rapides à reprendre) : évite de perdre 10 minutes de saisie client si
// la tablette perd la connexion, se recharge par erreur, ou si l'employé
// change d'écran en cours de route.
const DRAFT_STORAGE_KEY = "receptcar_reception_draft";
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface ClientInfo {
  name: string;
  phone: string;
  email: string;
  plate: string;
  mileage: string;
  brandModel: string;
}

interface ReceptionDraft {
  savedAt: number;
  client: ClientInfo;
  damageTags: string[];
  damageText: string;
  workTags: string[];
  workText: string;
  lang: Lang;
}

/** Empreinte SHA-256 du PDF final, pour détecter toute altération ultérieure. */
async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
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

export function ReceptionWizard({ garage }: { garage: Garage }) {
  const supabase = createClient();
  const t = useTranslations("receptionWizard");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  // Langue de l'interface (celle du garage) : utilisée pour afficher les
  // étiquettes de dommages/travaux pendant la saisie. Distincte de `lang`
  // ci-dessous, qui est la langue du DOCUMENT envoyé au client.
  const appLocale = useLocale() as Lang;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; pdfUrl: string; hasClientEmail: boolean } | null>(
    null,
  );
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  // Calculé après montage (évite un décalage d'hydratation : navigator
  // n'existe pas côté serveur, donc absent au premier rendu client aussi).
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  async function attemptSendEmail(receptionId: string) {
    setEmailStatus("sending");
    setEmailError(null);
    const result = await sendReceptionEmail(receptionId);
    if (result.ok) {
      setEmailStatus("sent");
    } else {
      setEmailStatus("error");
      setEmailError(result.error);
    }
  }

  async function handleShare(pdfUrl: string) {
    if (!canShare) return;
    try {
      await navigator.share({ title: t("doneTitle"), url: pdfUrl });
    } catch {
      // Partage annulé par l'utilisateur, ou navigateur sans support
      // complet : rien à faire, ce n'est pas une erreur à signaler.
    }
  }

  const [client, setClient] = useState<ClientInfo>({
    name: "",
    phone: "",
    email: "",
    plate: "",
    mileage: "",
    brandModel: "",
  });
  const [photos, setPhotos] = useState<Partial<Record<Angle, PhotoData>>>({});
  const [cardGrey, setCardGrey] = useState<PhotoData | null>(null);
  const [dashboardPhoto, setDashboardPhoto] = useState<PhotoData | null>(null);
  const [fuelLevel, setFuelLevel] = useState<FuelLevel | "">("");
  const [extraPhotos, setExtraPhotos] = useState<ExtraPhoto[]>([]);
  const [damageTags, setDamageTags] = useState<Set<string>>(new Set());
  const [damageText, setDamageText] = useState("");
  const [workTags, setWorkTags] = useState<Set<string>>(new Set());
  const [workText, setWorkText] = useState("");
  const [lang, setLang] = useState<Lang>(appLocale);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const skipNextDraftSaveRef = useRef(true);

  // Restaure un brouillon laissé par une saisie interrompue (une seule fois,
  // au montage). Fait après le premier rendu (plutôt que dans l'état initial)
  // pour que le HTML généré côté serveur corresponde à celui du premier
  // rendu client — sinon React signale une erreur d'hydratation.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as ReceptionDraft;
      if (Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return;
      }
      const hasContent =
        draft.client.name.trim() ||
        draft.client.plate.trim() ||
        draft.workText.trim() ||
        draft.damageText.trim() ||
        draft.damageTags.length > 0 ||
        draft.workTags.length > 0;
      if (!hasContent) return;
      // Restauration ponctuelle depuis localStorage au montage (pas une
      // synchronisation continue avec un état externe changeant) : le cas
      // d'usage prévu par la règle react-hooks/set-state-in-effect ne
      // s'applique pas ici.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClient(draft.client);
      setDamageTags(new Set(draft.damageTags));
      setDamageText(draft.damageText);
      setWorkTags(new Set(draft.workTags));
      setWorkText(draft.workText);
      setLang(draft.lang);
      setDraftRestored(true);
    } catch {
      // Brouillon corrompu ou stockage indisponible : on l'ignore.
    }
  }, []);

  // Sauvegarde continue du texte saisi (pas la première fois, pour ne pas
  // écraser un brouillon tout juste restauré avec l'état initial vide).
  useEffect(() => {
    if (skipNextDraftSaveRef.current) {
      skipNextDraftSaveRef.current = false;
      return;
    }
    const draft: ReceptionDraft = {
      savedAt: Date.now(),
      client,
      damageTags: [...damageTags],
      damageText,
      workTags: [...workTags],
      workText,
      lang,
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Stockage plein ou indisponible (navigation privée) : on continue
      // sans bloquer la saisie, seule la sauvegarde locale est perdue.
    }
  }, [client, damageTags, damageText, workTags, workText, lang]);

  function discardDraft() {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setClient({ name: "", phone: "", email: "", plate: "", mileage: "", brandModel: "" });
    setDamageTags(new Set());
    setDamageText("");
    setWorkTags(new Set());
    setWorkText("");
    setDraftRestored(false);
  }

  const ANGLE_LABELS: Record<Angle, string> = {
    front: t("angleFront"),
    back: t("angleBack"),
    left: t("angleLeft"),
    right: t("angleRight"),
  };

  const STEP_NAMES = [
    t("stepNames.client"),
    t("stepNames.photos"),
    t("stepNames.work"),
    t("stepNames.signature"),
    t("stepNames.summary"),
  ];

  const angleInputRefs = useRef<Partial<Record<Angle, HTMLInputElement | null>>>({});

  function toggle(set: Set<string>, setFn: (v: Set<string>) => void, value: string) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setFn(next);
  }

  function validateStep(): boolean {
    setError(null);
    if (step === 1) {
      if (!client.name.trim() || !client.plate.trim() || !client.mileage.trim()) {
        setError(t("errors.requiredFields"));
        return false;
      }
      if (client.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email.trim())) {
        setError(t("errors.invalidEmail"));
        return false;
      }
      if (client.phone.trim() && !/^[0-9+()\-.\s]{6,}$/.test(client.phone.trim())) {
        setError(t("errors.invalidPhone"));
        return false;
      }
    }
    if (step === 2) {
      const missing = (["front", "back", "left", "right"] as Angle[]).filter((a) => !photos[a]);
      if (missing.length) {
        setError(t("errors.missingPhotos"));
        return false;
      }
    }
    if (step === 3 && workTags.size === 0 && !workText.trim()) {
      setError(t("errors.workRequired"));
      return false;
    }
    if (step === 4 && !signatureDataUrl) {
      setError(t("errors.signatureRequired"));
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
    const resized = await fileToResizedImage(file, 1600, 0.8);
    setPhotos((p) => ({ ...p, [angle]: resized }));
  }

  async function handleCardGreyChange(file: File) {
    const resized = await fileToResizedImage(file, 900, 0.55);
    setCardGrey(resized);
  }

  async function handleDashboardPhotoChange(file: File) {
    const resized = await fileToResizedImage(file, 900, 0.6);
    setDashboardPhoto(resized);
  }

  async function handleAddExtraPhoto(file: File) {
    if (extraPhotos.length >= MAX_EXTRA_PHOTOS) return;
    const resized = await fileToResizedImage(file, 1600, 0.8);
    setExtraPhotos((p) => [...p, { ...resized, caption: "" }]);
  }

  function updateExtraPhotoCaption(index: number, caption: string) {
    setExtraPhotos((p) => p.map((photo, i) => (i === index ? { ...photo, caption } : photo)));
  }

  function removeExtraPhoto(index: number) {
    setExtraPhotos((p) => p.filter((_, i) => i !== index));
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

      // Insertion précoce (avant l'envoi des fichiers) : c'est elle qui
      // attribue le numéro de fiche séquentiel (colonne "identity" en base),
      // nécessaire pour l'imprimer sur le PDF généré juste après. Les champs
      // liés aux fichiers sont mis à jour ensuite, une fois connus.
      const { data: insertedReception, error: insertError } = await supabase
        .from("receptions")
        .insert({
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
          fuel_level: fuelLevel || null,
          language: lang,
        })
        .select("reception_number")
        .single();
      if (insertError) throw insertError;
      const receptionNumber = insertedReception.reception_number as number;

      // À partir d'ici, la fiche existe déjà en base (avec son numéro) :
      // si une étape suivante échoue (envoi d'un fichier, etc.), on supprime
      // cette fiche incomplète plutôt que de laisser une entrée fantôme
      // (sans PDF ni photos) traîner dans l'historique.
      try {
      // Tout ce qui suit est indépendant (photos, signature, logo du garage,
      // traduction) : lancé en parallèle plutôt qu'en série pour ne pas
      // attendre chaque envoi l'un après l'autre (jusqu'à une quinzaine
      // d'envois pour une fiche avec beaucoup de photos supplémentaires).
      const angles = (["front", "back", "left", "right"] as Angle[]).filter((a) => photos[a]);

      const [
        angleResults,
        cardGreyPath,
        dashboardPhotoPath,
        extraPhotoUploads,
        signatureResult,
        garageLogoDataUrl,
      ] = await Promise.all([
        Promise.all(
          angles.map(async (angle) => {
            const p = photos[angle]!;
            const path = await upload(`${angle}.jpg`, p.blob);
            return { angle, path, dataUrl: p.dataUrl };
          }),
        ),
        cardGrey ? upload("carte-grise.jpg", cardGrey.blob) : Promise.resolve(null),
        dashboardPhoto ? upload("tableau-de-bord.jpg", dashboardPhoto.blob) : Promise.resolve(null),
        Promise.all(
          extraPhotos.map(async (photo, i) => {
            const path = await upload(`extra-${i + 1}.jpg`, photo.blob);
            return { path, caption: photo.caption, dataUrl: photo.dataUrl };
          }),
        ),
        (async () => {
          if (!signatureDataUrl) return null;
          const signatureJpeg = await shrinkDataUrl(signatureDataUrl, 900, 0.82);
          const path = await upload("signature.jpg", await (await fetch(signatureJpeg)).blob());
          return { path, signatureJpeg };
        })(),
        garage.logo_url ? urlToDataUrl(garage.logo_url) : Promise.resolve(null),
      ]);

      const photoPaths: Partial<Record<Angle, string>> = {};
      const photoDataUrls: Partial<Record<Angle, string>> = {};
      for (const { angle, path, dataUrl } of angleResults) {
        photoPaths[angle] = path;
        photoDataUrls[angle] = dataUrl;
      }
      const signaturePath = signatureResult?.path ?? null;
      const signatureJpeg = signatureResult?.signatureJpeg ?? null;

      // Le texte libre est saisi dans la langue de l'interface (appLocale) ;
      // s'il doit apparaître dans un document rédigé dans une autre langue
      // pour le client, on le fait traduire (best-effort — voir translateTexts).
      let pdfWorkText = workText;
      let pdfExtraPhotos = extraPhotoUploads.map((p) => ({ dataUrl: p.dataUrl, caption: p.caption }));
      if (lang !== appLocale) {
        const [translatedWorkText, ...translatedCaptions] = await translateTexts(
          [workText, ...extraPhotoUploads.map((p) => p.caption)],
          appLocale,
          lang,
        );
        pdfWorkText = translatedWorkText;
        pdfExtraPhotos = extraPhotoUploads.map((p, i) => ({
          dataUrl: p.dataUrl,
          caption: translatedCaptions[i],
        }));
      }

      const doc = buildReceptionPdf({
        receptionNumber,
        garageName: garage.name,
        garageAddress: garage.address,
        garagePhone: garage.phone,
        garageEmail: garage.email,
        garageLogoDataUrl,
        client,
        workTags: [...workTags],
        workText: pdfWorkText,
        damageTags: [...damageTags],
        damageText,
        photos: photoDataUrls,
        cardGreyDataUrl: cardGrey?.dataUrl ?? null,
        dashboardPhotoDataUrl: dashboardPhoto?.dataUrl ?? null,
        fuelLevel: fuelLevel || null,
        signatureDataUrl: signatureJpeg,
        extraPhotos: pdfExtraPhotos,
        lang,
        timezone: getGarageTimezone(garage),
      });
      const pdfBlob = doc.output("blob");
      const pdfSha256 = await sha256Hex(await pdfBlob.arrayBuffer());
      const pdfPath = await upload("fiche.pdf", pdfBlob);

      const { error: updateError } = await supabase
        .from("receptions")
        .update({
          photo_front_path: photoPaths.front ?? null,
          photo_back_path: photoPaths.back ?? null,
          photo_left_path: photoPaths.left ?? null,
          photo_right_path: photoPaths.right ?? null,
          photo_card_grey_path: cardGreyPath,
          photo_dashboard_path: dashboardPhotoPath,
          signature_path: signaturePath,
          pdf_path: pdfPath,
          pdf_sha256: pdfSha256,
        })
        .eq("id", receptionId);
      if (updateError) throw updateError;

      if (extraPhotoUploads.length > 0) {
        const { error: extraError } = await supabase.from("reception_extra_photos").insert(
          extraPhotoUploads.map((p, i) => ({
            reception_id: receptionId,
            garage_id: garage.id,
            storage_path: p.path,
            caption: p.caption || null,
            position: i,
          })),
        );
        if (extraError) throw extraError;
      }

      const { data: signed } = await supabase.storage
        .from("receptions")
        .createSignedUrl(pdfPath, 3600);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDone({
        id: receptionId,
        pdfUrl: signed?.signedUrl ?? "",
        hasClientEmail: Boolean(client.email),
      });
      if (client.email) {
        // Envoi automatique dès la fiche prête : l'écran de succès affiche
        // directement "Fiche envoyée à [e-mail]" plutôt que d'attendre un
        // clic. "Renvoyer" reste disponible en cas d'échec ou de besoin.
        void attemptSendEmail(receptionId);
      }
      } catch (err) {
        await supabase.from("receptions").delete().eq("id", receptionId);
        throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    const title = !done.hasClientEmail
      ? t("doneTitle")
      : emailStatus === "sent"
        ? t("doneTitleSent", { email: client.email })
        : emailStatus === "error"
          ? t("doneTitleError")
          : t("doneTitle");

    return (
      <main className="mx-auto max-w-lg px-4 py-10 text-center">
        <h1 className="mb-4 text-xl font-semibold">{title}</h1>
        {(!done.hasClientEmail || emailStatus === "sending" || emailStatus === "idle") && (
          <p className="mb-6 text-sm text-neutral-600">
            {t("doneBody", { garageName: garage.name })}
          </p>
        )}
        {!done.hasClientEmail && (
          <p className="mb-6 text-sm text-neutral-500">{t("noClientEmail")}</p>
        )}
        {emailStatus === "error" && (
          <p className="mb-6 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{emailError}</p>
        )}
        {emailStatus === "sent" && (
          <p className="mb-6 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
            {t("sentSpamNotice")}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {done.hasClientEmail && (
            <button
              type="button"
              disabled={emailStatus === "sending"}
              onClick={() => attemptSendEmail(done.id)}
              className={emailStatus === "error" ? "btn-primary" : "btn-secondary"}
            >
              {emailStatus === "sending" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              )}
              {emailStatus === "sending"
                ? t("sending")
                : emailStatus === "error"
                  ? tCommon("retry")
                  : t("resend")}
            </button>
          )}

          <a href={done.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary">
            <FileText className="h-4 w-4" aria-hidden="true" />
            {t("viewPdf")}
          </a>

          {canShare && (
            <button
              type="button"
              onClick={() => handleShare(done.pdfUrl)}
              className="btn-secondary"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              {t("share")}
            </button>
          )}

          <Link href="/receptions/new" className="btn-primary">
            {t("newOne")}
          </Link>
          <Link href="/dashboard" className="text-sm underline">
            {tNav("backToDashboard")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 pb-28">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm underline text-neutral-500"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {tNav("backToDashboard")}
      </Link>
      <ol className="mb-6 flex items-start justify-between gap-1" aria-label={t("step", { step })}>
        {STEP_NAMES.map((name, i) => {
          const stepIndex = i + 1;
          const isCurrent = stepIndex === step;
          const isDone = stepIndex < step;
          return (
            <li key={name} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`h-1.5 w-full rounded-full ${
                  isDone || isCurrent ? "bg-accent" : "bg-neutral-200"
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-center text-xs ${
                  isCurrent ? "font-semibold text-foreground" : "text-muted"
                }`}
              >
                {name}
              </span>
            </li>
          );
        })}
      </ol>

      {draftRestored && (
        <p className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
          <span>{t("draftRestored")}</span>
          <button type="button" onClick={discardDraft} className="shrink-0 underline">
            {t("draftDiscard")}
          </button>
        </p>
      )}

      {step === 1 && (
        <section className="step-content flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("step1Title")}</h2>
          <Field label={t("clientName")}>
            <input
              className="input"
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("phone")}>
              <input
                className="input"
                type="tel"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
              />
            </Field>
            <Field label={t("clientEmail")}>
              <input
                className="input"
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("plate")}>
              <input
                className="input"
                value={client.plate}
                onChange={(e) => setClient({ ...client, plate: e.target.value })}
              />
            </Field>
            <Field label={t("mileage")}>
              <input
                className="input"
                type="number"
                value={client.mileage}
                onChange={(e) => setClient({ ...client, mileage: e.target.value })}
              />
            </Field>
          </div>
          <Field label={t("brandModel")}>
            <input
              className="input"
              value={client.brandModel}
              onChange={(e) => setClient({ ...client, brandModel: e.target.value })}
            />
          </Field>
        </section>
      )}

      {step === 2 && (
        <section className="step-content flex flex-col gap-6">
          <h2 className="text-lg font-semibold">{t("step2Title")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["front", "back", "left", "right"] as Angle[]).map((angle) => (
              <div
                key={angle}
                className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-50 text-sm"
              >
                <input
                  ref={(el) => {
                    angleInputRefs.current[angle] = el;
                  }}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoChange(angle, file);
                    e.target.value = "";
                  }}
                />
                {photos[angle] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), rien à optimiser */}
                    <img
                      src={photos[angle]!.dataUrl}
                      alt={ANGLE_LABELS[angle]}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => angleInputRefs.current[angle]?.click()}
                      className="absolute bottom-2 flex min-h-11 items-center gap-1.5 rounded-full bg-black/60 px-3 text-sm font-medium text-white"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      {t("retakePhoto")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => angleInputRefs.current[angle]?.click()}
                    className="flex h-full w-full flex-col items-center justify-center gap-1.5"
                  >
                    <CarOutline angle={angle} className="h-16 w-24 text-neutral-300" />
                    <span className="flex items-center gap-1.5 text-neutral-500">
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      {ANGLE_LABELS[angle]}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-neutral-300 p-3">
            {cardGrey ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), rien à optimiser
              <img
                src={cardGrey.dataUrl}
                alt={t("cardGrey")}
                className="h-14 w-14 rounded object-cover"
              />
            ) : (
              <IdCard className="h-8 w-8 text-neutral-400" aria-hidden="true" />
            )}
            <span className="text-sm">
              <b>{t("cardGrey")}</b>
              <br />
              {t("cardGreyHint")}
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

          <label className="flex items-center gap-3 rounded-2xl border border-neutral-300 p-3">
            {dashboardPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), rien à optimiser
              <img
                src={dashboardPhoto.dataUrl}
                alt={t("dashboardPhoto")}
                className="h-14 w-14 rounded object-cover"
              />
            ) : (
              <Gauge className="h-8 w-8 text-neutral-400" aria-hidden="true" />
            )}
            <span className="text-sm">
              <b>{t("dashboardPhoto")}</b>
              <br />
              {t("dashboardPhotoHint")}
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDashboardPhotoChange(file);
              }}
            />
          </label>

          <Field label={t("fuelLevel")}>
            <select
              className="input"
              value={fuelLevel}
              onChange={(e) => setFuelLevel(e.target.value as FuelLevel | "")}
            >
              <option value="">{t("summary.none")}</option>
              {FUEL_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {t(`fuelLevels.${level}`)}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">
                {t("damageTitle")}{" "}
                <span className="font-normal text-neutral-500">{t("damageSubtitle")}</span>
              </p>
              <span className="badge bg-accent/10 text-accent">{damageTags.size}</span>
            </div>
            {damageTags.size > 0 && (
              <p className="mb-3 text-sm text-muted">
                {[...damageTags].map((tag) => trDamageTag(tag, appLocale)).join(" · ")}
              </p>
            )}
            {Object.entries(DAMAGE_GROUPS).map(([title, tags]) => {
              const selectedCount = tags.filter((tag) => damageTags.has(tag)).length;
              return (
                <details key={title} className="group mb-2 rounded-xl border border-border-color">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                    <span>{trCategoryTitle(title, appLocale)}</span>
                    <span className="flex items-center gap-2">
                      {selectedCount > 0 && (
                        <span className="badge bg-accent/10 text-accent">{selectedCount}</span>
                      )}
                      <ChevronDown
                        className="h-4 w-4 text-muted transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </span>
                  </summary>
                  <div className="flex flex-wrap gap-2 px-3 pb-3">
                    {tags.map((tag) => (
                      <Tag
                        key={tag}
                        active={damageTags.has(tag)}
                        onClick={() => toggle(damageTags, setDamageTags, tag)}
                      >
                        {trDamageTag(tag, appLocale)}
                      </Tag>
                    ))}
                  </div>
                </details>
              );
            })}
            <Field label={t("damageDetails")}>
              <textarea
                className="input min-h-24"
                value={damageText}
                onChange={(e) => setDamageText(e.target.value)}
              />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">
              {t("extraPhotosTitle")}{" "}
              <span className="font-normal text-neutral-500">
                {t("extraPhotosCount", { count: extraPhotos.length, max: MAX_EXTRA_PHOTOS })}
              </span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {extraPhotos.map((photo, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-300">
                    {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (data URL), rien à optimiser */}
                    <img
                      src={photo.dataUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExtraPhoto(i)}
                      aria-label={t("removePhoto")}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <input
                    className="input text-xs"
                    placeholder={t("extraPhotoCaptionPlaceholder")}
                    value={photo.caption}
                    onChange={(e) => updateExtraPhotoCaption(i, e.target.value)}
                  />
                </div>
              ))}
              {extraPhotos.length < MAX_EXTRA_PHOTOS && (
                <label className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-neutral-300 text-sm text-neutral-500">
                  <span className="text-2xl">+</span>
                  <span>{t("addPhoto")}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAddExtraPhoto(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="step-content flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("step3Title")}</h2>
          <p className="text-sm font-medium">{t("commonWork")}</p>
          <div className="flex flex-wrap gap-2">
            {WORK_TAGS.map((tag) => (
              <Tag key={tag} active={workTags.has(tag)} onClick={() => toggle(workTags, setWorkTags, tag)}>
                {trWorkTag(tag, appLocale)}
              </Tag>
            ))}
          </div>
          <Field label={t("workDetails")}>
            <textarea
              className="input min-h-24"
              value={workText}
              onChange={(e) => setWorkText(e.target.value)}
            />
          </Field>
        </section>
      )}

      {step === 4 && (
        <section className="step-content flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("step4Title")}</h2>
          <SignaturePad onChange={setSignatureDataUrl} clearLabel={t("clearSignature")} />
          {signatureDataUrl && client.name && (
            <p className="-mt-2 text-sm font-medium text-muted">{client.name}</p>
          )}
          <p className="text-xs text-neutral-500">{t("consent")}</p>
        </section>
      )}

      {step === 5 && (
        <section className="step-content flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{t("step5Title")}</h2>
          <Field label={t("docLanguage")}>
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
          <div className="rounded-2xl border border-neutral-200 p-4 text-sm">
            <SummaryRow k={t("summary.client")} v={client.name} />
            <SummaryRow k={t("summary.phone")} v={client.phone || t("summary.none")} />
            <SummaryRow k={t("summary.email")} v={client.email || t("summary.none")} />
            <SummaryRow k={t("summary.vehicle")} v={client.brandModel || t("summary.none")} />
            <SummaryRow k={t("summary.plate")} v={client.plate} />
            <SummaryRow k={t("summary.mileage")} v={`${client.mileage || t("summary.none")} km`} />
            <SummaryRow
              k={t("summary.work")}
              v={[...workTags, ...(workText ? [workText] : [])].join(" · ") || t("summary.none")}
            />
            <SummaryRow
              k={t("summary.damage")}
              v={[...damageTags, ...(damageText ? [damageText] : [])].join(" · ") || t("summary.none")}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </section>
      )}

      {error && step !== 5 && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="fixed inset-x-0 bottom-0 border-t border-border-color bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          {step > 1 ? (
            <button type="button" onClick={back} className="text-sm font-medium underline">
              {tCommon("back")}
            </button>
          ) : (
            <span />
          )}
          {step < 5 ? (
            <button type="button" onClick={next} className="btn-primary">
              {tCommon("continue")}
            </button>
          ) : (
            <button type="button" disabled={saving} onClick={handleSubmit} className="btn-primary">
              {saving ? t("generating") : t("generate")}
            </button>
          )}
        </div>
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
