import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { signOut } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  mechanic: "Mécanicien",
  reception: "Réception",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureProfile(supabase, user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("garage_id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Le profil n'a pas pu être créé (ex : inscription incomplète).
    redirect("/signup");
  }

  const { data: garage } = await supabase
    .from("garages")
    .select("id, name, address, default_language, subscription_plan")
    .eq("id", profile.garage_id)
    .single();

  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("garage_id", profile.garage_id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">Connecté à</p>
          <h1 className="text-2xl font-semibold">{garage?.name}</h1>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm underline">
            Se déconnecter
          </button>
        </form>
      </div>

      <section className="mb-8 rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-2 text-sm font-medium text-neutral-500">
          Votre compte
        </h2>
        <p>{profile.full_name ?? user.email}</p>
        <p className="text-sm text-neutral-600">
          Rôle : {ROLE_LABELS[profile.role] ?? profile.role}
        </p>
      </section>

      <section className="rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-2 text-sm font-medium text-neutral-500">
          Équipe du garage ({teamMembers?.length ?? 0})
        </h2>
        <ul className="flex flex-col gap-1">
          {teamMembers?.map((member) => (
            <li key={member.id} className="text-sm">
              {member.full_name ?? "Sans nom"} —{" "}
              {ROLE_LABELS[member.role] ?? member.role}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-xs text-neutral-400">
        garage_id : {garage?.id} — ces données ne sont visibles que par les
        membres de ce garage (isolation appliquée au niveau de la base de
        données).
      </p>
    </main>
  );
}
