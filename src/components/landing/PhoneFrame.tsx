import type { ReactNode } from "react";

/**
 * Cadre de smartphone en CSS pur : coins arrondis, encoche discrète. Pas de
 * fausse barre d'état (heure/batterie) — ce serait une information inventée.
 * L'écran simulé vise ~390×844 (iPhone standard), mis à l'échelle par le
 * conteneur parent via max-width + aspect-ratio.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px]">
      <div
        className="relative rounded-[2.75rem] border border-white/10 bg-[#101114] p-2.5 shadow-2xl"
        style={{ aspectRatio: "390 / 844" }}
      >
        {/* Encoche */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-2.5 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#101114]"
        />
        <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
