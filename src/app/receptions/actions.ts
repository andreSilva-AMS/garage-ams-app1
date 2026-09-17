"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { I18N, Lang } from "@/lib/receptions/i18n";

export async function sendReceptionEmail(
  receptionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Vous devez être connecté." };

  const { data: reception, error: receptionError } = await supabase
    .from("receptions")
    .select("id, garage_id, client_name, client_email, vehicle_plate, vehicle_brand_model, language, pdf_path")
    .eq("id", receptionId)
    .single();
  if (receptionError || !reception) {
    return { ok: false, error: "Fiche introuvable." };
  }
  if (!reception.client_email) {
    return { ok: false, error: "Aucun e-mail client renseigné sur cette fiche." };
  }
  if (!reception.pdf_path) {
    return { ok: false, error: "Le PDF de cette fiche n'a pas encore été généré." };
  }

  const { data: garage } = await supabase
    .from("garages")
    .select("name, address")
    .eq("id", reception.garage_id)
    .single();

  const { data: pdfFile, error: downloadError } = await supabase.storage
    .from("receptions")
    .download(reception.pdf_path);
  if (downloadError || !pdfFile) {
    return { ok: false, error: "Impossible de récupérer le PDF." };
  }
  const pdfBase64 = Buffer.from(await pdfFile.arrayBuffer()).toString("base64");

  const lang = (reception.language as Lang) ?? "fr";
  const t = I18N[lang] ?? I18N.fr;
  const garageName = garage?.name ?? "Garage";
  const garageAddress = garage?.address ?? "";

  const resend = new Resend(process.env.RESEND_API_KEY);
  const filename = `Fiche-reception_${reception.vehicle_plate.replace(/\s+/g, "")}.pdf`;

  // L'adresse technique d'envoi est toujours la même (celle du domaine vérifié
  // sur Resend), mais le NOM affiché change pour chaque garage, et les
  // réponses du client partent directement vers l'employé qui a envoyé la
  // fiche — pas vers une boîte commune.
  const fromAddress = (process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev").match(
    /<([^>]+)>/,
  )?.[1] ?? process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const { error: sendError } = await resend.emails.send({
    from: `${garageName} <${fromAddress}>`,
    to: [reception.client_email],
    replyTo: user.email ?? undefined,
    bcc: user.email ? [user.email] : undefined,
    subject: t.emailSubject(reception.vehicle_plate, garageName),
    text: t.emailBody(
      reception.client_name,
      reception.vehicle_brand_model ?? "",
      reception.vehicle_plate,
      garageName,
      garageAddress,
    ),
    attachments: [{ filename, content: pdfBase64 }],
  });

  if (sendError) {
    return { ok: false, error: sendError.message };
  }

  await supabase
    .from("receptions")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", receptionId);

  return { ok: true };
}
