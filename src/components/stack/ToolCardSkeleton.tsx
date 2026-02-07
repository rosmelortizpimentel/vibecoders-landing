import { Skeleton } from '@/components/ui/skeleton';

export function ToolCardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-[50px] h-[50px] rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}
