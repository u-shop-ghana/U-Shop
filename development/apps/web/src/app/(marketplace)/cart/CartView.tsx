"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-provider";
import { apiFetch } from "@/lib/api-client";

export function CartView() {
  const { items, isLoading, removeFromCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-ushop-purple">
        <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 text-center py-16">
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
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.listing.price, 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setError(null);
    try {
      const res = await apiFetch('/api/v1/orders', { method: 'POST' });
      if (res.success && res.data?.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        throw new Error(res.error?.message || 'Checkout failed');
      }
    } catch (err) {
      const e = err as Error;
      setError(e.message || "An unexpected error occurred during checkout.");
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border border-gray-200 rounded-2xl p-4 bg-white">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl relative overflow-hidden flex-shrink-0">
                {item.listing.images && item.listing.images.length > 0 ? (
                  <Image src={item.listing.images[0]} alt={item.listing.title} fill className="object-cover" />
                ) : (
                  <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-gray-300 text-3xl">image</span>
                )}
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <Link href={`/listing/${item.listingId}`} className="font-bold text-gray-900 hover:text-ushop-purple line-clamp-2">
                      {item.listing.title}
                    </Link>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    Qty: {item.quantity} {item.quantity > item.listing.stock && <span className="text-red-500">(Only {item.listing.stock} in stock)</span>}
                  </p>
                </div>
                <div className="font-extrabold text-ushop-purple text-lg mt-2">
                  {formatCurrency(item.listing.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Escrow Protection</span>
                <span className="font-semibold text-green-600 font-mono text-[10px]">INCLUDED</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-ushop-purple">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut || items.some(i => i.quantity > i.listing.stock)}
              className="w-full py-4 rounded-xl bg-gradient-brand text-white font-bold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">lock</span>
                  Secure Checkout
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[12px]">verified_user</span>
              Your money is held safely until you receive the item.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
