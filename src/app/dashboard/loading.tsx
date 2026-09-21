import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10" />
        <SkeletonBlock className="h-6 w-40" />
      </div>
      <div className="mb-8 flex gap-3">
        <SkeletonBlock className="h-11 w-40" />
        <SkeletonBlock className="h-11 w-40" />
      </div>
      <SkeletonBlock className="mb-8 h-28 w-full" />
      <SkeletonBlock className="h-32 w-full" />
    </main>
  );
}
