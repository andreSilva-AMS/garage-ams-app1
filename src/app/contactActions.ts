"use server";

import { Resend } from "resend";

const CONTACT_EMAIL = "info@receptcar.com";

export async function sendContactMessage(
  name: string,
  email: string,
  message: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!name.trim() || !email.trim() || !message.trim()) {
    return { ok: false, error: "missing_fields" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromAddress =
    (process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev").match(/<([^>]+)>/)?.[1] ??
    process.env.RESEND_FROM_EMAIL ??
    "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from: `ReceptCar <${fromAddress}>`,
    to: [CONTACT_EMAIL],
    replyTo: email,
    subject: `Nouveau message de contact — ${name}`,
    text: `De : ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
