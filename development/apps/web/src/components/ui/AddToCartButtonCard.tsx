"use client";

import React, { useState } from "react";

interface AddToCartButtonCardProps {
  isOutOfStock: boolean;
}

// ─── Add to Cart Button (Card Variant) ─────────────────────────
// Client Component wrapper for the cart action to allow
// e.preventDefault() and stop the parent Link navigation.
export function AddToCartButtonCard({ isOutOfStock }: AddToCartButtonCardProps) {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <button
      type="button"
      disabled={isOutOfStock || showComingSoon}
      className={`w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm ${
        isOutOfStock
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : showComingSoon
          ? "bg-amber-100 text-amber-700 border border-amber-200 cursor-default"
          : "bg-ushop-purple text-white hover:bg-ushop-purple/90 active:scale-[0.98]"
      }`}
      onClick={(e) => {
        // Prevent clicking the button from triggering the parent <Link> navigation
        e.preventDefault();
        e.stopPropagation();
        
        if (!isOutOfStock) {
          setShowComingSoon(true);
          setTimeout(() => setShowComingSoon(false), 2000);
        }
      }}
    >
      <span className="material-symbols-outlined text-base">
        {isOutOfStock ? "remove_shopping_cart" : showComingSoon ? "schedule" : "shopping_cart"}
      </span>
      {isOutOfStock ? "Out of Stock" : showComingSoon ? "Coming Soon" : "Add to Cart"}
    </button>
  );
}
