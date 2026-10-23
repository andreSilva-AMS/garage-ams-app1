import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { AppShell } from "@/components/AppShell";
import { GarageSettingsForm } from "./GarageSettingsForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profil + garage en une seule requête (jointure PostgREST) plutôt que deux
  // allers-retours séquentiels : la clé étrangère profiles.garage_id est sans
  // ambiguïté, donc "garages(...)" est résolu automatiquement.
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "garage_id, roles, garages(id, name, address, address_street, address_postal_code, address_city, phone, email, logo_url, default_language, retention_days, payment_status, billing_country, has_workshop, has_sales)",
    )
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/dashboard");
  // PostgREST peut renvoyer l'objet joint directement ou dans un tableau à un
  // élément selon la version du driver : on gère les deux par prudence.
  const garage = Array.isArray(profile.garages) ? profile.garages[0] : profile.garages;
  if (!garage) redirect("/dashboard");

  const isOwner = profile.roles.includes("owner");
  // Masquer les menus ne suffit pas : un employé qui tape l'URL directement
  // doit être renvoyé, pas seulement voir des champs désactivés.
  if (!isOwner) redirect("/dashboard");

  // Ne dépendent que du profil et de la garage déjà chargés, pas les unes des
  // autres : lancées en parallèle plutôt qu'en série.
  const [{ data: pendingInvites }, { data: teamProfiles }, { data: retentionPlan }] = await Promise.all([
    supabase
      .from("garage_invites")
      .select("id, email, roles, created_at")
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, roles, created_at")
      .eq("garage_id", profile.garage_id)
      .order("created_at", { ascending: true }),
    garage.billing_country
      ? supabase
          .from("pricing_plans")
          .select("retention_365_amount_ht, currency")
          .eq("country_code", garage.billing_country)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // profiles ne stocke pas l'e-mail (il vit dans auth.users, non exposé via
  // PostgREST) : on le récupère via l'API Admin, côté serveur uniquement.
  const service = createServiceClient();
  const teamMembers = await Promise.all(
    (teamProfiles ?? []).map(async (member) => {
      const { data } = await service.auth.admin.getUserById(member.id);
      return { ...member, email: data.user?.email ?? "" };
    }),
  );

  return (
    <AppShell garageName={garage.name} logoUrl={garage.logo_url} isOwner={isOwner}>
      <GarageSettingsForm
        garage={garage}
        isOwner={isOwner}
        currentUserId={user.id}
        pendingInvites={pendingInvites ?? []}
        teamMembers={teamMembers}
        retentionPrice={
          retentionPlan?.retention_365_amount_ht
            ? { amount: retentionPlan.retention_365_amount_ht, currency: retentionPlan.currency }
            : null
        }
      />
    </AppShell>
  );
}
