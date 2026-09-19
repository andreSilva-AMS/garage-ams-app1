"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPriceHt, guessCountryFromLocale, type PricingPlan } from "@/lib/pricing";
import { createCheckoutSession, createPortalSession } from "./actions";

export function SubscribeFlow({ pricingPlans }: { pricingPlans: PricingPlan[] }) {
  const supabase = createClient();
  // Départ neutre côté serveur (navigator n'existe pas en SSR) : la vraie
  // détection se fait après montage, dans l'effet ci-dessous.
  const [country, setCountry] = useState<string | null>(null);
  const [editingCountry, setEditingCountry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  useEffect(() => {
    // Lit `navigator`, indisponible en SSR : ne peut pas être calculé pendant
    // le rendu sans provoquer un décalage d'hydratation, d'où l'effet.
    const guess = guessCountryFromLocale(pricingPlans);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountry(guess);
    setEditingCountry(!guess);
    // On ne relance la détection qu'une fois, au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPlan = pricingPlans.find((p) => p.country_code === country);

  async function handleSubscribe() {
    if (!country) return;
    setLoading(true);
    setError(null);
    const result = await createCheckoutSession(country);
    if (result.ok) {
      window.location.href = result.url;
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleWaitlist() {
    if (!waitlistEmail.trim()) return;
    setWaitlistLoading(true);
    const { error: waitlistError } = await supabase.from("waitlist").insert({
      email: waitlistEmail,
    });
    setWaitlistLoading(false);
    if (!waitlistError) setWaitlisted(true);
  }

  return (
    <div className="flex flex-col gap-3">
      {!editingCountry && selectedPlan ? (
        <p className="text-sm text-neutral-600">
          Pays de facturation : <span className="font-medium">{selectedPlan.country_label}</span> —{" "}
          {formatPriceHt(selectedPlan)}{" "}
          <button
            type="button"
            onClick={() => setEditingCountry(true)}
            className="underline"
          >
            Modifier
          </button>
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <label htmlFor="billingCountry" className="text-sm font-medium">
            Pays de facturation
          </label>
          <select
            id="billingCountry"
            className="input"
            value={country ?? ""}
            onChange={(e) => {
              setCountry(e.target.value || null);
              setEditingCountry(false);
            }}
          >
            <option value="" disabled>
              Choisir un pays…
            </option>
            {pricingPlans.map((p) => (
              <option key={p.country_code} value={p.country_code}>
                {p.country_label} — {formatPriceHt(p)}
              </option>
            ))}
          </select>
        </div>
      )}

      {country ? (
        <>
          <button type="button" onClick={handleSubscribe} disabled={loading} className="btn-primary">
            {loading ? "Redirection…" : "S'abonner maintenant"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </>
      ) : waitlisted ? (
        <p className="text-sm text-neutral-600">
          Merci ! Nous vous préviendrons dès que ReceptCar sera disponible dans votre pays.
        </p>
      ) : (
        <div className="rounded-2xl border border-neutral-200 p-3">
          <p className="mb-2 text-sm text-neutral-600">
            Aucun tarif n&apos;est encore disponible pour votre pays. Laissez votre e-mail, nous
            vous préviendrons.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              className="input"
              placeholder="votre@email.ch"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
            />
            <button
              type="button"
              onClick={handleWaitlist}
              disabled={waitlistLoading}
              className="btn-secondary"
            >
              {waitlistLoading ? "Envoi…" : "Liste d'attente"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await createPortalSession();
    if (result.ok) {
      window.location.href = result.url;
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-secondary"
      >
        {loading ? "Redirection…" : "Gérer mon abonnement"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
