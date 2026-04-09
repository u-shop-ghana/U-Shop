import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";
import { AddToCartButtonCard } from "./AddToCartButtonCard";

// ─── Product Card Props ─────────────────────────────────────────
// Matches the Figma component design/ui-kit/organisms/Product card.png
// Two states: ACTIVE (in stock) and DISABLED (out of stock).
export interface ListingCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number;   // Show strikethrough if provided
  condition: string;
  thumbnailUrl: string;
  stock?: number;           // 0 = out of stock
  rating?: number;          // 1-5 average
  reviewCount?: number;
  dealLabel?: string;       // e.g. "STUDENT DEAL", "SALE"
  store: {
    handle: string;
    name: string;
    isVerified: boolean;
  };
  className?: string;
}

// Condition badge colors — green for new, purple for like-new, etc.
const CONDITION_STYLES: Record<string, string> = {
  BRAND_NEW: "bg-green-600 text-white",
  LIKE_NEW: "bg-ushop-purple text-white",
  EXCELLENT: "bg-blue-600 text-white",
  GOOD: "bg-gray-600 text-white",
  FAIR: "bg-yellow-500 text-gray-900",
  REFURBISHED: "bg-cyan-600 text-white",
};

// Format condition text: BRAND_NEW → "Brand New"
const formatCondition = (str: string) =>
  str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

// Render star icons for rating display
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xs ${
              star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
            }`}
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

// ─── Listing Card Component ─────────────────────────────────────
// Matching Figma exactly:
// - White card with rounded corners and shadow
// - CONDITION badge (top-left, green)
// - DEAL badge below condition (red)
// - Wishlist heart (top-right, visual only)
// - Product image
// - VENDOR NAME (uppercase, small, gray)
// - Product Title (bold, dark)
// - Star rating + review count
// - Price (large, purple) + original price (strikethrough)
// - ADD TO CART button (full width, purple)
// - Out of stock: greyed card, red OUT OF STOCK overlay on image, disabled button
export function ListingCard({
  id,
  title,
  price,
  originalPrice,
  condition,
  thumbnailUrl,
  stock,
  rating,
  reviewCount,
  dealLabel,
  store,
  className = "",
}: ListingCardProps) {
  const isOutOfStock = stock !== undefined && stock <= 0;
  // Calculate discount percentage if original price is provided
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return (
    <div
      className={`group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        isOutOfStock ? "opacity-75" : "hover:-translate-y-1"
      } ${className}`}
    >
      {/* Image Area — links to the product detail page */}
      <Link href={`/listing/${id}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-gray-50 overflow-hidden">
          <Image
            src={thumbnailUrl || "/assets/images/defaults/placeholder.webp"}
            alt={title}
            fill
            className={`object-cover transition-transform duration-500 ${
              isOutOfStock ? "grayscale" : "group-hover:scale-105"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Condition badge — top left, always visible */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            <span
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                CONDITION_STYLES[condition] || "bg-gray-600 text-white"
              }`}
            >
              {formatCondition(condition)}
            </span>
            {/* Deal label — below condition badge */}
            {dealLabel && (
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-red-600 text-white">
                {dealLabel}
              </span>
            )}
          </div>

          {/* Wishlist heart — top right (visual only placeholder) */}
          {/* Wishlist heart — top right (visual only placeholder) */}
          <WishlistButton />

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Vendor name — uppercase, small, gray */}
        <Link href={`/store/${store.handle}`} className="flex items-center gap-1 mb-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide truncate hover:text-ushop-purple transition-colors">
            {store.name}
          </span>
          {store.isVerified && (
            <span
              className="material-symbols-outlined text-green-500 text-xs"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              verified
            </span>
          )}
        </Link>

        {/* Product title */}
        <Link href={`/listing/${id}`}>
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-ushop-purple transition-colors">
            {title}
          </h3>
        </Link>

        {/* Star rating — if available */}
        {rating !== undefined && reviewCount !== undefined && (
          <StarRating rating={rating} count={reviewCount} />
        )}

        <div className="mt-auto pt-3">
          {/* Price block — current price + original (strikethrough) */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-extrabold text-ushop-purple">
              {formatCurrency(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(originalPrice)}
                </span>
                {discountPercent && (
                  <span className="text-[10px] font-bold text-white bg-green-500 px-1.5 py-0.5 rounded">
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* ADD TO CART button — matches Figma: full width, purple with cart icon */}
          <AddToCartButtonCard isOutOfStock={isOutOfStock} />
        </div>
      </div>
    </div>
  );
}
