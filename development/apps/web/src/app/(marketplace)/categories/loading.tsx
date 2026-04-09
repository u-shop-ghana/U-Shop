// ─── Categories Loading Skeleton ─────────────────────────────────
export default function CategoriesLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-gray-100 py-16 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-4" />
          <div className="h-5 w-96 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
