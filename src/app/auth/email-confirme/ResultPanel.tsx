"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { EmailOtpType } from "@supabase/supabase-js";
import { ResendEmailForm } from "@/components/auth/ResendEmailForm";

export type ConfirmState = "success" | "expired" | "invalid" | "error";

const REDIRECT_SECONDS = 5;

export function ResultPanel({ state, type }: { state: ConfirmState; type: EmailOtpType }) {
  if (state === "success") return <SuccessPanel />;
  if (state === "expired") return <ExpiredPanel type={type} />;
  if (state === "invalid") return <InvalidPanel type={type} />;
  return <ErrorPanel />;
}

function SuccessPanel() {
  const t = useTranslations("emailConfirme.success");
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;
    if (secondsLeft <= 0) {
      router.push("/dashboard");
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, cancelled, router]);

  return (
    <div
      className="flex flex-col items-center gap-5 text-center"
      onClick={() => setCancelled(true)}
      onKeyDown={() => setCancelled(true)}
    >
      <SuccessIcon />
      <h1 className="font-serif text-2xl text-neutral-900">{t("title")}</h1>
      <p className="text-sm text-neutral-600">{t("body")}</p>

      <Link href="/dashboard" className="btn-primary w-full justify-center">
        {t("cta")}
      </Link>

      {!cancelled && (
        <p className="text-xs text-neutral-400">{t("redirecting", { s: secondsLeft })}</p>
      )}

      <div className="mt-2 w-full rounded-2xl bg-[#F7F3EC] p-5 text-left">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8c6329]">
          {t("gettingStartedTitle")}
        </p>
        <ul className="flex flex-col gap-1.5 text-sm text-neutral-700">
          <li>· {t("step1")}</li>
          <li>· {t("step2")}</li>
          <li>· {t("step3")}</li>
        </ul>
      </div>
    </div>
  );
}

function ExpiredPanel({ type }: { type: EmailOtpType }) {
  const t = useTranslations("emailConfirme.expired");
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="font-serif text-2xl text-neutral-900">{t("title")}</h1>
      <p className="text-sm text-neutral-600">{t("body")}</p>
      <ResendEmailForm type={type} />
    </div>
  );
}

function InvalidPanel({ type }: { type: EmailOtpType }) {
  const t = useTranslations("emailConfirme.invalid");
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="font-serif text-2xl text-neutral-900">{t("title")}</h1>
      <p className="text-sm text-neutral-600">{t("body")}</p>
      <Link href="/login" className="btn-primary w-full justify-center">
        {t("loginButton")}
      </Link>
      <ResendEmailForm type={type} />
    </div>
  );
}

function ErrorPanel() {
  const t = useTranslations("emailConfirme.error");
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="font-serif text-2xl text-neutral-900">{t("title")}</h1>
      <p className="text-sm text-neutral-600">
        {t.rich("body", {
          contact: (chunks) => (
            <a href="mailto:info@receptcar.com" className="underline">
              {chunks}
            </a>
          ),
        })}
      </p>
    </div>
  );
}

function SuccessIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-14 w-14"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="var(--accent)"
        strokeWidth="2.5"
        className="confirm-icon-circle"
      />
      <path
        d="M15 24.5l6 6 12-14"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="confirm-icon-check"
      />
    </svg>
  );
}
