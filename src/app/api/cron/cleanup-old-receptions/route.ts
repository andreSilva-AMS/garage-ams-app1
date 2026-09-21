import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Supprime automatiquement les fiches de réception (et leurs fichiers) plus
 * vieilles que la durée de conservation du garage (30 jours par défaut, 12
 * mois en option pour les garages avec un accès actif — voir
 * garages.retention_days). Déclenché quotidiennement par un Cron Vercel
 * (voir vercel.json) — jamais appelable publiquement, protégé par
 * CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: allReceptions, error: selectError } = await supabase.from("receptions").select(
    "id, created_at, photo_front_path, photo_back_path, photo_left_path, photo_right_path, photo_card_grey_path, signature_path, pdf_path, photo_dashboard_path, garages(retention_days)",
  );

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  const now = Date.now();
  const oldReceptions = (allReceptions ?? []).filter((r) => {
    const retentionDays = (r.garages as unknown as { retention_days: number } | null)?.retention_days ?? 30;
    return now - new Date(r.created_at).getTime() > retentionDays * DAY_MS;
  });

  if (oldReceptions.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const receptionIds = oldReceptions.map((r) => r.id);

  const { data: extraPhotos } = await supabase
    .from("reception_extra_photos")
    .select("storage_path")
    .in("reception_id", receptionIds);

  const paths = [
    ...oldReceptions.flatMap((r) => [
      r.photo_front_path,
      r.photo_back_path,
      r.photo_left_path,
      r.photo_right_path,
      r.photo_card_grey_path,
      r.photo_dashboard_path,
      r.signature_path,
      r.pdf_path,
    ]),
    ...(extraPhotos ?? []).map((p) => p.storage_path),
  ].filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    // Best-effort : on continue même en cas d'échec partiel du nettoyage des
    // fichiers plutôt que de laisser les fiches expirées s'accumuler.
    await supabase.storage.from("receptions").remove(paths);
  }

  const { error: deleteError } = await supabase.from("receptions").delete().in("id", receptionIds);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: receptionIds.length });
}
