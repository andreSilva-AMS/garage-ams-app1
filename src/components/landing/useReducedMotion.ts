"use client";

import { useEffect, useState } from "react";

/**
 * Reflète `prefers-reduced-motion` en JS, pour les comportements qu'un
 * media query CSS seul ne peut pas couvrir (ex. arrêter un minuteur
 * d'autoplay). Les animations elles-mêmes restent désactivées via CSS
 * (@media prefers-reduced-motion: reduce dans globals.css), donc le rendu
 * reste correct même avant l'hydratation de ce hook.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reduced;
}
