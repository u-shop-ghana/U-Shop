import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiPublicFetch } from "@/lib/api-public";
import { formatCurrency } from "@/lib/utils";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { ProductTabs } from "@/components/ui/ProductTabs";
import { ListingCard } from "@/components/ui/ListingCard";

export const revalidate = 15;

// ─── Types ──────────────────────────────────────────────────────
// These match the API response shape from GET /api/v1/listings/:id
interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  stock: number;
  images: string[];
  createdAt: string;
  store: {
    name: string;
    handle: string;
    logoUrl: string | null;
    averageRating: number;
    reviewCount: number;
    totalSales: number;
    returnWindow: string;
    sellerType: string;
    user: { verificationStatus: string };
  };
  category: {
    name: string;
    slug: string;
  };
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: {
    fullName: string;
    universityName: string | null;
  };
}

interface SimilarListing {
  id: string;
  title: string;
  price: number;
  condition: string;
  images: string[];
  store: {
    handle: string;
    name: string;
    user?: { verificationStatus: string };
  };
}

// ─── SEO Metadata ───────────────────────────────────────────────
// Generate dynamic SEO meta tags from the listing data.
// OpenGraph image uses the first product image for social previews.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const res = await apiPublicFetch(`/api/v1/listings/${resolvedParams.id}`);

  if (!res.success || !res.data) {
    return { title: "Product Not Found | U-Shop" };
  }

  const listing = res.data;
  return {
    title: `${listing.title} | U-Shop`,
    description: listing.description.substring(0, 160),
    openGraph: {
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  };
}

// Format condition text: BRAND_NEW → "Brand New"
function formatCondition(str: string) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
}

// Condition badge colors matching UI Kit atoms
const CONDITION_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  NEW: { backgroundColor: "rgba(34,197,94,0.12)", color: "#22C55E" },
  LIKE_NEW: { backgroundColor: "rgba(6,182,212,0.12)", color: "#06B6D4" },
  EXCELLENT: { backgroundColor: "rgba(59,130,246,0.10)", color: "#3B82F6" },
  GOOD: { backgroundColor: "rgba(245,158,11,0.12)", color: "#F59E0B" },
  FAIR: { backgroundColor: "rgba(249,115,22,0.12)", color: "#F97316" },
  FOR_PARTS: { backgroundColor: "rgba(244,63,94,0.10)", color: "#F43F5E" },
};

// Format return window codes: 7D → "7 Days", NO_RETURNS → "No Returns"
function formatReturnWindow(code: string) {
  if (code === "NO_RETURNS") return "No Returns";
  const match = code.match(/^(\d+)D$/);
  return match ? `${match[1]} Days` : code;
}

