"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteReception } from "./actions";

export function DeleteReceptionButton({ receptionId }: { receptionId: string }) {
  const router = useRouter();
  const t = useTranslations("receptionsHistory");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    const result = await deleteReception(receptionId);
    if (!result.ok) {
      window.alert(result.error);
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-sm text-red-600 underline disabled:opacity-50"
    >
      {deleting ? t("deleting") : t("delete")}
    </button>
  );
}
