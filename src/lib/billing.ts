export interface GarageBilling {
  subscription_plan: string;
  payment_status: string;
  trial_ends_at: string | null;
}

/** Un garage a accès au produit s'il est gratuit, à jour de paiement, ou encore en période d'essai. */
export function hasActiveAccess(garage: GarageBilling): boolean {
  if (garage.subscription_plan === "free" || garage.payment_status === "free") return true;
  if (garage.payment_status === "active") return true;
  if (garage.payment_status === "trialing") {
    if (!garage.trial_ends_at) return true;
    return new Date(garage.trial_ends_at) > new Date();
  }
  return false;
}
