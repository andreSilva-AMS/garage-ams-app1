"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LANGUAGES, Lang } from "@/lib/receptions/i18n";

/**
 * Code pays (ISO 3166-1) utilisé pour l'image de drapeau — distinct du code
 * langue, car l'émoji 🇫🇷/🇬🇧/... ne s'affiche pas comme un vrai drapeau sur
 * tous les systèmes (notamment Windows sans police d'émoji couleur) : il
 * retombe alors sur les deux lettres brutes ("FR", "GB"...), ce que l'on veut
 * éviter en servant une vraie image.
 */
const FLAG_COUNTRY: Record<Lang, string> = {
  fr: "fr",
  en: "gb",
  es: "es",
  pt: "pt",
  de: "de",
  it: "it",
  sq: "al",
  el: "gr",
  ru: "ru",
};

function FlagIcon({ lang, className = "" }: { lang: Lang; className?: string }) {
  const country = FLAG_COUNTRY[lang];
  return (
    <img
      src={`https://flagcdn.com/w40/${country}.png`}
      srcSet={`https://flagcdn.com/w80/${country}.png 2x`}
      alt=""
      aria-hidden="true"
      className={`inline-block h-3.5 w-5 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${className}`}
    />
  );
}

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
  const t = useTranslations("common");
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
  const languageName = (label: string) => label.split(" ").slice(1).join(" ");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium shadow-sm"
      >
        <span className="sr-only">{t("language")}</span>
        <FlagIcon lang={current.value} />
        <span>{value.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => {
                onChange(l.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                l.value === value ? "bg-neutral-50 font-semibold" : ""
              }`}
            >
              <FlagIcon lang={l.value} />
              <span>{languageName(l.label)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
