"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

type ActionResult = { ok: true; url: string } | { ok: false; error: string };
type SimpleResult = { ok: true } | { ok: false; error: string };

type OwnerGarage = {
  id: string;
  name: string;
  stripe_customer_id: string | null;
  billing_country: string | null;
};

type OwnerGarageResult =
  | { error: string }
  | { supabase: Awaited<ReturnType<typeof createClient>>; garage: OwnerGarage };

async function getOwnerGarage(): Promise<OwnerGarageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, roles")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "Profil introuvable." as const };
  if (!profile.roles.includes("owner")) {
    return { error: "Seul le propriétaire du garage peut gérer la facturation." as const };
  }

  const { data: garage } = await supabase
    .from("garages")
    .select("id, name, stripe_customer_id, billing_country")
    .eq("id", profile.garage_id)
    .single();
  if (!garage) return { error: "Garage introuvable." as const };

  return { supabase, garage };
}

export async function createCheckoutSession(countryCode?: string): Promise<ActionResult> {
  const result = await getOwnerGarage();
  if ("error" in result) return { ok: false, error: result.error };
  const { supabase, garage } = result;

  // Le pays de facturation est normalement déjà fixé depuis l'inscription
  // (voir migration 0019 : non modifiable ensuite, sauf par l'administration).
  // `countryCode` ne sert que pour les garages créés avant cette
  // fonctionnalité, qui n'en ont pas encore — premier choix, une seule fois.
  const resolvedCountry = garage.billing_country ?? countryCode;
  if (!resolvedCountry) {
    return { ok: false, error: "Pays de facturation manquant." };
  }

  const { data: dedicatedPlan } = await supabase
    .from("pricing_plans")
    .select("country_code, stripe_price_id")
    .eq("country_code", resolvedCountry)
    .eq("active", true)
    .maybeSingle();

  const plan =
    dedicatedPlan ??
    (
      await supabase
        .from("pricing_plans")
        .select("country_code, stripe_price_id")
        .eq("is_fallback", true)
        .eq("active", true)
        .maybeSingle()
    ).data;

  if (!plan) {
    return { ok: false, error: "Pays de facturation non pris en charge." };
  }
  if (!plan.stripe_price_id) {
    return {
      ok: false,
      error: "Le tarif pour ce pays n'est pas encore configuré. Contactez le support.",
    };
  }

  const stripe = getStripeClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!garage.billing_country) {
    await supabase.from("garages").update({ billing_country: resolvedCountry }).eq("id", garage.id);
  }

  let customerId = garage.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: garage.name,
      metadata: { garage_id: garage.id },
    });
    customerId = customer.id;
    await supabase.from("garages").update({ stripe_customer_id: customerId }).eq("id", garage.id);
  }

  // Stripe Tax (calcul automatique de la TVA) : préparé mais désactivé tant
  // que la configuration fiscale n'est pas validée dans le Dashboard Stripe.
  // À activer en réglant STRIPE_TAX_ENABLED=true (variable d'environnement).
  const stripeTaxEnabled = process.env.STRIPE_TAX_ENABLED === "true";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    ...(stripeTaxEnabled ? { automatic_tax: { enabled: true } } : {}),
    metadata: { garage_id: garage.id, billing_country: resolvedCountry },
    success_url: `${baseUrl}/billing?success=true`,
    cancel_url: `${baseUrl}/billing?canceled=true`,
  });

  if (!session.url) return { ok: false, error: "Impossible de créer la session de paiement." };
  return { ok: true, url: session.url };
}

export async function createPortalSession(): Promise<ActionResult> {
  const result = await getOwnerGarage();
  if ("error" in result) return { ok: false, error: result.error };
  const { garage } = result;

  if (!garage.stripe_customer_id) {
    return { ok: false, error: "Aucun abonnement à gérer pour l'instant." };
  }

  const stripe = getStripeClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.billingPortal.sessions.create({
    customer: garage.stripe_customer_id,
    return_url: `${baseUrl}/billing`,
  });

  return { ok: true, url: session.url };
}

/**
 * Active ou désactive l'option "rétention 12 mois" : une ligne ajoutée (ou
 * retirée) sur l'abonnement Stripe existant du garage, pas un paiement
 * séparé. Le prix dépend du pays de facturation (pricing_plans.
 * retention_365_stripe_price_id). La proration en cours de mois suit le
 * comportement par défaut de Stripe.
 */
export async function toggleRetention12Months(enable: boolean): Promise<SimpleResult> {
  const result = await getOwnerGarage();
  if ("error" in result) return { ok: false, error: result.error };
  const { supabase, garage } = result;

  if (!garage.billing_country) {
    return { ok: false, error: "Pays de facturation manquant." };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("garage_id", garage.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!subscription?.stripe_subscription_id) {
    return { ok: false, error: "Vous devez avoir un abonnement actif pour activer cette option." };
  }

  const { data: garageRow } = await supabase
    .from("garages")
    .select("retention_item_id")
    .eq("id", garage.id)
    .single();

  const stripe = getStripeClient();

  if (enable) {
    if (garageRow?.retention_item_id) return { ok: true };

    const { data: plan } = await supabase
      .from("pricing_plans")
      .select("retention_365_stripe_price_id")
      .eq("country_code", garage.billing_country)
      .maybeSingle();
    if (!plan?.retention_365_stripe_price_id) {
      return { ok: false, error: "Cette option n'est pas encore configurée pour votre pays. Contactez le support." };
    }

    const item = await stripe.subscriptionItems.create({
      subscription: subscription.stripe_subscription_id,
      price: plan.retention_365_stripe_price_id,
    });
    await supabase
      .from("garages")
      .update({ retention_days: 365, retention_item_id: item.id })
      .eq("id", garage.id);
  } else {
    if (garageRow?.retention_item_id) {
      await stripe.subscriptionItems.del(garageRow.retention_item_id);
    }
    await supabase.from("garages").update({ retention_days: 30, retention_item_id: null }).eq("id", garage.id);
  }

  revalidatePath("/settings");
  return { ok: true };
}
