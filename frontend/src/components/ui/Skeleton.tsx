interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="h-full w-full animate-shimmer" />
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}

export function AgentCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] p-6 text-center space-y-4">
      <Skeleton className="w-20 h-20 rounded-full mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
      <div className="flex justify-center gap-6 pt-2">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}

export function CityCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] overflow-hidden">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="text-center space-y-2">
      <Skeleton className="h-8 w-20 mx-auto" />
      <Skeleton className="h-4 w-16 mx-auto" />
    </div>
  );
}
