import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasActiveAccess } from "@/lib/billing";
import { SubscribeButton, ManageSubscriptionButton } from "./BillingActions";

function daysLeftUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
}

export default async function BillingPage() {
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
    .select("id, name, subscription_plan, payment_status, trial_ends_at, stripe_customer_id")
    .eq("id", profile.garage_id)
    .single();
  if (!garage) redirect("/dashboard");

  const isOwner = profile.role === "owner";
  const active = hasActiveAccess(garage);

  let statusLabel: string;
  let statusDetail: string | null = null;

  if (garage.payment_status === "free") {
    statusLabel = "Plan gratuit";
  } else if (garage.payment_status === "active") {
    statusLabel = "Abonnement actif";
  } else if (garage.payment_status === "past_due") {
    statusLabel = "Paiement échoué";
    statusDetail = "Merci de mettre à jour votre moyen de paiement pour continuer.";
  } else if (garage.payment_status === "canceled") {
    statusLabel = "Abonnement annulé";
  } else if (garage.trial_ends_at) {
    const trialEnd = new Date(garage.trial_ends_at);
    const daysLeft = daysLeftUntil(trialEnd);
    statusLabel = active
      ? `Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`
      : "Essai gratuit terminé";
    statusDetail = `Fin de l'essai : ${trialEnd.toLocaleDateString("fr-CH")}`;
  } else {
    statusLabel = "Essai gratuit";
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Facturation</h1>

      <div className="mb-6 rounded-lg border border-neutral-200 p-4">
        <p className="text-sm text-neutral-500">Statut de {garage.name}</p>
        <p className="text-lg font-medium">{statusLabel}</p>
        {statusDetail && <p className="mt-1 text-sm text-neutral-600">{statusDetail}</p>}
      </div>

      {!active && !isOwner && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          L&apos;essai gratuit est terminé. Demandez au propriétaire du garage de s&apos;abonner
          pour continuer à utiliser l&apos;application.
        </p>
      )}

      {isOwner && (
        <>
          {garage.payment_status === "free" ? (
            <p className="text-sm text-neutral-500">
              Ce garage bénéficie d&apos;un accès gratuit permanent.
            </p>
          ) : garage.stripe_customer_id && garage.payment_status !== "trialing" ? (
            <ManageSubscriptionButton />
          ) : (
            <SubscribeButton />
          )}
        </>
      )}

      <Link href="/dashboard" className="mt-8 inline-block text-sm underline">
        Retour au tableau de bord
      </Link>
    </main>
  );
}
