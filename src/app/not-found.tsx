import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-strong">
        <MapPinOff className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="text-lg font-medium">{t("title")}</h1>
      <p className="text-sm text-neutral-600">{t("body")}</p>
      <Link href="/" className="btn-primary mt-2">
        {t("cta")}
      </Link>
    </main>
  );
}
