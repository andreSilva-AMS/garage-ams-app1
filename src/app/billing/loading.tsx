import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <SkeletonBlock className="mb-6 h-7 w-40" />
      <SkeletonBlock className="mb-6 h-24 w-full" />
      <SkeletonBlock className="h-11 w-full" />
    </main>
  );
}
