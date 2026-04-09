"use client";

import React from "react";

// ─── Wishlist Button ───────────────────────────────────────────
// Client Component wrapper for the wishlist action to allow
// e.preventDefault() and stop the Link navigation.
// Extracted out of ListingCard to keep the card as a Server Component.
export function WishlistButton() {
  return (
    <button
      type="button"
      className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
      aria-label="Add to wishlist"
      onClick={(e) => {
        // Prevent clicking the heart from triggering the parent <Link> navigation
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement Wishlist functionality in Phase 5
        console.log("Wishlist placeholder clicked");
      }}
    >
      <span className="material-symbols-outlined text-gray-400 text-lg hover:text-red-500 transition-colors">
        favorite
      </span>
    </button>
  );
}
