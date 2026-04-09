'use client';

/* Base shimmer skeleton block */
export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton-shimmer rounded ${className}`} style={style} />;
}

/* Card skeleton — mimics a glass-card with placeholder lines */
export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-sm" />
        <Skeleton className="h-6 w-16 rounded-sm" />
      </div>
    </div>
  );
}

/* Multiple text lines */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: i === lines - 1 ? '60%' : '100%' } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* Recipe grid skeleton */
export function SkeletonRecipeGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-6 w-12 rounded-sm" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-sm" />
            <Skeleton className="h-5 w-14 rounded-sm" />
            <Skeleton className="h-5 w-14 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Stat card skeleton — small metric box */
export function SkeletonStatCard() {
  return (
    <div className="glass-card p-4 flex flex-col items-center gap-2">
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/* Hero banner skeleton */
export function SkeletonHero() {
  return (
    <div className="text-center space-y-4 py-8">
      <Skeleton className="h-3 w-32 mx-auto" />
      <Skeleton className="h-10 w-64 mx-auto" />
      <Skeleton className="h-4 w-48 mx-auto" />
      <div className="divider-amber mt-6" />
    </div>
  );
}

/* Engine ingredient selector skeleton */
export function SkeletonIngredientSelector() {
  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-sm" />
        ))}
      </div>
      {/* Ingredient grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-sm" />
        ))}
      </div>
    </div>
  );
}

/* Academy tab content skeleton */
export function SkeletonTabContent() {
  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="glass-card p-6 space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Academy page skeleton (header + stats + tab content) */
export function SkeletonAcademyPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      {/* Back link */}
      <Skeleton className="h-3 w-20" />

      {/* Header */}
      <div className="mt-8 mb-10 space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-48" />
        <div className="divider-amber mt-6" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-sm flex-shrink-0" />
        ))}
      </div>

      {/* Tab content */}
      <SkeletonTabContent />
    </main>
  );
}
