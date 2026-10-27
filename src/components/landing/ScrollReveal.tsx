"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Apparition douce (fondu + léger déplacement vertical) quand l'élément entre
 * dans le viewport. `prefers-reduced-motion` est géré par le CSS global
 * (transition désactivée), donc même sans JS actif le contenu reste visible.
 */
export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "200px 0px 200px 0px" },
    );
    observer.observe(node);
    // Filet de sécurité : certains modes de rendu (capture plein-page sans
    // vrai défilement, robots, etc.) ne déclenchent jamais l'observateur.
    // Le contenu ne doit jamais rester invisible indéfiniment.
    const fallback = window.setTimeout(() => setVisible(true), 1200);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${visible ? "scroll-reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
