import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Wishlist | U-Shop',
  description: 'View and manage your saved items on U-Shop.',
};

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Wishlist
          </h1>
          <p className="text-gray-500 font-medium">
            Items you&apos;ve saved for later — don&apos;t let them sell out.
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-ushop-pink">
              favorite
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
            Save items you love by tapping the heart icon on any listing.
            They&apos;ll appear here so you can come back to them anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/search"
              className="bg-ushop-pink text-white px-8 py-3 rounded-xl font-bold hover:bg-[#b50f7e] transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              Discover Products
            </Link>
            <Link
              href="/categories"
              className="border-2 border-ushop-pink text-ushop-pink px-8 py-3 rounded-xl font-bold hover:bg-ushop-pink hover:text-white transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">category</span>
              Browse Categories
            </Link>
          </div>
        </div>

        {/* Tip Banner */}
        <div className="mt-8 bg-purple-50 border border-purple-100 rounded-xl p-5 flex items-start gap-4">
          <span className="material-symbols-outlined text-2xl text-ushop-purple mt-0.5">
            lightbulb
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1">Pro tip</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Sign in to sync your wishlist across devices and get notified when
              saved items drop in price or are about to sell out.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
