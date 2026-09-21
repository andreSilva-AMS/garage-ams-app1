import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminsList } from "./AdminsList";

export const metadata: Metadata = { title: "Administrateurs — Admin" };

export default async function AdminAdminsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: admins } = await supabase
    .from("platform_admins")
    .select("id, user_id, email, added_at")
    .order("added_at", { ascending: true });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Administrateurs</h1>
      <AdminsList admins={admins ?? []} currentUserId={user?.id ?? ""} />
    </div>
  );
}
