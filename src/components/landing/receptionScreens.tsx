import { Camera, Check, FileText, IdCard } from "lucide-react";
import type { PhoneScreen } from "./PhoneStage";

/**
 * Les 5 écrans de la séquence "Réception atelier", reconstruits en
 * HTML/CSS avec les mêmes codes visuels que l'application (champs arrondis,
 * accent ambré, coches vertes) — aucune capture d'écran, aucune photo.
 * Données d'exemple fictives : client "M. Rochat", VW Golf 8, VD 000 000.
 */

function ScreenHeader({ label, step }: { label: string; step: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="text-xs font-semibold tracking-wide text-neutral-400">{label}</span>
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
        {step}
      </span>
    </div>
  );
}

function Field({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div className="step-content" style={{ animationDelay: `${delay}ms` }}>
      <p className="mb-1 text-[11px] font-medium text-neutral-400">{label}</p>
      <p className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-[#1A1C20]">
        {value}
      </p>
    </div>
  );
}

function NewFicheScreen() {
  return (
    <div className="flex h-full flex-col bg-white p-5">
      <ScreenHeader label="NOUVELLE FICHE" step="1 / 5" />
      <div className="space-y-3">
        <Field label="Client" value="M. Rochat" delay={0} />
        <Field label="Véhicule" value="VW Golf 8" delay={120} />
        <Field label="Plaque" value="VD 000 000" delay={240} />
        <Field label="Kilométrage" value="84 210 km" delay={360} />
        <Field label="Travaux demandés" value="Révision + pneus hiver" delay={480} />
      </div>
    </div>
  );
}

function PhotoTile({ label, delay }: { label: string; delay: number }) {
  return (
    <div
      className="pop-in flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 py-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm">
        <Camera className="h-4 w-4" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-2.5 w-2.5" aria-hidden="true" />
        </span>
      </div>
      <span className="text-[10px] font-medium text-neutral-500">{label}</span>
    </div>
  );
}

function PhotosScreen() {
  const tiles = ["Avant", "Arrière", "Gauche", "Droite", "Carte grise"];
  return (
    <div className="flex h-full flex-col bg-white p-5">
      <ScreenHeader label="PHOTOS" step="2 / 5" />
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((label, i) => (
          <PhotoTile key={label} label={label} delay={i * 150} />
        ))}
      </div>
    </div>
  );
}

function DamageMarker({
  label,
  style,
  delay,
}: {
  label: string;
  style: { top: string; left: string };
  delay: number;
}) {
  return (
    <div
      className="pop-in absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800 shadow-sm"
      style={{ ...style, animationDelay: `${delay}ms` }}
    >
      {label}
    </div>
  );
}

function ChecklistRow({ label, delay }: { label: string; delay: number }) {
  return (
    <div
      className="step-content flex items-center gap-2 text-xs font-medium text-[#1A1C20]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded border border-emerald-500 bg-emerald-500 text-white">
        <Check className="h-3 w-3" aria-hidden="true" />
      </span>
      {label}
    </div>
  );
}

function DamageChecklistScreen() {
  return (
    <div className="flex h-full flex-col bg-white p-5">
      <ScreenHeader label="DOMMAGES CONSTATÉS" step="3 / 5" />
      {/* Schéma simplifié du véhicule vu de dessus */}
      <div className="relative mx-auto mb-5 h-36 w-28">
        <svg viewBox="0 0 110 180" className="h-full w-full text-neutral-300" aria-hidden="true">
          <rect x="15" y="5" width="80" height="170" rx="28" fill="none" stroke="currentColor" strokeWidth="3" />
          <rect x="2" y="30" width="12" height="28" rx="4" fill="currentColor" opacity="0.5" />
          <rect x="96" y="30" width="12" height="28" rx="4" fill="currentColor" opacity="0.5" />
          <rect x="2" y="122" width="12" height="28" rx="4" fill="currentColor" opacity="0.5" />
          <rect x="96" y="122" width="12" height="28" rx="4" fill="currentColor" opacity="0.5" />
        </svg>
        <DamageMarker label="Rayée" style={{ top: "22%", left: "8%" }} delay={200} />
        <DamageMarker label="Peinture défectueuse" style={{ top: "78%", left: "92%" }} delay={500} />
      </div>
      <div className="space-y-2.5">
        <ChecklistRow label="Jantes rayées" delay={700} />
        <ChecklistRow label="Intérieur propre" delay={850} />
      </div>
    </div>
  );
}

function SignatureScreen() {
  return (
    <div className="flex h-full flex-col bg-white p-5">
      <ScreenHeader label="SIGNATURE DU CLIENT" step="4 / 5" />
      <p className="mb-4 text-xs text-neutral-500">M. Rochat valide l&rsquo;état du véhicule et les travaux demandés.</p>
      <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-neutral-300">
        <svg viewBox="0 0 220 60" className="h-12 w-44 text-[#1A1C20]" aria-hidden="true">
          <path
            className="signature-path"
            d="M8 44 C 22 10, 38 54, 54 24 S 84 2, 102 36 S 136 54, 158 16 S 196 6, 212 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="pop-in mt-auto" style={{ animationDelay: "1500ms" }}>
        <div className="rounded-xl bg-[#A87B3F] py-2.5 text-center text-sm font-semibold text-white">
          Valider
        </div>
      </div>
    </div>
  );
}

function PdfSentScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white p-5 text-center">
      <div className="w-full max-w-[210px] rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left shadow-sm">
        <div className="mb-2.5 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#A87B3F]" aria-hidden="true" />
          <span className="text-[10px] font-semibold tracking-wide text-neutral-500">
            FICHE DE RÉCEPTION
          </span>
        </div>
        <div className="space-y-1 text-[10px] text-neutral-600">
          <p className="font-medium text-[#1A1C20]">VW Golf 8 — VD 000 000</p>
          <p>84 210 km · M. Rochat</p>
          <p className="flex items-center gap-1 text-amber-700">
            <IdCard className="h-3 w-3 shrink-0" aria-hidden="true" /> 5 photos jointes
          </p>
        </div>
      </div>
      <div
        className="pop-in mt-5 flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700"
        style={{ animationDelay: "500ms" }}
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-2.5 w-2.5" aria-hidden="true" />
        </span>
        Envoyé à client@exemple.ch · Français
      </div>
    </div>
  );
}

export const RECEPTION_SCREENS: PhoneScreen[] = [
  { key: "new-fiche", content: <NewFicheScreen /> },
  { key: "photos", content: <PhotosScreen /> },
  { key: "damage", content: <DamageChecklistScreen /> },
  { key: "signature", content: <SignatureScreen /> },
  { key: "sent", content: <PdfSentScreen /> },
];
