import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const RETENTION_DAYS = 30;

/**
 * Supprime automatiquement les fiches de réception (et leurs fichiers) plus
 * vieilles que 30 jours, tous garages confondus. Déclenché quotidiennement
 * par un Cron Vercel (voir vercel.json) — jamais appelable publiquement,
 * protégé par CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: oldReceptions, error: selectError } = await supabase
    .from("receptions")
    .select(
      "id, photo_front_path, photo_back_path, photo_left_path, photo_right_path, photo_card_grey_path, signature_path, pdf_path",
    )
    .lt("created_at", cutoff);

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }
  if (!oldReceptions || oldReceptions.length === 0) {
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
