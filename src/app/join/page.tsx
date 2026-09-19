import { createServiceClient } from "@/lib/supabase/service";
import { JoinForm } from "./JoinForm";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;

  if (!token || typeof token !== "string") {
    return <InvalidInvite />;
  }

  const supabase = createServiceClient();
  const { data: invite } = await supabase
    .from("garage_invites")
    .select("garage_id, email, role, accepted_at, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite || invite.accepted_at || new Date(invite.expires_at) < new Date()) {
    return <InvalidInvite />;
  }

  const { data: garage } = await supabase
    .from("garages")
    .select("name")
    .eq("id", invite.garage_id)
    .single();

  return (
    <JoinForm
      token={token}
      email={invite.email}
      role={invite.role as "mechanic" | "reception"}
      garageName={garage?.name ?? ""}
    />
  );
}

function InvalidInvite() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-xl">Invitation invalide ou expirée</h1>
      <p className="text-sm text-neutral-600">
        Ce lien n&apos;est plus valable. Demandez à votre garage de vous envoyer une nouvelle invitation.
      </p>
    </main>
  );
}
