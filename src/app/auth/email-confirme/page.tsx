import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";
import { ResultPanel, type ConfirmState } from "./ResultPanel";

const VALID_STATES: ConfirmState[] = ["success", "expired", "invalid", "error"];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("emailConfirme");
  return {
    title: t("success.title"),
    // Page atteignable uniquement via le lien reçu par e-mail ou juste après
    // la confirmation : jamais indexée, jamais liée ailleurs sur le site.
    robots: { index: false, follow: false },
  };
}

export default async function EmailConfirmePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawState = typeof params.state === "string" ? params.state : "error";
  const state: ConfirmState = VALID_STATES.includes(rawState as ConfirmState)
    ? (rawState as ConfirmState)
    : "error";
  const type: EmailOtpType = params.type === "recovery" ? "recovery" : "signup";

  const t = await getTranslations("emailConfirme");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="mb-8 flex items-center gap-2.5">
        <Image src="/logo.png" alt="ReceptCar" width={36} height={36} className="rounded-xl" />
        <span className="text-lg font-medium" style={{ fontFamily: "var(--font-plex-serif)" }}>
          ReceptCar
        </span>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white px-6 py-10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.08)] sm:px-10">
        <ResultPanel state={state} type={type} />
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-neutral-400">
        <Link href="/terms" className="hover:text-neutral-600">
          {t("footerTerms")}
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/privacy" className="hover:text-neutral-600">
          {t("footerPrivacy")}
        </Link>
        <span aria-hidden="true">·</span>
        <a href="mailto:info@receptcar.com" className="hover:text-neutral-600">
          info@receptcar.com
        </a>
      </footer>
    </main>
  );
}
