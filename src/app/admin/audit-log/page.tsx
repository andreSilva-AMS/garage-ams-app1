import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Journal d'audit — Admin" };

function garageName(value: unknown): string | undefined {
  const row = Array.isArray(value) ? value[0] : value;
  return row && typeof row === "object" && "name" in row ? String(row.name) : undefined;
}

const ACTION_LABELS: Record<string, string> = {
  billing_country_change: "Changement de pays de facturation",
  admin_added: "Admin ajouté",
  admin_removed: "Admin retiré",
  receptions_viewed: "Fiches consultées",
};

export default async function AdminAuditLogPage() {
  const supabase = await createClient();

  const [{ data: logs }, { data: admins }] = await Promise.all([
    supabase
      .from("admin_audit_log")
      .select("id, admin_user_id, action, target_garage_id, details, created_at, garages(name)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("platform_admins").select("user_id, email"),
  ]);

  const adminEmailById = new Map((admins ?? []).map((a) => [a.user_id, a.email]));

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Journal d&apos;audit</h1>
      <div className="overflow-x-auto rounded-2xl border border-border-color bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-color bg-neutral-50 text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Admin</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Garage</th>
              <th className="px-3 py-2">Détails</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-b border-border-color align-top last:border-0">
                <td className="whitespace-nowrap px-3 py-2">
                  {new Date(log.created_at).toLocaleString("fr-CH")}
                </td>
                <td className="px-3 py-2">{adminEmailById.get(log.admin_user_id) ?? log.admin_user_id}</td>
                <td className="px-3 py-2">{ACTION_LABELS[log.action] ?? log.action}</td>
                <td className="px-3 py-2">{garageName(log.garages) ?? "—"}</td>
                <td className="max-w-xs px-3 py-2 font-mono text-xs text-muted">
                  {log.details ? JSON.stringify(log.details) : "—"}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  Aucune action enregistrée pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
