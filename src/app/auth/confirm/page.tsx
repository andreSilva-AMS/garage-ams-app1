import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";
import { ConfirmPanel } from "./ConfirmPanel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("authConfirm");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : null;
  const type = typeof params.type === "string" ? (params.type as EmailOtpType) : null;

  // Pas de jeton du tout (lien mal formé, page ouverte directement) : rien à
  // confirmer, direction la page de résultat plutôt qu'un état intermédiaire.
  if (!tokenHash || !type) {
    redirect("/auth/email-confirme?state=invalid&type=signup");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-4">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="ReceptCar" width={36} height={36} className="rounded-xl" />
        <span className="text-lg font-medium" style={{ fontFamily: "var(--font-plex-serif)" }}>
          ReceptCar
        </span>
      </div>
      <ConfirmPanel tokenHash={tokenHash} type={type} />
    </main>
  );
}
