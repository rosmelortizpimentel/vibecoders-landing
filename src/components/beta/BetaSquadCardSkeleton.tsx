import { Skeleton } from '@/components/ui/skeleton';

export function BetaSquadCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 mb-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Footer */}
      <div className="space-y-3">
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
