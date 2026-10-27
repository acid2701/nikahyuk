export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top subtle progress line */}
      <div className="h-0.5 w-full bg-primary/20 overflow-hidden rounded-full">
        <div className="h-full bg-primary animate-[indeterminate_1.5s_infinite_linear] origin-left w-1/3" />
      </div>

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-56 bg-muted rounded-md" />
        <div className="h-4 w-80 max-w-full bg-muted/60 rounded-md" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-xl border border-border/60 bg-card/60 space-y-3">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-8 w-20 bg-muted/80 rounded" />
            <div className="h-3 w-48 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-3">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full bg-muted/40 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
