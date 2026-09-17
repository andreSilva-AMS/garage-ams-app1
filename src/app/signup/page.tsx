"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [garageName, setGarageName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { garage_name: garageName, full_name: fullName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // La confirmation par e-mail est activée : le garage sera créé
      // automatiquement à la première connexion (voir ensureProfile()).
      setPendingConfirmation(true);
      setLoading(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc("create_garage_and_owner", {
      garage_name: garageName,
      owner_full_name: fullName,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (pendingConfirmation) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
        <h1 className="text-xl font-semibold">Vérifiez votre boîte e-mail</h1>
        <p className="text-sm text-neutral-600">
          Un lien de confirmation a été envoyé à <strong>{email}</strong>.
          Cliquez dessus, puis revenez vous connecter : votre garage «{" "}
          {garageName} » sera créé automatiquement.
        </p>
        <Link href="/login" className="text-sm underline">
          Aller à la page de connexion
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="mb-1 text-xl font-semibold">Créer votre garage</h1>
      <p className="mb-6 text-sm text-neutral-600">
        Ce compte sera le compte propriétaire de votre garage.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nom du garage" htmlFor="garageName">
          <input
            id="garageName"
            required
            value={garageName}
            onChange={(e) => setGarageName(e.target.value)}
            className="input"
            placeholder="Garage AMS Automobiles Sàrl"
          />
        </Field>

        <Field label="Votre nom complet" htmlFor="fullName">
          <input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            placeholder="André Da Silva"
          />
        </Field>

        <Field label="E-mail" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Mot de passe" htmlFor="password">
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Création en cours..." : "Créer mon garage"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-600">
        Déjà un compte ?{" "}
        <Link href="/login" className="underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
