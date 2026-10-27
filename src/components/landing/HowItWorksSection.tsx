"use client";

import { useRef, useState } from "react";
import { PhoneStage, type PhoneStageHandle } from "./PhoneStage";
import { RECEPTION_SCREENS } from "./receptionScreens";
import { StepList } from "./StepList";

/**
 * Section "Comment ça marche" : liste des 5 étapes à gauche, smartphone
 * animé à droite, synchronisés dans les deux sens — la boucle automatique
 * met à jour la liste, et un clic sur une étape fait sauter le téléphone
 * (et met la boucle en pause quelques secondes, géré dans PhoneStage).
 */
export function HowItWorksSection({ steps }: { steps: { title: string; body: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const phoneRef = useRef<PhoneStageHandle>(null);

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="order-2 lg:order-1">
        <StepList steps={steps} activeIndex={activeIndex} onSelect={(i) => phoneRef.current?.goTo(i)} />
      </div>
      <div className="order-1 lg:order-2">
        <PhoneStage
          ref={phoneRef}
          screens={RECEPTION_SCREENS}
          onActiveIndexChange={setActiveIndex}
        />
      </div>
    </div>
  );
}
