import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasActiveAccess } from "@/lib/billing";
import { formatPriceHt, FALLBACK_PRICING_CODE, type PricingPlan } from "@/lib/pricing";
import type { Lang } from "@/lib/receptions/i18n";
import { AppShell } from "@/components/AppShell";
import { SubscribeFlow, ManageSubscriptionButton } from "./BillingActions";

const DATE_LOCALE: Record<Lang, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
  pt: "pt-PT",
  de: "de-CH",
  it: "it-CH",
  sq: "sq-AL",
  el: "el-GR",
  ru: "ru-RU",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("billing") };
}

function daysLeftUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
}

export default async function BillingPage() {
  const t = await getTranslations("billing");
  const locale = ((await getLocale()) as Lang) ?? "fr";
  const dateLocale = DATE_LOCALE[locale] ?? "fr-CH";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, roles")
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

  const isOwner = profile.roles.includes("owner");
  const active = hasActiveAccess(garage);

  let statusLabel: string;
  let statusDetail: string | null = null;

  if (garage.payment_status === "free") {
    statusLabel = t("statusFree");
  } else if (garage.payment_status === "active") {
    statusLabel = t("statusActive");
    if (subscription?.cancel_at_period_end && subscription.current_period_end) {
      const endDate = new Date(subscription.current_period_end);
      statusDetail = t("cancelScheduled", { date: endDate.toLocaleDateString(dateLocale) });
    }
  } else if (garage.payment_status === "past_due") {
    statusLabel = t("statusPastDue");
    statusDetail = t("pastDueDetail");
  } else if (garage.payment_status === "canceled") {
    statusLabel = t("statusCanceled");
  } else if (garage.trial_ends_at) {
    const trialEnd = new Date(garage.trial_ends_at);
    const daysLeft = daysLeftUntil(trialEnd);
    statusLabel = active ? t("trialActive", { days: daysLeft }) : t("trialExpired");
    statusDetail = t("trialEndDate", { date: trialEnd.toLocaleDateString(dateLocale) });
  } else {
    statusLabel = t("statusTrial");
  }

  return (
    <AppShell garageName={garage.name} logoUrl={garage.logo_url}>
      <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        <h1 className="mb-6 text-xl font-semibold">{t("title")}</h1>

        <div className="mb-6 rounded-2xl border border-neutral-200 p-4">
          <p className="text-sm text-neutral-500">{t("statusOf", { name: garage.name })}</p>
          <p className="text-lg font-medium">{statusLabel}</p>
          {statusDetail && <p className="mt-1 text-sm text-neutral-600">{statusDetail}</p>}
          {plan && garage.payment_status !== "free" && (
            <p className="mt-1 text-sm text-neutral-600">
              {plan.country_label} — {formatPriceHt(plan)}
            </p>
          )}
          {garage.checkout_country_mismatch && (
            <p className="mt-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-800">
              {t("countryMismatch", { country: garage.checkout_billing_address_country ?? "" })}
            </p>
          )}
        </div>

        {!active && !isOwner && (
          <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{t("nonOwnerBlocked")}</p>
        )}

        {isOwner && (
          <>
            {garage.payment_status === "free" ? (
              <p className="text-sm text-neutral-500">{t("freeAccessPermanent")}</p>
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
