import { FileCheck2 } from "lucide-react";

/**
 * Mockup CSS d'une fiche de dépôt-vente, données fictives et neutres.
 */
export function ConsignmentMockup() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-white p-6 text-[#1A1C20] shadow-2xl">
      <div className="mb-4 flex items-center gap-2">
        <FileCheck2 className="h-5 w-5 text-amber-700" aria-hidden="true" />
        <span className="text-xs font-semibold tracking-wide text-neutral-400">
          DOSSIER DE DÉPÔT-VENTE
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="mb-1 text-[11px] font-medium text-neutral-400">Propriétaire</p>
          <p className="rounded-xl border border-neutral-200 px-3 py-2 font-medium">
            J. Dupont
          </p>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-medium text-neutral-400">Véhicule</p>
          <p className="rounded-xl border border-neutral-200 px-3 py-2 font-medium">
            Audi A4 — VD 987 654
          </p>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-medium text-neutral-400">Contrat</p>
          <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 font-medium text-amber-900">
            <span>Contrat_depot_vente.pdf</span>
            <FileCheck2 className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
