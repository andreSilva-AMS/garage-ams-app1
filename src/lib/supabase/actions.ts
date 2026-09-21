"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Partagée par toutes les pages authentifiées (tableau de bord, menu de navigation, réglages...). */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
