"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

type ActionResult = { ok: true; url: string } | { ok: false; error: string };

type OwnerGarage = {
  id: string;
  name: string;
  stripe_customer_id: string | null;
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
    .select("garage_id, role")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "Profil introuvable." as const };
  if (profile.role !== "owner") {
    return { error: "Seul le propriétaire du garage peut gérer la facturation." as const };
  }

  const { data: garage } = await supabase
    .from("garages")
    .select("id, name, stripe_customer_id")
    .eq("id", profile.garage_id)
    .single();
  if (!garage) return { error: "Garage introuvable." as const };

  return { supabase, garage };
}

export async function createCheckoutSession(): Promise<ActionResult> {
  const result = await getOwnerGarage();
  if ("error" in result) return { ok: false, error: result.error };
  const { supabase, garage } = result;

  const stripe = getStripeClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  let customerId = garage.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: garage.name,
      metadata: { garage_id: garage.id },
    });
    customerId = customer.id;
    await supabase.from("garages").update({ stripe_customer_id: customerId }).eq("id", garage.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
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
