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
