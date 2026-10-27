export default function VendorLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top subtle progress line */}
      <div className="h-0.5 w-full bg-primary/20 overflow-hidden rounded-full">
        <div className="h-full bg-primary animate-[indeterminate_1.5s_infinite_linear] origin-left w-1/3" />
      </div>

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-60 bg-muted rounded-md" />
        <div className="h-4 w-96 max-w-full bg-muted/60 rounded-md" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border/60 bg-card/60 space-y-2.5">
            <div className="h-4 w-28 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted/80 rounded" />
            <div className="h-3 w-32 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Main card skeleton */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-6 space-y-3">
        <div className="h-6 w-44 bg-muted rounded" />
        <div className="h-10 w-full bg-muted/40 rounded-md" />
        <div className="h-28 w-full bg-muted/30 rounded-md" />
      </div>
    </div>
  );
}
