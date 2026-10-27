export default function ViewTokenLoading() {
  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-0.5 w-full bg-primary/20 overflow-hidden rounded-full">
        <div className="h-full bg-primary animate-[indeterminate_1.5s_infinite_linear] origin-left w-1/3" />
      </div>
      <div className="h-10 w-full bg-muted/60 rounded-lg" />
      <div className="h-44 w-full bg-muted/40 rounded-xl" />
      <div className="space-y-2">
        <div className="h-12 w-full bg-muted/30 rounded-lg" />
        <div className="h-12 w-full bg-muted/30 rounded-lg" />
      </div>
    </div>
  );
}
