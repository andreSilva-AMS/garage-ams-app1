import { Check, FileCheck2, IdCard } from "lucide-react";
import type { PhoneScreen } from "./PhoneStage";

/**
 * Les écrans de la séquence "Dépôt-vente", mêmes codes visuels que les
 * écrans de réception. Données d'exemple fictives : propriétaire
 * "Mme Chevalley", Audi A4, VD 000 001.
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

function IntakeScreen() {
  return (
    <div className="flex h-full flex-col bg-white p-5">
      <ScreenHeader label="PRISE EN CHARGE" step="1 / 4" />
      <div className="space-y-3">
        <Field label="Propriétaire" value="Mme Chevalley" delay={0} />
        <Field label="Véhicule" value="Audi A4" delay={120} />
        <Field label="Plaque" value="VD 000 001" delay={240} />
        <Field label="Kilométrage" value="52 600 km" delay={360} />
      </div>
    </div>
  );
}

function DocTile({ label, icon: Icon, delay }: { label: string; icon: typeof IdCard; delay: number }) {
  return (
    <div
      className="pop-in flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 py-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-2.5 w-2.5" aria-hidden="true" />
        </span>
      </div>
      <span className="text-[10px] font-medium text-neutral-500">{label}</span>
    </div>
  );
}

function DocsPhotosScreen() {
  return (
    <div className="flex h-full flex-col bg-white p-5">
      <ScreenHeader label="PHOTOS & DOCUMENTS" step="2 / 4" />
      <div className="grid grid-cols-2 gap-3">
        <DocTile label="Avant" icon={IdCard} delay={0} />
        <DocTile label="Arrière" icon={IdCard} delay={150} />
        <DocTile label="Carte grise" icon={FileCheck2} delay={300} />
        <DocTile label="Pièce d'identité" icon={IdCard} delay={450} />
      </div>
    </div>
  );
}

function ConditionRow({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div
      className="step-content flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-[#1A1C20]">{value}</span>
    </div>
  );
}

function ConditionsScreen() {
  return (
    <div className="flex h-full flex-col bg-white p-5">
      <ScreenHeader label="CONDITIONS DE VENTE" step="3 / 4" />
      <div className="space-y-2.5">
        <ConditionRow label="Durée du dépôt" value="60 jours" delay={0} />
        <ConditionRow label="Documents reçus" value="Complets" delay={150} />
        <ConditionRow label="Type de dossier" value="Dépôt-vente" delay={300} />
      </div>
    </div>
  );
}

function ContractSignedScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white p-5 text-center">
      <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-neutral-300 px-6">
        <svg viewBox="0 0 220 60" className="h-10 w-40 text-[#1A1C20]" aria-hidden="true">
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
      <div className="w-full max-w-[200px] mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-left shadow-sm">
        <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-amber-900">
          <span className="flex items-center gap-1.5">
            <FileCheck2 className="h-3.5 w-3.5 shrink-0 text-[#A87B3F]" aria-hidden="true" />
            Contrat_depot_vente.pdf
          </span>
        </div>
      </div>
      <div
        className="pop-in mt-4 flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700"
        style={{ animationDelay: "500ms" }}
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-2.5 w-2.5" aria-hidden="true" />
        </span>
        Envoyé à proprietaire@exemple.ch
      </div>
    </div>
  );
}

export const CONSIGNMENT_SCREENS: PhoneScreen[] = [
  { key: "intake", content: <IntakeScreen /> },
  { key: "docs-photos", content: <DocsPhotosScreen /> },
  { key: "conditions", content: <ConditionsScreen /> },
  { key: "contract-signed", content: <ContractSignedScreen /> },
];
