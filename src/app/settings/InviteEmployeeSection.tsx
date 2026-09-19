"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { inviteEmployee } from "./actions";

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export function InviteEmployeeSection({ pendingInvites }: { pendingInvites: PendingInvite[] }) {
  const router = useRouter();
  const t = useTranslations("settings");
  const tDashboard = useTranslations("dashboard");

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"mechanic" | "reception">("mechanic");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSent(false);

    const result = await inviteEmployee(email, role);
    if (!result.ok) {
      setError(result.error);
      setSending(false);
      return;
    }

    setEmail("");
    setSent(true);
    setSending(false);
    router.refresh();
  }

  return (
    <section className="mt-8 rounded-2xl border border-neutral-200 p-4">
      <h2 className="mb-4 text-sm font-medium text-neutral-500">{t("inviteTitle")}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="inviteEmail" className="text-sm font-medium">
            {t("inviteEmail")}
          </label>
          <input
            id="inviteEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="inviteRole" className="text-sm font-medium">
            {t("inviteRole")}
          </label>
          <select
            id="inviteRole"
            value={role}
            onChange={(e) => setRole(e.target.value as "mechanic" | "reception")}
            className="input"
          >
            <option value="mechanic">{tDashboard("role.mechanic")}</option>
            <option value="reception">{tDashboard("role.reception")}</option>
          </select>
        </div>
        <button type="submit" disabled={sending} className="btn-primary">
          {sending ? t("inviteSending") : t("inviteSend")}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {sent && <p className="mt-2 text-sm text-green-700">{t("inviteSent")}</p>}

      {pendingInvites.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1 border-t border-neutral-100 pt-4">
          {pendingInvites.map((invite) => (
            <li key={invite.id} className="flex items-center justify-between text-sm">
              <span>{invite.email}</span>
              <span className="text-neutral-500">
                {tDashboard(`role.${invite.role}`)} · {t("invitePending")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
