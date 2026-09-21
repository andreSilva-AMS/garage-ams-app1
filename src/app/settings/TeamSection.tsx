import { useTranslations } from "next-intl";

interface TeamMember {
  id: string;
  full_name: string | null;
  role: string;
}

export function TeamSection({ teamMembers }: { teamMembers: TeamMember[] }) {
  const t = useTranslations("dashboard");

  const ROLE_LABELS: Record<string, string> = {
    owner: t("role.owner"),
    mechanic: t("role.mechanic"),
    reception: t("role.reception"),
  };

  return (
    <section className="card mt-8 p-4">
      <h2 className="mb-2 text-sm font-medium text-muted">{t("team", { count: teamMembers.length })}</h2>
      <ul className="flex flex-col gap-1">
        {teamMembers.map((member) => (
          <li key={member.id} className="text-sm">
            {member.full_name ?? "—"}
            {member.role !== "owner" && ` — ${ROLE_LABELS[member.role] ?? member.role}`}
          </li>
        ))}
      </ul>
    </section>
  );
}
