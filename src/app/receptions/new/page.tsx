import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveAccess } from "@/lib/billing";
import { ReceptionWizard } from "./ReceptionWizard";

export default async function NewReceptionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/dashboard");

  const { data: garage } = await supabase
    .from("garages")
    .select("id, name, address, logo_url, subscription_plan, payment_status, trial_ends_at")
    .eq("id", profile.garage_id)
    .single();
  if (!garage) redirect("/dashboard");
  if (!hasActiveAccess(garage)) redirect("/billing");

  return <ReceptionWizard garage={garage} />;
}
