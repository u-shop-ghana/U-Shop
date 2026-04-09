// ─── Marketplace Loading Skeleton ────────────────────────────────
// Shown while the homepage data (universities, categories, featured
// listings) is being fetched. Uses CSS animation via animate-pulse.
export default function MarketplaceLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero section skeleton */}
      <div className="relative h-[400px] bg-gray-100 animate-pulse" />

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Section title */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Product grid skeleton */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
