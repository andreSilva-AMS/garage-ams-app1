/**
 * Pays de facturation proposés à l'inscription. Cinq pays ont un tarif
 * dédié (voir pricing_plans) ; les autres utilisent le tarif « autre pays »
 * (is_fallback = true). Doit rester synchronisé avec la liste blanche SQL
 * dans la migration 0019 (contrainte garages_billing_country_check et
 * create_garage_and_owner).
 */
export const PRIORITY_BILLING_COUNTRIES = ["CH", "FR", "PT", "ES", "IT"] as const;

export const OTHER_BILLING_COUNTRIES = [
  "DE", "AT", "BE", "NL", "LU", "GB", "IE", "DK", "SE", "NO", "FI", "IS",
  "PL", "CZ", "SK", "HU", "SI", "HR", "RO", "BG", "GR", "MT", "CY",
  "EE", "LV", "LT", "LI", "AD", "MC", "SM",
] as const;

export const ALL_BILLING_COUNTRIES = [...PRIORITY_BILLING_COUNTRIES, ...OTHER_BILLING_COUNTRIES];

/**
 * Nom localisé d'un pays via l'API Intl du navigateur (pas de traduction
 * manuelle à maintenir dans 6 langues pour ~35 pays). Retombe sur le code si
 * Intl.DisplayNames est indisponible (très ancien navigateur).
 */
export function countryLabel(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Pays "autres" triés par nom localisé, pour l'affichage dans le <select>. */
export function sortedOtherCountries(locale: string): string[] {
  return [...OTHER_BILLING_COUNTRIES].sort((a, b) =>
    countryLabel(a, locale).localeCompare(countryLabel(b, locale), locale),
  );
}
