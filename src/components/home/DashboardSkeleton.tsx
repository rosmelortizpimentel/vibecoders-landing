import { Skeleton } from "@/components/ui/skeleton";
import { ShowcaseCardSkeleton } from "@/components/showcase/ShowcaseCardSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6 w-full max-w-full overflow-x-hidden p-1 sm:p-0 min-w-0">
      {/* Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full min-w-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </section>

      {/* Action Center */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full min-w-0">
        {/* Pending Testers Panel Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-4 h-64 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-3 flex-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-7 rounded" />
                    <Skeleton className="h-7 w-7 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* App Health Panel Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-4 h-64 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-3 flex-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1">
                     <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fresh Drops Skeleton */}
      <section className="pt-2 w-full min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[...Array(3)].map((_, i) => (
            <ShowcaseCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
