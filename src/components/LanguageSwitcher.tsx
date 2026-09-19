"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGES, Lang } from "@/lib/receptions/i18n";

/**
 * Petit sélecteur compact (drapeau + code) avec menu déroulant, pour les
 * pages avant connexion où la langue de l'appareil peut ne pas convenir.
 */
export function LanguageSwitcher({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (value: Lang) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.value === value) ?? LANGUAGES[0];
  const flag = current.label.split(" ")[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium shadow-sm"
      >
        <span aria-hidden="true">{flag}</span>
        <span>{value.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => {
                onChange(l.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                l.value === value ? "bg-neutral-50 font-semibold" : ""
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
