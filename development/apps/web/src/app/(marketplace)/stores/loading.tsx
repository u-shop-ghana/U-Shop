// ─── Stores Loading Skeleton ────────────────────────────────────
export default function StoresLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-gray-100 py-16 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-4" />
          <div className="h-5 w-80 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-[3/2] bg-gray-100 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-10 w-full bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
