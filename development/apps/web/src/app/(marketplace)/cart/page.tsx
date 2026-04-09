import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shopping Cart | U-Shop',
  description: 'Review the items in your U-Shop cart before checkout.',
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-500 font-medium">
            Review your selected items before proceeding to checkout.
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-ushop-purple">
              shopping_cart
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
            Looks like you haven&apos;t added anything yet. Browse our marketplace
            to find the perfect tech for your campus life.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/search"
              className="bg-ushop-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3b0a63] transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              Browse Products
            </Link>
            <Link
              href="/student-deals"
              className="border-2 border-ushop-purple text-ushop-purple px-8 py-3 rounded-xl font-bold hover:bg-ushop-purple hover:text-white transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">local_offer</span>
              Student Deals
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-ushop-purple">verified_user</span>
            <div>
              <p className="text-sm font-bold text-gray-900">Escrow Protected</p>
              <p className="text-xs text-gray-500">Pay safely, every time</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-ushop-purple">local_shipping</span>
            <div>
              <p className="text-sm font-bold text-gray-900">Campus Delivery</p>
              <p className="text-xs text-gray-500">Direct to your hostel</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-ushop-purple">replay</span>
            <div>
              <p className="text-sm font-bold text-gray-900">Easy Returns</p>
              <p className="text-xs text-gray-500">Hassle-free refunds</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
