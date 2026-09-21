import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

function mapStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "canceled";
  }
}

/**
 * Compare le pays saisi dans l'adresse de facturation Stripe Checkout au
 * pays de facturation enregistré pour le garage. Signale un écart sans
 * jamais bloquer le paiement (demande explicite : "sans bloquer").
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!customerId) return;

  const { data: garage } = await supabase
    .from("garages")
    .select("id, billing_country")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (!garage) return;

  const billingAddressCountry = session.customer_details?.address?.country ?? null;
  const vatNumber = session.customer_details?.tax_ids?.[0]?.value ?? null;
  const mismatch = Boolean(
    garage.billing_country && billingAddressCountry && billingAddressCountry !== garage.billing_country,
  );

  // Le préfixe pays d'un numéro de TVA UE correspond normalement au pays de
  // facturation, à l'exception de la Grèce (code pays GR, préfixe TVA "EL").
  const vatCountryPrefix = vatNumber ? vatNumber.trim().slice(0, 2).toUpperCase() : null;
  const vatMismatch = Boolean(
    garage.billing_country &&
      vatCountryPrefix &&
      vatCountryPrefix !== garage.billing_country &&
      !(garage.billing_country === "GR" && vatCountryPrefix === "EL"),
  );

  await supabase
    .from("garages")
    .update({
      checkout_billing_address_country: billingAddressCountry,
      checkout_country_mismatch: mismatch,
      ...(vatNumber ? { vat_number: vatNumber, vat_country_mismatch: vatMismatch } : {}),
    })
    .eq("id", garage.id);
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const supabase = createServiceClient();
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const { data: garage } = await supabase
    .from("garages")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (!garage) return;

  const item = subscription.items.data[0];
  const status = mapStatus(subscription.status);

  await supabase.from("subscriptions").upsert(
    {
      garage_id: garage.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: item?.price.id ?? null,
      status: subscription.status,
      current_period_end: item ? new Date(item.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  await supabase
    .from("garages")
    .update({ payment_status: status, subscription_plan: "paid" })
    .eq("id", garage.id);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature invalide";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
