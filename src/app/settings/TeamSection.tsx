"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { removeMember } from "./actions";
import type { Lang } from "@/lib/receptions/i18n";

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  roles: string[];
  created_at: string;
}

const DATE_LOCALE: Record<Lang, string> = {
  fr: "fr-CH",
  en: "en-GB",
  es: "es-ES",
  pt: "pt-PT",
  de: "de-CH",
  it: "it-CH",
  sq: "sq-AL",
  el: "el-GR",
  ru: "ru-RU",
};

export function TeamSection({
  garageName,
  teamMembers,
  currentUserId,
}: {
  garageName: string;
  teamMembers: TeamMember[];
  currentUserId: string;
}) {
  const router = useRouter();
  const t = useTranslations("settings");
  const tDashboard = useTranslations("dashboard");
  const locale = useLocale() as Lang;
  const dateLocale = DATE_LOCALE[locale] ?? "fr-CH";

  const [target, setTarget] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleConfirmRemove() {
    if (!target) return;
    setRemoving(true);
    setError(null);
    const result = await removeMember(target.id);
    setRemoving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccessMessage(t("teamRemoveSuccess", { name: target.full_name ?? target.email }));
    setTarget(null);
    router.refresh();
  }

  return (
    <section className="card mt-8 p-4">
      <h2 className="mb-2 text-sm font-medium text-muted">{tDashboard("team", { count: teamMembers.length })}</h2>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {successMessage && <p className="mb-2 text-sm text-green-700">{successMessage}</p>}

      <ul className="flex flex-col gap-3">
        {teamMembers.map((member) => {
          const otherRoles = member.roles.filter((r) => r !== "owner");
          const isSelf = member.id === currentUserId;
          return (
            <li key={member.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{member.full_name ?? "—"}</p>
                <p className="truncate text-xs text-muted">{member.email}</p>
                <p className="text-xs text-muted">
                  {otherRoles.length > 0 && `${otherRoles.map((r) => tDashboard(`role.${r}`)).join(", ")} · `}
                  {t("teamJoinedOn", { date: new Date(member.created_at).toLocaleDateString(dateLocale) })}
                </p>
              </div>
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => setTarget(member)}
                  className="btn-secondary shrink-0 text-xs"
                >
                  {t("teamRemoveButton")}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card max-w-sm p-5">
            <p className="mb-5 text-sm">
              {t("teamRemoveConfirm", { name: target.full_name ?? target.email, garageName })}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setTarget(null)} className="btn-secondary">
                {t("teamRemoveCancel")}
              </button>
              <button type="button" onClick={handleConfirmRemove} disabled={removing} className="btn-danger">
                {removing ? t("teamRemoving") : t("teamRemoveConfirmButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
