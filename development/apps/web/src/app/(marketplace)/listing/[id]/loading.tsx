// ─── Product Detail Loading Skeleton ────────────────────────────
// Shown while the listing detail API call is in flight.
export default function ListingDetailLoading() {
  return (
    <main className="min-h-screen bg-white pt-4 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6 py-3">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* 2-column layout */}
        <div className="flex flex-col lg:flex-row gap-10 mb-12">
          {/* Image gallery skeleton */}
          <div className="w-full lg:w-3/5 flex gap-3">
            <div className="hidden md:flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-20 h-20 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
            <div className="flex-1 aspect-[4/3] bg-gray-100 rounded-xl animate-pulse" />
          </div>

          {/* Right column skeleton */}
          <div className="w-full lg:w-2/5 space-y-4">
            <div className="h-5 w-32 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-1/2 bg-gray-100 rounded animate-pulse" />
            <div className="h-16 w-full bg-gray-50 rounded-xl animate-pulse" />
            <div className="h-20 w-full bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-10 w-40 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-14 w-full bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-14 w-full bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
