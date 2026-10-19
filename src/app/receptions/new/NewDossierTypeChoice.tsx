import Link from "next/link";
import { Car, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function NewDossierTypeChoice() {
  const t = await getTranslations("newDossierChoice");

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-10">
      <h1 className="mb-2 text-xl font-semibold">{t("title")}</h1>
      <Link
        href="/receptions/new?type=reception"
        className="card flex items-center gap-4 p-4 transition-colors hover:bg-black/5"
      >
        <Wrench className="h-8 w-8 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <p className="font-medium">{t("reception")}</p>
          <p className="text-sm text-neutral-500">{t("receptionHint")}</p>
        </div>
      </Link>
      <Link
        href="/receptions/new?type=consignment"
        className="card flex items-center gap-4 p-4 transition-colors hover:bg-black/5"
      >
        <Car className="h-8 w-8 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <p className="font-medium">{t("consignment")}</p>
          <p className="text-sm text-neutral-500">{t("consignmentHint")}</p>
        </div>
      </Link>
    </main>
  );
}
