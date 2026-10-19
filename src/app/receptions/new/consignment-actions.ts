"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { I18N, Lang } from "@/lib/consignments/i18n";

export async function sendConsignmentEmail(
  consignmentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Vous devez être connecté." };

  const { data: consignment, error: consignmentError } = await supabase
    .from("consignments")
    .select("id, garage_id, owner_name, owner_email, vehicle_plate, vehicle_brand_model, language, pdf_path")
    .eq("id", consignmentId)
    .single();
  if (consignmentError || !consignment) {
    return { ok: false, error: "Dossier introuvable." };
  }
  if (!consignment.owner_email) {
    return { ok: false, error: "Aucun e-mail propriétaire renseigné sur ce dossier." };
  }
  if (!consignment.pdf_path) {
    return { ok: false, error: "Le PDF de ce dossier n'a pas encore été généré." };
  }

  const { data: garage } = await supabase
    .from("garages")
    .select("name, address")
    .eq("id", consignment.garage_id)
    .single();

  const { data: pdfFile, error: downloadError } = await supabase.storage
    .from("receptions")
    .download(consignment.pdf_path);
  if (downloadError || !pdfFile) {
    return { ok: false, error: "Impossible de récupérer le PDF." };
  }
  const pdfBase64 = Buffer.from(await pdfFile.arrayBuffer()).toString("base64");

  const lang = (consignment.language as Lang) ?? "fr";
  const t = I18N[lang] ?? I18N.fr;
  const garageName = garage?.name ?? "Garage";

  const resend = new Resend(process.env.RESEND_API_KEY);
  const filename = `Contrat-depot-vente_${consignment.vehicle_plate.replace(/\s+/g, "")}.pdf`;

  const fromAddress = (process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev").match(
    /<([^>]+)>/,
  )?.[1] ?? process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const { error: sendError } = await resend.emails.send({
    from: `${garageName} <${fromAddress}>`,
    to: [consignment.owner_email],
    replyTo: user.email ?? undefined,
    bcc: user.email ? [user.email] : undefined,
    subject: t.emailSubject(consignment.vehicle_plate, garageName),
    text: t.emailBody(consignment.owner_name, consignment.vehicle_brand_model ?? "", consignment.vehicle_plate, garageName),
    attachments: [{ filename, content: pdfBase64 }],
  });

  if (sendError) {
    await supabase.from("consignments").update({ email_status: "failed" }).eq("id", consignmentId);
    return { ok: false, error: sendError.message };
  }

  await supabase
    .from("consignments")
    .update({ email_sent_at: new Date().toISOString(), email_status: "sent" })
    .eq("id", consignmentId);

  return { ok: true };
}
