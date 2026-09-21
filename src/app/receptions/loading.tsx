import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <SkeletonBlock className="mb-6 h-7 w-48" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-20 w-full" />
        ))}
      </div>
    </main>
  );
}
