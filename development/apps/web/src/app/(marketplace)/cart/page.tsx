import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shopping Cart | U-Shop",
  description: "Review items in your cart before checkout.",
};

// Placeholder cart page — will be replaced with full cart functionality
// in Phase 4 (Cart & Escrow). For now, shows a helpful empty state.
export default function CartPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <span className="material-symbols-outlined text-7xl text-gray-300 mb-6 block">
          shopping_cart
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
          Browse our marketplace and add items to your cart. Checkout with escrow protection for safe transactions.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-ushop-purple text-white font-bold px-8 py-3 rounded-xl hover:bg-ushop-purple/90 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">storefront</span>
          Start Shopping
        </Link>
      </div>
    </main>
  );
}
