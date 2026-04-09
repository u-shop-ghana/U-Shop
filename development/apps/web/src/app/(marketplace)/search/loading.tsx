// ─── Search Loading Skeleton ────────────────────────────────────
export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <div className="h-8 w-80 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar skeleton */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-2xl p-6 space-y-6 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-4 w-full bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
          {/* Results grid skeleton */}
          <section className="flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-100 rounded-2xl" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-5 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                  <div className="h-10 w-full bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
