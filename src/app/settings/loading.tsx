import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <SkeletonBlock className="mb-6 h-7 w-56" />
      <div className="flex flex-col gap-4">
        <SkeletonBlock className="h-20 w-20 rounded-full" />
        <SkeletonBlock className="h-11 w-full" />
        <SkeletonBlock className="h-11 w-full" />
        <SkeletonBlock className="h-11 w-full" />
      </div>
    </main>
  );
}
