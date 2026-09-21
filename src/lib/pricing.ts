export interface PricingPlan {
  country_code: string;
  country_label: string;
  currency: string;
  amount_ht: number;
  stripe_price_id: string | null;
}

/**
 * Code du tarif « autre pays » (pricing_plans.is_fallback = true), utilisé
 * quand le pays de facturation du garage n'a pas de ligne dédiée.
 */
export const FALLBACK_PRICING_CODE = "EU";

/** Formate un prix HT pour l'affichage, ex. "39.00 CHF HT / mois". */
export function formatPriceHt(plan: Pick<PricingPlan, "amount_ht" | "currency">): string {
  return `${plan.amount_ht.toFixed(2)} ${plan.currency} HT / mois`;
}

/**
 * Fuseaux horaires IANA associés à chacun de nos pays tarifés. Le fuseau
 * horaire de l'appareil (Intl, jamais l'IP) distingue mieux des pays
 * voisins que la langue seule — ex. quelqu'un réglé en "Français (France)"
 * alors qu'il est en Suisse aura tout de même le fuseau "Europe/Zurich".
 */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  "Europe/Zurich": "CH",
  "Europe/Paris": "FR",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Lisbon": "PT",
  "Atlantic/Madeira": "PT",
  "Atlantic/Azores": "PT",
};

/**
 * Devine le pays de facturation sans jamais utiliser l'IP, en combinant deux
 * indices lus sur l'appareil : d'abord le fuseau horaire (plus fiable pour
 * distinguer des pays voisins qui partagent une langue, ex. Suisse/France),
 * puis à défaut la langue du navigateur (sous-tag de région, ex. "fr-CH" →
 * "CH"). Uniquement retenu si le résultat correspond à un pays réellement
 * tarifé ; sinon on renvoie null plutôt que de risquer un mauvais choix.
 */
export function guessCountryFromLocale(
  pricingPlans: Pick<PricingPlan, "country_code">[],
): string | null {
  if (typeof navigator === "undefined") return null;
  const supported = new Set(pricingPlans.map((p) => p.country_code));

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fromTimeZone = TIMEZONE_TO_COUNTRY[timeZone];
    if (fromTimeZone && supported.has(fromTimeZone)) return fromTimeZone;
  } catch {
    // Intl.DateTimeFormat indisponible : on retombe sur la langue ci-dessous.
  }

  const tags = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const region = tag.split("-")[1]?.toUpperCase();
    if (region && supported.has(region)) return region;
  }
  return null;
}
