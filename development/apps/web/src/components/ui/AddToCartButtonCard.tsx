"use client";

import React from "react";

interface AddToCartButtonCardProps {
  isOutOfStock: boolean;
}

// ─── Add to Cart Button (Card Variant) ─────────────────────────
// Client Component wrapper for the cart action to allow
// e.preventDefault() and stop the parent Link navigation.
export function AddToCartButtonCard({ isOutOfStock }: AddToCartButtonCardProps) {
  return (
    <button
      type="button"
      disabled={isOutOfStock}
      className={`w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm ${
        isOutOfStock
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : "bg-ushop-purple text-white hover:bg-ushop-purple/90 active:scale-[0.98]"
      }`}
      onClick={(e) => {
        // Prevent clicking the button from triggering the parent <Link> navigation
        e.preventDefault();
        e.stopPropagation();
        // TODO: Wire to cart API once cart feature is implemented
        console.log("Add to cart placeholder clicked");
      }}
    >
      <span className="material-symbols-outlined text-base">
        {isOutOfStock ? "remove_shopping_cart" : "shopping_cart"}
      </span>
      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}
