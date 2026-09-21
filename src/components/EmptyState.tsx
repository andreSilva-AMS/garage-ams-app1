import type { LucideIcon } from "lucide-react";

/** Bloc générique pour une liste vide (icône + message), style cohérent partout. */
export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-color px-4 py-10 text-center">
      <Icon className="h-8 w-8 text-muted" aria-hidden="true" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
