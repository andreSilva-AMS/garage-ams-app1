"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateBillingCountry(garageId: string, newCountry: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_billing_country", {
    target_garage_id: garageId,
    new_country: newCountry,
    reason: reason || null,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/admin/garages/${garageId}`);
  return { ok: true as const };
}

export async function addAdmin(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_add_admin", { target_email: email });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/admins");
  return { ok: true as const };
}

export async function removeAdmin(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_remove_admin", { target_user_id: userId });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/admins");
  return { ok: true as const };
}
