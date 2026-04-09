"use client";

import Image from "next/image";
import { ConditionBadge } from "../ui/Badge";
import { Button } from "../ui/Button";

// ─── ProductCard Component ──────────────────────────────────────
// Displays a listing card with image, vendor name, title, price,
// rating, condition badge, wishlist heart, and Add to Cart button.
//
// Design reference: design/ui-kit/organisms/Product card.png
// Two states: Active (add to cart enabled) and Disabled (out of stock)

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;          // Renders as strikethrough if > price
  imageUrl: string;
  vendorName: string;
  rating: number;                   // 1-5
  reviewCount: number;
  condition: "NEW" | "LIKE_NEW" | "EXCELLENT" | "GOOD" | "FAIR" | "FOR_PARTS";
  inStock: boolean;
  dealLabel?: string;               // e.g. "Student Deal", "Flash Sale"
  isWishlisted?: boolean;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}

export function ProductCard({
  id,
  title,
  price,
  originalPrice,
  imageUrl,
  vendorName,
  rating,
  reviewCount,
  condition,
  inStock,
  dealLabel,
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist,
  onClick,
  className = "",
}: ProductCardProps) {
  // Format price in Ghanaian Cedi
  const formatPrice = (amount: number) =>
    `GH₵ ${amount.toLocaleString("en-GH")}`;

  // Render star rating (filled stars + empty stars)
  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-xs ${
            i <= Math.round(count) ? "text-amber-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden
        transition-all hover:shadow-lg hover:-translate-y-0.5
        ${!inStock ? "opacity-70" : ""} ${className}`}
    >
      {/* Image section with badges and wishlist button */}
      <div
        className="relative aspect-square bg-gray-50 cursor-pointer"
        onClick={() => onClick?.(id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick?.(id)}
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Condition + Deal badges (top-left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <ConditionBadge condition={condition} />
          {dealLabel && (
            <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white uppercase">
              {dealLabel}
            </span>
          )}
        </div>

        {/* Wishlist heart (top-right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm
            flex items-center justify-center transition-all hover:bg-white hover:scale-110"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <span
            className={`material-symbols-outlined text-lg ${
              isWishlisted
                ? "text-red-500"
                : "text-gray-400"
            }`}
            style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        {/* Out of Stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-4">
        {/* Vendor name */}
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          {vendorName}
        </p>

        {/* Product title */}
        <h3
          className="text-sm font-bold text-gray-900 line-clamp-2 mb-1.5 cursor-pointer hover:text-[#6B1FA8] transition-colors"
          onClick={() => onClick?.(id)}
        >
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">{renderStars(rating)}</div>
          <span className="text-xs text-gray-400">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-extrabold text-[#6B1FA8]">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart / Out of Stock button */}
        <Button
          variant={inStock ? "primary" : "ghost"}
          size="sm"
          fullWidth
          disabled={!inStock}
          onClick={() => inStock && onAddToCart?.(id)}
          leftIcon={
            inStock ? (
              <span className="material-symbols-outlined text-base">
                shopping_cart
              </span>
            ) : undefined
          }
        >
          {inStock ? "ADD TO CART" : "OUT OF STOCK"}
        </Button>
      </div>
    </div>
  );
}
