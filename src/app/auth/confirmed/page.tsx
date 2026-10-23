import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("authConfirm");
  return {
    title: t("confirmedTitle"),
    // Page atteignable uniquement via le lien reçu par e-mail : jamais
    // indexée, jamais liée ailleurs sur le site.
    robots: { index: false, follow: false },
  };
}

export default async function AuthConfirmedPage() {
  const t = await getTranslations("authConfirm");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-4">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="ReceptCar" width={36} height={36} className="rounded-xl" />
        <span className="text-lg font-medium" style={{ fontFamily: "var(--font-plex-serif)" }}>
          ReceptCar
        </span>
      </div>

      <div className="flex w-full flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
        <h1 className="text-xl">{t("confirmedTitle")}</h1>
        <p className="text-sm text-neutral-600">{t("confirmedBody")}</p>
        <Link href="/dashboard" className="btn-primary">
          {t("continueButton")}
        </Link>
      </div>
    </main>
  );
}