// ─── Star Rating Display ────────────────────────────────────────
function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "md" ? "text-lg" : "text-sm";
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${starSize} ${
            star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Product Detail Page ────────────────────────────────────────
// Matches Figma: design/ui-kit/Screens/desktop/Product detail.png
// Layout: breadcrumb → 2-col (gallery + checkout) → tabs → reviews → similar
export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  // Fetch listing detail and reviews in parallel for performance
  const [listingRes, reviewsRes] = await Promise.all([
    apiPublicFetch(`/api/v1/listings/${resolvedParams.id}`),
    apiPublicFetch(`/api/v1/stores/reviews?listingId=${resolvedParams.id}`).catch(
      () => ({ success: false, data: [] })
    ),
  ]);

  if (!listingRes.success || !listingRes.data) {
    notFound();
  }

  const listing: ListingDetail = listingRes.data;
  const reviews: ReviewData[] = reviewsRes.success ? reviewsRes.data || [] : [];
  const store = listing.store;
  const isVerified = store.user?.verificationStatus === "VERIFIED";
  const isInStock = listing.stock > 0;

  // Fetch similar listings from same category (excluding this one)
  const similarRes = await apiPublicFetch(
    `/api/v1/listings?categorySlug=${listing.category.slug}&limit=4`
  ).catch(() => ({ success: false, data: [] }));
  const similarListings: SimilarListing[] = (
    similarRes.success ? similarRes.data || [] : []
  ).filter((l: SimilarListing) => l.id !== listing.id).slice(0, 4);

  return (
    <main className="min-h-screen bg-white pt-4 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Breadcrumb Navigation ── */}
        <nav
          className="flex flex-wrap items-center text-sm text-gray-500 mb-6 py-3 overflow-x-auto scrollbar-hide"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-ushop-purple transition-colors whitespace-nowrap">
            Home
          </Link>
          <span className="mx-2 text-gray-300">›</span>
          <Link
            href={`/categories/${listing.category.slug}`}
            className="hover:text-ushop-purple transition-colors whitespace-nowrap"
          >
            {listing.category.name}
          </Link>
          <span className="mx-2 text-gray-300">›</span>
          <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-[250px]">
            {listing.title}
          </span>
        </nav>

        {/* ── Main Content: 2-Column Layout ── */}
        <div className="flex flex-col lg:flex-row gap-10 mb-12">
          {/* Left Column: Image Gallery */}
          <div className="w-full lg:w-3/5 overflow-hidden">
            <ImageGallery images={listing.images} title={listing.title} />
          </div>

          {/* Right Column: Product Info + CTAs */}
          <div className="w-full lg:w-2/5">
            {/* Badges: Verified Seller + Stock Status + Condition */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 bg-ushop-purple/10 text-ushop-purple text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wide">
                  <span
                    className="material-symbols-outlined text-[10px] sm:text-xs"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    verified
                  </span>
                  Verified Seller
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold ${
                  listing.stock > 10
                    ? "text-green-600"
                    : listing.stock > 0
                    ? "text-amber-600"
                    : "text-red-500"
                }`}
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current" />
                {listing.stock > 10
                  ? "In Stock"
                  : listing.stock > 0
                  ? `Only ${listing.stock} left`
                  : "Out of Stock"}
              </span>
              <span
                className="px-2 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded"
                style={CONDITION_STYLES[listing.condition.toUpperCase().replace(/\s+/g, "_")]}
              >
                {formatCondition(listing.condition)}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
              {listing.title}
            </h1>

            {/* Rating + Sales Count */}
            <div className="flex items-center gap-3 mb-5">
              <StarDisplay rating={store.averageRating} size="md" />
              <span className="text-sm text-gray-600">
                {store.averageRating.toFixed(1)} ({store.reviewCount} Reviews)
              </span>
              {store.totalSales > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    Sold {store.totalSales}+
                  </span>
                </>
              )}
            </div>

            {/* ── Price Block ── */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-ushop-purple">
                  {formatCurrency(Number(listing.price))}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Price inclusive of all taxes. Delivery fees calculated at
                checkout.
              </p>
            </div>

            {/* ── Store Card ── */}
            <Link href={`/store/${store.handle}`} className="block mb-5">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-ushop-purple/30 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative flex-shrink-0">
                    {store.logoUrl ? (
                      <Image
                        src={store.logoUrl}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-gray-400">
                        store
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {store.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                        ★ {store.averageRating.toFixed(1)}
                      </span>
                      <span>
                        ({store.totalSales}+ sales)
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-bold text-ushop-purple border border-ushop-purple rounded-lg px-3 py-1.5 hover:bg-ushop-purple hover:text-white transition-colors">
                  Visit Store
                </span>
              </div>
            </Link>

            {/* ── Quantity Selector ── */}
            {isInStock && (
              <div className="mb-5">
                <QuantitySelector max={listing.stock} />
              </div>
            )}

            {/* ── CTA Buttons ── */}
            <div className="space-y-3 mb-5">
              {/* Buy Now — primary purple gradient */}
              <button
                type="button"
                disabled={!isInStock}
                className="w-full py-3.5 rounded-xl bg-gradient-brand text-white font-bold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">
                  shopping_bag
                </span>
                {isInStock ? "Buy Now" : "Out of Stock"}
              </button>

              {/* Add to Cart — outline secondary */}
              <button
                type="button"
                disabled={!isInStock}
                className="w-full py-3.5 rounded-xl border-2 border-ushop-purple text-ushop-purple font-bold text-base flex items-center justify-center gap-2 hover:bg-ushop-purple/5 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">
                  shopping_cart
                </span>
                Add to Cart
              </button>
            </div>

            {/* ── Free Campus Delivery Banner ── */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <span className="material-symbols-outlined text-green-600 text-xl mt-0.5">
                local_shipping
              </span>
              <div>
                <p className="text-sm font-bold text-green-700">
                  Free Campus Delivery
                </p>
                <p className="text-xs text-green-600">
                  Available for UG, KNUST, and UCC campuses within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs Section + Reviews ── */}
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          {/* Left: Tabbed Content */}
          <div className="w-full lg:w-3/5">
            <ProductTabs
              tabs={[
                {
                  label: "Description",
                  content: (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Product Description
                      </h2>
                      <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">
                        {listing.description}
                      </div>

                      {/* Specifications Table — matches Figma layout */}
                      <table className="w-full text-sm border-collapse">
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="py-3 pr-4 font-medium text-gray-500 w-40">
                              Condition
                            </td>
                            <td className="py-3 text-gray-900">
                              {formatCondition(listing.condition)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-3 pr-4 font-medium text-gray-500">
                              Category
                            </td>
                            <td className="py-3 text-gray-900">
                              {listing.category.name}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-3 pr-4 font-medium text-gray-500">
                              Stock Available
                            </td>
                            <td className="py-3 text-gray-900">
                              {listing.stock}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 font-medium text-gray-500">
                              Listed On
                            </td>
                            <td className="py-3 text-gray-900">
                              {new Date(listing.createdAt).toLocaleDateString(
                                "en-GB",
                                { day: "numeric", month: "long", year: "numeric" }
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ),
                },
                {
                  label: "Specifications",
                  content: (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Technical Specifications
                      </h2>
                      <p className="text-gray-500 text-sm">
                        Detailed technical specifications are provided by the
                        seller. Contact the store for additional details.
                      </p>
                      <table className="w-full text-sm border-collapse">
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="py-3 pr-4 font-medium text-gray-500 w-40">
                              Condition
                            </td>
                            <td className="py-3 text-gray-900">
                              {formatCondition(listing.condition)}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-3 pr-4 font-medium text-gray-500">
                              Seller Type
                            </td>
                            <td className="py-3 text-gray-900 capitalize">
                              {store.sellerType.toLowerCase()}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 font-medium text-gray-500">
                              Return Window
                            </td>
                            <td className="py-3 text-gray-900">
                              {formatReturnWindow(store.returnWindow)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ),
                },
                {
                  label: "Warranty & Shipping",
                  content: (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                          Return Policy
                        </h2>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Return Window
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatReturnWindow(store.returnWindow)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                          Shipping
                        </h2>
                        <div className="bg-green-50 rounded-xl p-4 text-sm">
                          <p className="text-green-700 font-medium">
                            Free campus delivery available for UG, KNUST, and
                            UCC. Other locations may incur delivery fees
                            calculated at checkout.
                          </p>
                        </div>
                      </div>
                      {/* Escrow protection notice */}
                      <div className="flex items-start gap-3 p-4 bg-ushop-purple/5 border border-ushop-purple/10 rounded-xl">
                        <span className="material-symbols-outlined text-ushop-purple text-xl mt-0.5">
                          verified_user
                        </span>
                        <div>
                          <p className="text-sm font-bold text-ushop-purple">
                            Protected by U-Shop Escrow
                          </p>
                          <p className="text-xs text-gray-600">
                            The seller doesn&apos;t get paid until you
                            confirm receipt. Your money is safe.
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Right: Student Reviews — matches Figma */}
          <div className="w-full lg:w-2/5">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Student Reviews
            </h2>
            {reviews.length === 0 ? (
              <div className="border border-gray-200 rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
                  rate_review
                </span>
                <p className="text-sm text-gray-500">
                  No reviews yet. Be the first to review after purchase!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <StarDisplay rating={review.rating} />
                    {review.comment && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {/* Author initials avatar */}
                      <div className="w-7 h-7 rounded-full bg-ushop-purple/10 text-ushop-purple text-xs font-bold flex items-center justify-center">
                        {review.author.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          {review.author.fullName}
                        </p>
                        {review.author.universityName && (
                          <p className="text-[10px] text-gray-400">
                            {review.author.universityName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {reviews.length > 3 && (
                  <button
                    type="button"
                    className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    See All Reviews ({reviews.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Similar Products Carousel ── */}
        {similarListings.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Similar {listing.category.name}
              </h2>
              <Link
                href={`/search?categorySlug=${listing.category.slug}`}
                className="text-sm font-bold text-ushop-purple hover:underline"
              >
                View All {listing.category.name}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarListings.map((item) => (
                <ListingCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  slug={item.id}
                  price={Number(item.price)}
                  condition={item.condition}
                  thumbnailUrl={item.images?.[0] || ""}
                  store={{
                    handle: item.store?.handle || "unknown",
                    name: item.store?.name || "Unknown Store",
                    isVerified:
                      item.store?.user?.verificationStatus === "VERIFIED",
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
