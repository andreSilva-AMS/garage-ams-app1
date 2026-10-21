"use client";

import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";

/**
 * Lit la vidéo de démonstration filmée à l'atelier. Le fichier n'existe pas
 * forcément encore (tournage à venir) : plutôt qu'un lecteur cassé, on
 * détecte l'échec de chargement et on bascule sur un repli élégant.
 *
 * Avec preload="none" (demandé pour la performance), le <video> ne tente
 * jamais de charger la source tant que l'utilisateur n'a pas cliqué play —
 * son onError ne se déclencherait donc qu'après un clic, trop tard pour
 * éviter un lecteur qui a l'air normal mais ne fonctionne pas. Le poster,
 * lui, est une image classique chargée immédiatement quel que soit preload :
 * on s'en sert pour détecter en amont si le fichier existe.
 */
export function DemoVideoPlayer({
  src,
  poster,
  comingSoonLabel,
}: {
  src: string;
  poster: string;
  comingSoonLabel: string;
}) {
  const [status, setStatus] = useState<"checking" | "available" | "unavailable">("checking");

  useEffect(() => {
    const img = new Image();
    img.onload = () => setStatus("available");
    img.onerror = () => setStatus("unavailable");
    img.src = poster;
  }, [poster]);

  if (status !== "available") {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-3xl border border-white/10 bg-[#15171b] text-white/70 shadow-2xl sm:aspect-[16/10]">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <PlayCircle className="h-10 w-10 text-white/30" aria-hidden="true" />
          {status === "unavailable" && <p className="text-sm font-medium">{comingSoonLabel}</p>}
        </div>
      </div>
    );
  }

  return (
    <video
      className="w-full rounded-3xl border border-white/10 bg-[#15171b] shadow-2xl"
      src={src}
      poster={poster}
      controls
      playsInline
      preload="none"
    />
  );
}
