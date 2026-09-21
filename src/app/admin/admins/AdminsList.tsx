"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addAdmin, removeAdmin } from "@/app/admin/actions";

interface Admin {
  id: string;
  user_id: string;
  email: string;
  added_at: string;
}

export function AdminsList({ admins, currentUserId }: { admins: Admin[]; currentUserId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await addAdmin(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEmail("");
    router.refresh();
  }

  async function handleRemove(userId: string) {
    if (!confirm("Retirer cet admin de la plateforme ?")) return;
    setBusy(true);
    setError(null);
    const result = await removeAdmin(userId);
    setBusy(false);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          type="email"
          required
          placeholder="E-mail du nouvel admin (compte déjà créé)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input max-w-sm"
        />
        <button type="submit" disabled={busy} className="btn-primary">
          Ajouter
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-border-color bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-color bg-neutral-50 text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">E-mail</th>
              <th className="px-3 py-2">Ajouté le</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-border-color last:border-0">
                <td className="px-3 py-2">{a.email}</td>
                <td className="px-3 py-2">{new Date(a.added_at).toLocaleDateString("fr-CH")}</td>
                <td className="px-3 py-2 text-right">
                  {a.user_id !== currentUserId && (
                    <button
                      type="button"
                      onClick={() => handleRemove(a.user_id)}
                      disabled={busy}
                      className="text-xs text-red-600 underline"
                    >
                      Retirer
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-muted">
                  Aucun admin pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
