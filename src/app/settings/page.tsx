import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GarageSettingsForm } from "./GarageSettingsForm";

export default async function SettingsPage() {
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

  const isOwner = profile.role === "owner";

  // Les deux requêtes ne dépendent que du profil déjà chargé, pas l'une de
  // l'autre : lancées en parallèle plutôt qu'en série.
  const [{ data: garage }, { data: pendingInvites }] = await Promise.all([
    supabase
      .from("garages")
      .select("id, name, address, phone, email, logo_url, default_language")
      .eq("id", profile.garage_id)
      .single(),
    isOwner
      ? supabase
          .from("garage_invites")
          .select("id, email, role, created_at")
          .is("accepted_at", null)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);
  if (!garage) redirect("/dashboard");

  return (
    <GarageSettingsForm garage={garage} isOwner={isOwner} pendingInvites={pendingInvites ?? []} />
  );
}
