import { createClient } from "@/lib/supabase/server";
import { PricingPlan } from "@/lib/pricing";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const supabase = await createClient();

  const { data: pricingPlans } = await supabase
    .from("pricing_plans")
    .select("country_code, country_label, currency, amount_ht, stripe_price_id")
    .eq("active", true)
    .order("country_code");

  return <SignupForm pricingPlans={(pricingPlans ?? []) as PricingPlan[]} />;
}
