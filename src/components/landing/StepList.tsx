"use client";

/**
 * Liste numérotée et cliquable, synchronisée avec un PhoneStage. Pas de
 * bordure colorée à gauche sur l'étape active (règle de direction visuelle) —
 * l'état actif se lit par le fond teinté et le badge de numéro plein.
 */
export function StepList({
  steps,
  activeIndex,
  onSelect,
}: {
  steps: { title: string; body: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="flex flex-col gap-2">
      {steps.map((step, i) => {
        const active = i === activeIndex;
        return (
          <li key={step.title}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={active ? "step" : undefined}
              className={`flex w-full items-start gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors ${
                active ? "bg-[#A87B3F]/10" : "hover:bg-black/[0.03]"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-sm transition-colors ${
                  active ? "bg-[#A87B3F] text-white" : "bg-black/5 text-neutral-500"
                }`}
              >
                {i + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#1A1C20]">{step.title}</span>
                <span className="mt-0.5 block text-sm text-neutral-600">{step.body}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
