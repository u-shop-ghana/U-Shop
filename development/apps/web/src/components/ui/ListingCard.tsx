import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

export interface ListingCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  condition: string;
  thumbnailUrl: string;
  store: {
    handle: string;
    name: string;
    isVerified: boolean;
  };
  className?: string;
}

const CONDITION_COLORS: Record<string, string> = {
  BRAND_NEW: "bg-status-success text-white",
  LIKE_NEW: "bg-ushop-purple text-white",
  GOOD: "bg-gray-700 text-gray-200",
  FAIR: "bg-status-warning text-gray-900",
  REFURBISHED: "bg-status-info text-white",
};

const formatCondition = (str: string) => {
  return str.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

export function ListingCard({
  id,
  title,
  price,
  condition,
  thumbnailUrl,
  store,
  className = "",
}: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`}>
      <div
        className={`group flex flex-col bg-campus-form-bg border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-ushop-purple/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      >
        {/* Image Area */}
        <div className="relative aspect-[4/3] w-full bg-campus-dark overflow-hidden">
          <Image
            src={thumbnailUrl || "/assets/images/defaults/placeholder.webp"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Condition Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full shadow-md backdrop-blur-md ${
                CONDITION_COLORS[condition] || "bg-gray-600 text-white"
              }`}
            >
              {formatCondition(condition)}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="text-white font-bold text-base leading-tight mb-2 line-clamp-2 group-hover:text-status-info transition-colors">
            {title}
          </h3>

          <div className="mt-auto pt-2 space-y-3">
            {/* Price */}
            <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-brand">
              {formatCurrency(price)}
            </div>

            {/* Store Banner */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10">
              <span className="material-symbols-outlined text-gray-400 text-sm">
                storefront
              </span>
              <span className="text-sm text-gray-300 font-medium truncate">
                {store.name}
              </span>
              {store.isVerified && (
                <span
                  className="material-symbols-outlined text-status-success text-sm"
                  title="Verified Seller"
                >
                  verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
