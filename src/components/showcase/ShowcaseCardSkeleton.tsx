import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export function ShowcaseCardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <AspectRatio ratio={16 / 9}>
        <Skeleton className="w-full h-full rounded-none" />
      </AspectRatio>

      {/* Body skeleton */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-stone-100" />

      {/* Footer skeleton */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    </div>
  );
}
