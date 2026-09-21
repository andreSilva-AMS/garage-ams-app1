"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
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
    await supabase.from("receptions").update({ email_status: "failed" }).eq("id", receptionId);
    return { ok: false, error: sendError.message };
  }

  await supabase
    .from("receptions")
    .update({ email_sent_at: new Date().toISOString(), email_status: "sent" })
    .eq("id", receptionId);

  return { ok: true };
}

export async function deleteReception(
  receptionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Vous devez être connecté." };

  const { data: reception, error: receptionError } = await supabase
    .from("receptions")
    .select(
      "photo_front_path, photo_back_path, photo_left_path, photo_right_path, photo_card_grey_path, signature_path, pdf_path",
    )
    .eq("id", receptionId)
    .single();
  if (receptionError || !reception) {
    return { ok: false, error: "Fiche introuvable." };
  }

  const { data: extraPhotos } = await supabase
    .from("reception_extra_photos")
    .select("storage_path")
    .eq("reception_id", receptionId);

  const paths = [
    reception.photo_front_path,
    reception.photo_back_path,
    reception.photo_left_path,
    reception.photo_right_path,
    reception.photo_card_grey_path,
    reception.signature_path,
    reception.pdf_path,
    ...(extraPhotos ?? []).map((p) => p.storage_path),
  ].filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    // On continue même si le nettoyage des fichiers échoue partiellement :
    // mieux vaut une fiche supprimée avec quelques fichiers orphelins
    // qu'une fiche bloquée dans l'historique.
    await supabase.storage.from("receptions").remove(paths);
  }

  const { error: deleteError } = await supabase
    .from("receptions")
    .delete()
    .eq("id", receptionId);
  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  revalidatePath("/receptions");
  return { ok: true };
}

const DEEPL_TARGET_LANG: Record<Lang, string> = {
  fr: "FR",
  en: "EN-GB",
  es: "ES",
  pt: "PT-PT",
  de: "DE",
  it: "IT",
};

/**
 * Traduit le texte libre saisi par l'employé (langue de l'interface) vers la
 * langue du document choisie pour ce client, via DeepL. Best-effort : si la
 * clé n'est pas configurée ou que l'appel échoue, on renvoie le texte
 * d'origine plutôt que de bloquer la génération de la fiche.
 */
export async function translateTexts(
  texts: string[],
  sourceLang: Lang,
  targetLang: Lang,
): Promise<string[]> {
  if (sourceLang === targetLang) return texts;

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) return texts;

  // DeepL refuse toute la requête si un des textes est vide (ex. une légende
  // de photo laissée vide) : on ne lui envoie que les textes non vides, et on
  // replace les traductions à leur position d'origine ensuite.
  const nonEmptyIndices = texts.map((t, i) => i).filter((i) => texts[i].trim());
  if (nonEmptyIndices.length === 0) return texts;

  const endpoint = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: nonEmptyIndices.map((i) => texts[i]),
        source_lang: DEEPL_TARGET_LANG[sourceLang].split("-")[0],
        target_lang: DEEPL_TARGET_LANG[targetLang],
      }),
    });
    if (!response.ok) return texts;

    const data = (await response.json()) as { translations: { text: string }[] };
    const result = [...texts];
    nonEmptyIndices.forEach((originalIndex, i) => {
      result[originalIndex] = data.translations[i].text;
    });
    return result;
  } catch {
    return texts;
  }
}
