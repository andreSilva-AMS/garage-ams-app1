import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { GarageSearchList } from "./GarageSearchList";

export const metadata: Metadata = { title: "Garages — Admin" };

export default async function AdminGaragesPage() {
  const supabase = await createClient();

  const { data: garages } = await supabase
    .from("garages")
    .select("id, name, billing_country, subscription_plan, payment_status, vat_number, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Garages ({garages?.length ?? 0})</h1>
      <GarageSearchList garages={garages ?? []} />
    </div>
  );
}
