"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/cart/cart-provider";

interface AddToCartButtonCardProps {
  listingId: string;
  isOutOfStock: boolean;
}

// ─── Add to Cart Button (Card Variant) ─────────────────────────
// Client Component wrapper for the cart action to allow
// e.preventDefault() and stop the parent Link navigation.
export function AddToCartButtonCard({ listingId, isOutOfStock }: AddToCartButtonCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  return (
    <button
      type="button"
      disabled={isOutOfStock || isAdding || added}
      className={`w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm ${
        isOutOfStock
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : added
          ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
          : isAdding
          ? "bg-ushop-purple/70 text-white cursor-wait"
          : "bg-ushop-purple text-white hover:bg-ushop-purple/90 active:scale-[0.98]"
      }`}
      onClick={async (e) => {
        // Prevent clicking the button from triggering the parent <Link> navigation
        e.preventDefault();
        e.stopPropagation();
        
        if (!isOutOfStock && !isAdding && !added) {
          setIsAdding(true);
          try {
            await addToCart(listingId, 1);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          } catch (err) {
            // Error handling could be handled by a toast in a fuller implementation
            console.error(err);
          } finally {
            setIsAdding(false);
          }
        }
      }}
    >
      <span className="material-symbols-outlined text-base">
        {isOutOfStock ? "remove_shopping_cart" : added ? "check_circle" : isAdding ? "hourglass_empty" : "shopping_cart"}
      </span>
      {isOutOfStock ? "Out of Stock" : added ? "Added" : isAdding ? "Adding..." : "Add to Cart"}
    </button>
  );
}
