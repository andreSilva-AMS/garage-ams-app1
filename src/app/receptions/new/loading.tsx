import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <SkeletonBlock className="mb-6 h-4 w-24" />
      <SkeletonBlock className="mb-6 h-1 w-full" />
      <SkeletonBlock className="mb-4 h-11 w-full" />
      <SkeletonBlock className="mb-4 h-11 w-full" />
      <SkeletonBlock className="h-11 w-full" />
    </main>
  );
}
