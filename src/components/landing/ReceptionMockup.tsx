import Image from "next/image";
import { Check } from "lucide-react";

/**
 * Composition "device + PDF" construite entièrement en HTML/CSS (pas
 * d'image), avec des données d'exemple fictives et neutres. Utilisée dans le
 * hero de la landing page.
 */
export function ReceptionMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
      {/* Carte "PDF" en arrière-plan, légèrement pivotée */}
      <div className="absolute -right-4 top-10 hidden w-56 rotate-6 rounded-2xl border border-white/10 bg-white p-4 text-[#1A1C20] shadow-2xl sm:block sm:-right-10 sm:w-64">
        <div className="mb-3 flex items-center gap-2">
          <Image src="/logo.png" alt="" width={20} height={20} className="rounded" />
          <span className="text-[11px] font-semibold tracking-wide text-neutral-500">
            FICHE DE RÉCEPTION
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] text-neutral-700">
          <p className="font-medium">VW Golf — VD 123 456</p>
          <p>84 250 km</p>
          <p className="flex items-center gap-1 text-amber-700">
            <Check className="h-3 w-3 shrink-0" aria-hidden="true" /> Aile avant gauche — rayée
          </p>
        </div>
        <div className="mt-3 border-t border-neutral-200 pt-2">
          <svg viewBox="0 0 100 24" className="h-6 w-20 text-neutral-400" aria-hidden="true">
            <path
              d="M2 18 C 10 4, 18 22, 26 10 S 42 2, 50 14 S 66 22, 74 8 S 90 4, 98 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Appareil au premier plan */}
      <div className="relative z-10 rounded-[2rem] border border-white/10 bg-[#101114] p-3 shadow-2xl">
        <div className="rounded-[1.5rem] bg-white p-5 text-[#1A1C20]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-neutral-400">
              CLIENT & VÉHICULE
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              2 / 4
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-1 text-[11px] font-medium text-neutral-400">Véhicule</p>
              <p className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium">
                VW Golf — VD 123 456
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-medium text-neutral-400">Kilométrage</p>
              <p className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium">
                84 250 km
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-medium text-neutral-400">Dommages constatés</p>
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                <Check className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                Aile avant gauche — rayée
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-medium text-neutral-400">Signature du client</p>
              <div className="flex h-14 items-center justify-center rounded-xl border border-dashed border-neutral-300">
                <svg viewBox="0 0 160 32" className="h-7 w-28 text-neutral-500" aria-hidden="true">
                  <path
                    d="M4 24 C 16 6, 28 30, 40 14 S 64 2, 80 20 S 104 30, 120 10 S 148 4, 156 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
