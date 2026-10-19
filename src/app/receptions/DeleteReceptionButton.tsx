"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteReception } from "./actions";
import { deleteConsignment } from "./new/consignment-actions";

export function DeleteReceptionButton({
  receptionId,
  type = "reception",
}: {
  receptionId: string;
  type?: "reception" | "consignment";
}) {
  const router = useRouter();
  const t = useTranslations("receptionsHistory");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    const result = type === "consignment" ? await deleteConsignment(receptionId) : await deleteReception(receptionId);
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
