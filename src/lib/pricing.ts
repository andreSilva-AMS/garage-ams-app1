export interface PricingPlan {
  country_code: string;
  country_label: string;
  currency: string;
  amount_ht: number;
  stripe_price_id: string | null;
}

/** Formate un prix HT pour l'affichage, ex. "39.00 CHF HT / mois". */
export function formatPriceHt(plan: Pick<PricingPlan, "amount_ht" | "currency">): string {
  return `${plan.amount_ht.toFixed(2)} ${plan.currency} HT / mois`;
}

/**
 * Devine le pays de facturation à partir de la langue du navigateur (jamais
 * l'IP) : on ne retient que le sous-tag de région (ex. "fr-CH" → "CH"), et
 * uniquement s'il correspond à un pays réellement tarifé. Beaucoup de langues
 * (fr, de, en…) ne permettent pas de deviner un pays sans ce sous-tag —
 * dans ce cas on renvoie null plutôt que de risquer un mauvais choix.
 */
export function guessCountryFromLocale(
  pricingPlans: Pick<PricingPlan, "country_code">[],
): string | null {
  if (typeof navigator === "undefined") return null;
  const supported = new Set(pricingPlans.map((p) => p.country_code));
  const tags = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const tag of tags) {
    const region = tag.split("-")[1]?.toUpperCase();
    if (region && supported.has(region)) return region;
  }
  return null;
}
