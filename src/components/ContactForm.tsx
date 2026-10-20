"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { sendContactMessage } from "@/app/contactActions";

export function ContactForm({
  nameLabel,
  emailLabel,
  messageLabel,
  sendLabel,
  successLabel,
  missingFieldsError,
  genericError,
}: {
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  sendLabel: string;
  successLabel: string;
  missingFieldsError: string;
  genericError: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(missingFieldsError);
      return;
    }
    setError(null);
    setStatus("loading");
    try {
      const result = await sendContactMessage(name, email, message);
      if (result.ok) {
        setStatus("sent");
      } else {
        setStatus("idle");
        setError(genericError);
      }
    } catch {
      setStatus("idle");
      setError(genericError);
    }
  }

  if (status === "sent") {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
        <Check className="h-4 w-4" aria-hidden="true" />
        {successLabel}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={nameLabel}
        className="input"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={emailLabel}
        className="input"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={messageLabel}
        rows={4}
        className="input"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={status === "loading"} className="btn-primary">
        <Send className="h-4 w-4" aria-hidden="true" />
        {sendLabel}
      </button>
    </form>
  );
}
