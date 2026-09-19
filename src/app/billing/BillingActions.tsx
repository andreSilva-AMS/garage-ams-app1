"use client";

import { useState } from "react";
import { createCheckoutSession, createPortalSession } from "./actions";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await createCheckoutSession();
    if (result.ok) {
      window.location.href = result.url;
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={handleClick} disabled={loading} className="btn-primary">
        {loading ? "Redirection…" : "S'abonner maintenant"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
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
