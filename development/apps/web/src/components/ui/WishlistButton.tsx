"use client";

import React, { useState } from "react";

// ─── Wishlist Button ───────────────────────────────────────────
// Client Component wrapper for the wishlist action to allow
// e.preventDefault() and stop the Link navigation.
// Extracted out of ListingCard to keep the card as a Server Component.
export function WishlistButton() {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <div className="absolute top-3 right-3 z-10">
      {showComingSoon && (
        <div className="absolute -top-8 right-0 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
          Coming Soon
        </div>
      )}
      <button
        type="button"
        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
          showComingSoon ? "bg-amber-50" : "bg-white/90 backdrop-blur-sm hover:bg-white"
        }`}
        aria-label="Add to wishlist"
        onClick={(e) => {
          // Prevent clicking the heart from triggering the parent <Link> navigation
          e.preventDefault();
          e.stopPropagation();
          
          setShowComingSoon(true);
          setTimeout(() => setShowComingSoon(false), 2000);
        }}
      >
        <span 
          className={`material-symbols-outlined text-lg transition-colors ${
            showComingSoon ? "text-amber-500" : "text-gray-400 hover:text-red-500"
          }`} 
          aria-hidden="true"
        >
          favorite
        </span>
      </button>
    </div>
  );
}
