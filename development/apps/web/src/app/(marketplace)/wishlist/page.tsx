import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wishlist | U-Shop",
  description: "Your saved items on U-Shop.",
};

// Placeholder wishlist page — will be replaced with full wishlist
// functionality in a future phase. Shows a helpful empty state for now.
export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <span className="material-symbols-outlined text-7xl text-gray-300 mb-6 block">
          favorite
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Your Wishlist is Empty
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
          Save items you love and come back to them later. Tap the heart icon on any product to add it here.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-ushop-purple text-white font-bold px-8 py-3 rounded-xl hover:bg-ushop-purple/90 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">explore</span>
          Discover Products
        </Link>
      </div>
    </main>
  );
}
