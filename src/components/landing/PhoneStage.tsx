"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PhoneFrame } from "./PhoneFrame";
import { useReducedMotion } from "./useReducedMotion";

export type PhoneStageHandle = {
  goTo: (index: number) => void;
};

export type PhoneScreen = {
  key: string;
  content: ReactNode;
};

/**
 * Fait tourner une séquence d'écrans dans un cadre de smartphone : boucle
 * automatique (~3s/écran), en pause au survol, hors du viewport, et
 * entièrement désactivée si `prefers-reduced-motion` (navigation au clic
 * uniquement, apparition instantanée). `onActiveIndexChange` permet à un
 * parent (liste d'étapes) de refléter l'étape active ; `ref.goTo(i)` permet
 * à ce même parent de faire sauter le téléphone à un écran précis, ce qui
 * met aussi la boucle en pause quelques secondes.
 */
export const PhoneStage = forwardRef<
  PhoneStageHandle,
  {
    screens: PhoneScreen[];
    intervalMs?: number;
    pauseMs?: number;
    onActiveIndexChange?: (index: number) => void;
  }
>(function PhoneStage({ screens, intervalMs = 3000, pauseMs = 4500, onActiveIndexChange }, ref) {
  const [index, setIndex] = useState(0);
  const pausedUntilRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useImperativeHandle(ref, () => ({
    goTo(i: number) {
      setIndex(((i % screens.length) + screens.length) % screens.length);
      pausedUntilRef.current = Date.now() + pauseMs;
    },
  }));

  useEffect(() => {
    onActiveIndexChange?.(index);
  }, [index, onActiveIndexChange]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      if (hovered || !inView || Date.now() < pausedUntilRef.current) return;
      setIndex((i) => (i + 1) % screens.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reducedMotion, hovered, inView, intervalMs, screens.length]);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <PhoneFrame>
        <div key={index} className="phone-screen-enter h-full w-full">
          {screens[index].content}
        </div>
      </PhoneFrame>
    </div>
  );
});
