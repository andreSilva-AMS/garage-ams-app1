"use client";

import { useEffect, useState } from "react";
import { Download, Check, Share } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallAppButton({
  installLabel,
  installedLabel,
  iosInstructions,
}: {
  installLabel: string;
  installedLabel: string;
  iosInstructions: string;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => typeof window !== "undefined" && isStandalone());
  const [ios] = useState(() => typeof window !== "undefined" && isIos());
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (installed) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
        <Check className="h-4 w-4" aria-hidden="true" />
        {installedLabel}
      </div>
    );
  }

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    setShowIosHint(true);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={handleClick} className="btn-secondary">
        <Download className="h-4 w-4" aria-hidden="true" />
        {installLabel}
      </button>
      {(showIosHint || (ios && !deferredPrompt)) && (
        <p className="flex max-w-xs items-center gap-1.5 text-center text-xs text-neutral-500">
          <Share className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {iosInstructions}
        </p>
      )}
    </div>
  );
}
