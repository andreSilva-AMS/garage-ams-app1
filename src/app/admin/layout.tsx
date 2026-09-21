import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // La policy RLS de platform_admins n'autorise sa propre lecture qu'aux
  // admins : une ligne vide ici signifie donc "pas admin", sans avoir besoin
  // d'appeler is_platform_admin() séparément.
  const { data: admin } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) redirect("/dashboard");

  return (
    <div className="min-h-full bg-neutral-50">
      <header className="border-b border-border-color bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-semibold">ReceptCar — Admin</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="hover:underline">
              Garages
            </Link>
            <Link href="/admin/audit-log" className="hover:underline">
              Journal
            </Link>
            <Link href="/dashboard" className="text-muted hover:underline">
              Quitter
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
