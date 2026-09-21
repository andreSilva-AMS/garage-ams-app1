/**
 * Fuseau horaire du garage, dérivé du pays de facturation (ou à défaut de la
 * langue par défaut du garage). Un seul cas diverge vraiment parmi les pays
 * ciblés : le Portugal (UTC+0/+1), une heure derrière la Suisse/France/
 * Espagne/Italie (UTC+1/+2).
 */
const TIMEZONE_BY_COUNTRY: Record<string, string> = {
  CH: "Europe/Zurich",
  FR: "Europe/Paris",
  DE: "Europe/Berlin",
  IT: "Europe/Rome",
  ES: "Europe/Madrid",
  PT: "Europe/Lisbon",
};

const TIMEZONE_BY_LANG: Record<string, string> = {
  fr: "Europe/Zurich",
  en: "Europe/Zurich",
  es: "Europe/Madrid",
  pt: "Europe/Lisbon",
  de: "Europe/Zurich",
  it: "Europe/Rome",
};

const DEFAULT_TIMEZONE = "Europe/Zurich";

export function getGarageTimezone(garage: {
  billing_country?: string | null;
  default_language?: string | null;
}): string {
  if (garage.billing_country && TIMEZONE_BY_COUNTRY[garage.billing_country]) {
    return TIMEZONE_BY_COUNTRY[garage.billing_country];
  }
  if (garage.default_language && TIMEZONE_BY_LANG[garage.default_language]) {
    return TIMEZONE_BY_LANG[garage.default_language];
  }
  return DEFAULT_TIMEZONE;
}

/** Toujours "jj.mm.aaaa hh:mm" (24h), quel que soit le fuseau/la locale de l'environnement d'exécution. */
export function formatGarageDateTime(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")} ${get("hour")}:${get("minute")}`;
}
