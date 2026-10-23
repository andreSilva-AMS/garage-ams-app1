"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { inviteEmployee, cancelInvite } from "./actions";

type InviteRole = "mechanic" | "reception" | "seller";

interface PendingInvite {
  id: string;
  email: string;
  roles: string[];
  created_at: string;
}

export function InviteEmployeeSection({
  pendingInvites,
  hasWorkshop,
  hasSales,
}: {
  pendingInvites: PendingInvite[];
  hasWorkshop: boolean;
  hasSales: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("settings");
  const tDashboard = useTranslations("dashboard");

  const availableRoles: InviteRole[] = [
    ...(hasWorkshop ? (["reception", "mechanic"] as const) : []),
    ...(hasSales ? (["seller"] as const) : []),
  ];

  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<InviteRole[]>(availableRoles.slice(0, 1));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancelInvite(inviteId: string) {
    if (!window.confirm(t("cancelInviteConfirm"))) return;
    setCancellingId(inviteId);
    setError(null);
    const result = await cancelInvite(inviteId);
    setCancellingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  function toggleRole(r: InviteRole) {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSent(false);

    if (roles.length === 0) {
      setError(t("inviteRoleRequired"));
      setSending(false);
      return;
    }

    const result = await inviteEmployee(email, roles);
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
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
          <span className="text-sm font-medium">{t("inviteRole")}</span>
          <div className="flex flex-wrap gap-3">
            {availableRoles.map((r) => (
              <label key={r} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={roles.includes(r)} onChange={() => toggleRole(r)} />
                {tDashboard(`role.${r}`)}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" disabled={sending} className="btn-primary self-start">
          {sending ? t("inviteSending") : t("inviteSend")}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {sent && <p className="mt-2 text-sm text-green-700">{t("inviteSent")}</p>}

      {pendingInvites.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1 border-t border-neutral-100 pt-4">
          {pendingInvites.map((invite) => (
            <li key={invite.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate">{invite.email}</p>
                <p className="text-neutral-500">
                  {invite.roles.map((r) => tDashboard(`role.${r}`)).join(", ")} · {t("invitePending")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCancelInvite(invite.id)}
                disabled={cancellingId === invite.id}
                className="btn-secondary shrink-0 text-xs"
              >
                {cancellingId === invite.id ? t("cancelInviteSending") : t("cancelInviteButton")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
