import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasActiveAccess } from "@/lib/billing";
import { formatPriceHt, FALLBACK_PRICING_CODE, type PricingPlan } from "@/lib/pricing";
import { AppShell } from "@/components/AppShell";
import { SubscribeFlow, ManageSubscriptionButton } from "./BillingActions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("billing") };
}

function daysLeftUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
}

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, role")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/dashboard");

  const { data: garage } = await supabase
    .from("garages")
    .select(
      "id, name, logo_url, subscription_plan, payment_status, trial_ends_at, stripe_customer_id, billing_country, checkout_billing_address_country, checkout_country_mismatch",
    )
    .eq("id", profile.garage_id)
    .single();
  if (!garage) redirect("/dashboard");

  const { data: dedicatedPlan } = garage.billing_country
    ? await supabase
        .from("pricing_plans")
        .select("country_label, currency, amount_ht")
        .eq("country_code", garage.billing_country)
        .maybeSingle()
    : { data: null };

  const { data: fallbackPlan } = garage.billing_country && !dedicatedPlan
    ? await supabase
        .from("pricing_plans")
        .select("country_label, currency, amount_ht")
        .eq("country_code", FALLBACK_PRICING_CODE)
        .maybeSingle()
    : { data: null };

  const plan = dedicatedPlan ?? fallbackPlan;

  const { data: pricingPlans } = await supabase
    .from("pricing_plans")
    .select("country_code, country_label, currency, amount_ht, stripe_price_id")
    .eq("active", true)
    .eq("is_fallback", false)
    .order("country_code");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("cancel_at_period_end, current_period_end")
    .eq("garage_id", garage.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isOwner = profile.role === "owner";
  const active = hasActiveAccess(garage);

  let statusLabel: string;
  let statusDetail: string | null = null;

  if (garage.payment_status === "free") {
    statusLabel = "Plan gratuit";
  } else if (garage.payment_status === "active") {
    statusLabel = "Abonnement actif";
    if (subscription?.cancel_at_period_end && subscription.current_period_end) {
      const endDate = new Date(subscription.current_period_end);
      statusDetail = `Résiliation programmée : votre abonnement restera actif jusqu'au ${endDate.toLocaleDateString("fr-CH")}, puis ne sera pas renouvelé.`;
    }
  } else if (garage.payment_status === "past_due") {
    statusLabel = "Paiement échoué";
    statusDetail = "Merci de mettre à jour votre moyen de paiement pour continuer.";
  } else if (garage.payment_status === "canceled") {
    statusLabel = "Abonnement annulé";
  } else if (garage.trial_ends_at) {
    const trialEnd = new Date(garage.trial_ends_at);
    const daysLeft = daysLeftUntil(trialEnd);
    statusLabel = active
      ? `Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`
      : "Essai gratuit terminé";
    statusDetail = `Fin de l'essai : ${trialEnd.toLocaleDateString("fr-CH")}`;
  } else {
    statusLabel = "Essai gratuit";
  }

  return (
    <AppShell garageName={garage.name} logoUrl={garage.logo_url}>
      <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        <h1 className="mb-6 text-xl font-semibold">Facturation</h1>

        <div className="mb-6 rounded-2xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">Statut de {garage.name}</p>
          <p className="text-lg font-medium">{statusLabel}</p>
          {statusDetail && <p className="mt-1 text-sm text-neutral-600">{statusDetail}</p>}
          {plan && garage.payment_status !== "free" && (
            <p className="mt-1 text-sm text-neutral-600">
              {plan.country_label} — {formatPriceHt(plan)}
            </p>
          )}
          {garage.checkout_country_mismatch && (
            <p className="mt-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-800">
              Le pays indiqué sur la dernière facturation ({garage.checkout_billing_address_country})
              diffère du pays de facturation enregistré pour ce garage.
            </p>
          )}
        </div>

        {!active && !isOwner && (
          <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
            L&apos;essai gratuit est terminé. Demandez au propriétaire du garage de s&apos;abonner
            pour continuer à utiliser l&apos;application.
          </p>
        )}

        {isOwner && (
          <>
            {garage.payment_status === "free" ? (
              <p className="text-sm text-neutral-500">
                Ce garage bénéficie d&apos;un accès gratuit permanent.
              </p>
            ) : garage.stripe_customer_id && garage.payment_status !== "trialing" ? (
              <ManageSubscriptionButton />
            ) : (
              <SubscribeFlow
                pricingPlans={(pricingPlans ?? []) as PricingPlan[]}
                fixedCountry={garage.billing_country}
                fixedPlan={plan}
              />
            )}
          </>
        )}
      </main>
    </AppShell>
  );
}
