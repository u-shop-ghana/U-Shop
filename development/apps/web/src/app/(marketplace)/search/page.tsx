import { Metadata } from "next";
import Link from "next/link";
import { apiPublicFetch } from "@/lib/api-public";
import { ListingCard } from "@/components/ui/ListingCard";
import { CATEGORIES } from "@ushop/shared";
import SearchSidebar from "./SearchSidebar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// ─── Types ──────────────────────────────────────────────────────
interface ListingOption {
  id: string;
  title: string;
  price: number;
  condition: string;
  images?: string[];
  stock?: number;
  store?: {
    handle: string;
    name: string;
    user?: {
      verificationStatus?: string;
    };
  };
}

interface UniversityData {
  id: string;
  name: string;
  shortName: string;
  slug: string;
}

export const metadata: Metadata = {
  title: "Search Results | U-Shop",
  description: "Find the best student tech deals on U-Shop.",
};

export const dynamic = "force-dynamic";

// ─── Sort option labels for display
const SORT_LABELS: Record<string, string> = {
  relevant: "All",
  newest: "Newest First",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
};

// ─── Search Results Page ────────────────────────────────────────
// Matches Figma: light theme, sidebar filters, results grid with sort,
// active filter pills, proper no-results state.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q as string | undefined;
  const category = resolvedParams.category as string | undefined;
  const categorySlug = resolvedParams.categorySlug as string | undefined;
  const minPrice = resolvedParams.minPrice as string | undefined;
  const maxPrice = resolvedParams.maxPrice as string | undefined;
  const condition = resolvedParams.condition as string | undefined;
  const buyerUniversity = resolvedParams.buyerUniversity as string | undefined;
  const sort = (resolvedParams.sort as string) || "relevant";

  // Build the API query string from all active filters.
  // We mirror every filter to the API exactly as defined in the contract.
  const queryObj = new URLSearchParams();
  if (q) queryObj.set("q", q);
  if (category) queryObj.set("category", category);
  if (categorySlug) queryObj.set("categorySlug", categorySlug);
  if (minPrice) queryObj.set("minPrice", minPrice);
  if (maxPrice) queryObj.set("maxPrice", maxPrice);
  if (condition) queryObj.set("condition", condition);
  if (buyerUniversity) queryObj.set("buyerUniversity", buyerUniversity);
  if (sort) queryObj.set("sort", sort);

  const queryString = queryObj.toString();
  const res = await apiPublicFetch(`/api/v1/listings${queryString ? `?${queryString}` : ""}`);
  const listings: ListingOption[] = res.success ? res.data || [] : [];

  // Fetch real university metadata dynamically for the filters
  const uniRes = await apiPublicFetch('/api/v1/universities');
  const dbUniversities = uniRes.success ? (uniRes.data || []) : [];
  const universities = dbUniversities.map((u: UniversityData) => ({
    value: u.shortName.toLowerCase(),
    label: u.name
  }));

  // Collect active filters for display as removable pills
  const activeFilters: { label: string; removeUrl: string }[] = [];
  const buildRemoveUrl = (keyToRemove: string) => {
    const params = new URLSearchParams();
    if (q && keyToRemove !== "q") params.set("q", q);
    if (category && keyToRemove !== "category") params.set("category", category);
    if (categorySlug && keyToRemove !== "categorySlug") params.set("categorySlug", categorySlug);
    if (minPrice && keyToRemove !== "price") params.set("minPrice", minPrice);
    if (maxPrice && keyToRemove !== "price") params.set("maxPrice", maxPrice);
    if (condition && keyToRemove !== "condition") params.set("condition", condition);
    if (buyerUniversity && keyToRemove !== "buyerUniversity") params.set("buyerUniversity", buyerUniversity);
    if (sort !== "relevant" && keyToRemove !== "sort") params.set("sort", sort);
    return `/search?${params.toString()}`;
  };

  if (condition) activeFilters.push({ label: `Condition: ${condition.replace(/_/g, " ")}`, removeUrl: buildRemoveUrl("condition") });
  if (buyerUniversity) {
    const uniName = dbUniversities.find((u: UniversityData) => u.shortName.toLowerCase() === buyerUniversity.toLowerCase())?.shortName || buyerUniversity.toUpperCase();
    activeFilters.push({ label: `University: ${uniName}`, removeUrl: buildRemoveUrl("buyerUniversity") });
  }
  if (minPrice || maxPrice) activeFilters.push({ label: `Price: GH₵${minPrice || "0"} – GH₵${maxPrice || "∞"}`, removeUrl: buildRemoveUrl("price") });

  // Find category name for display
  const categoryName = category
    ? CATEGORIES.find((c) => c.slug === category)?.name || category
    : categorySlug
    ? CATEGORIES.find((c) => c.slug === categorySlug)?.name || categorySlug
    : null;

  return (
    <main className="min-h-screen bg-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs 
          items={[
             { label: "Search" }
          ]} 
          className="mb-4"
        />
        {/* Results header */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            {q ? (
              <>
                Showing {listings.length} results for &apos;{q}&apos;
              </>
            ) : categoryName ? (
              <>
                {categoryName}{" "}
                <span className="text-gray-400 font-normal text-lg">
                  ({listings.length} products)
                </span>
              </>
            ) : (
              <>
                All Products{" "}
                <span className="text-gray-400 font-normal text-lg">
                  ({listings.length})
                </span>
              </>
            )}
          </h1>

          {/* Sort dropdown + active filters row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-3">
            {/* Active filter pills — click X to remove */}
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((f, i) => (
                <Link
                  key={i}
                  href={f.removeUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ushop-purple/10 text-ushop-purple text-xs font-medium rounded-full hover:bg-ushop-purple/20 transition-colors"
                >
                  <span className="truncate max-w-[150px] sm:max-w-[250px]">{f.label}</span>
                  <span className="material-symbols-outlined text-xs flex-shrink-0">
                    close
                  </span>
                </Link>
              ))}
              {activeFilters.length > 0 && (
                <Link
                  href="/search"
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  Clear All
                </Link>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2 text-sm flex-shrink-0">
              <span className="text-gray-500">Sort by:</span>
              <div className="flex gap-1">
                {Object.entries(SORT_LABELS).map(([key, label]) => {
                  const params = new URLSearchParams();
                  if (q) params.set("q", q);
                  if (category) params.set("category", category);
                  if (categorySlug) params.set("categorySlug", categorySlug);
                  if (minPrice) params.set("minPrice", minPrice);
                  if (maxPrice) params.set("maxPrice", maxPrice);
                  if (condition) params.set("condition", condition);
                  if (buyerUniversity) params.set("buyerUniversity", buyerUniversity);
                  if (key !== "relevant") params.set("sort", key);

                  return (
                    <Link
                      key={key}
                      href={`/search?${params.toString()}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        sort === key
                          ? "bg-ushop-purple text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <SearchSidebar
              currentParams={{
                q,
                category: category || categorySlug,
                minPrice,
                maxPrice,
                condition,
                buyerUniversity,
                sort,
              }}
              categories={CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }))}
              universities={universities}
            />
          </aside>

          {/* Main Results Board */}
          <section className="flex-grow">
            {listings.length === 0 ? (
              /* ── No Results State ── */
              <div className="w-full py-16 flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-6xl text-gray-300">
                    search_off
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
                  No results found for &quot;{q || "your search"}&quot;
                </h2>
                <p className="text-gray-500 max-w-md mb-6">
                  We couldn&apos;t find anything matching your search.
                  Don&apos;t give up yet—try adjusting your filters or search
                  terms.
                </p>

                <div className="flex flex-wrap gap-3 mb-10">
                  <Link
                    href="/search"
                    className="px-6 py-3 bg-ushop-purple text-white font-bold rounded-xl hover:bg-ushop-purple/90 transition-colors text-sm"
                  >
                    Clear Search
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    Go to Homepage
                  </Link>
                </div>

                {/* Tips cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  <div className="border border-gray-200 rounded-2xl p-6 text-left">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-ushop-pink">
                        lightbulb
                      </span>
                      Try these instead
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-500">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-green-500 mt-0.5">
                          check_circle
                        </span>
                        Check your spelling (e.g., &quot;Macbook&quot; instead of
                        &quot;Makbook&quot;).
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-green-500 mt-0.5">
                          check_circle
                        </span>
                        Use more general keywords like &quot;Laptop&quot; instead of
                        specific model numbers.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-green-500 mt-0.5">
                          check_circle
                        </span>
                        Browse our popular categories to find similar
                        alternatives.
                      </li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-2xl p-6 text-left">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-ushop-purple">
                        support_agent
                      </span>
                      Need assistance?
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Our campus support team is ready to help you find the right
                      gear for your studies.
                    </p>
                    <div className="flex items-center gap-4">
                      <Link
                        href="/contact"
                        className="text-sm font-bold text-ushop-purple hover:underline inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          chat
                        </span>{" "}
                        Live Chat
                      </Link>
                      <Link
                        href="/contact"
                        className="text-sm font-bold text-ushop-purple hover:underline inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          call
                        </span>{" "}
                        Request a Callback
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Results Grid ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((item) => (
                  <ListingCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    slug={item.id}
                    price={Number(item.price)}
                    condition={item.condition}
                    stock={item.stock}
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
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
