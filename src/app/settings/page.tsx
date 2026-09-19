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

  const { data: garage } = await supabase
    .from("garages")
    .select("id, name, address, logo_url, default_language")
    .eq("id", profile.garage_id)
    .single();
  if (!garage) redirect("/dashboard");

  const isOwner = profile.role === "owner";

  const { data: pendingInvites } = isOwner
    ? await supabase
        .from("garage_invites")
        .select("id, email, role, created_at")
        .is("accepted_at", null)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <GarageSettingsForm garage={garage} isOwner={isOwner} pendingInvites={pendingInvites ?? []} />
  );
}
