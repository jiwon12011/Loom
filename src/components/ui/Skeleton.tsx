export function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-2xl p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="h-4 bg-surface-section rounded w-full mb-2" />
          <div className="h-4 bg-surface-section rounded w-3/4 mb-3" />
          <div className="flex gap-2">
            <div className="h-5 bg-surface-section rounded w-16" />
            <div className="h-5 bg-surface-section rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
