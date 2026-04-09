import { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api-server";
import { ListingCard } from "@/components/ui/ListingCard";
import { CATEGORIES } from "@ushop/shared";
import SearchSidebar from "./SearchSidebar";

interface ListingOption {
  id: string;
  title: string;
  price: number;
  condition: string;
  images?: string[];
  store?: {
    handle: string;
    name: string;
    user?: {
      verificationStatus?: string;
    };
  };
}

export const metadata: Metadata = {
  title: "Search Results | U-Shop",
  description: "Find the best student tech deals on U-Shop.",
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = searchParams.q as string | undefined;
  const category = searchParams.category as string | undefined;
  const minPrice = searchParams.minPrice as string | undefined;
  const maxPrice = searchParams.maxPrice as string | undefined;
  const condition = searchParams.condition as string | undefined;
  const buyerUniversity = searchParams.buyerUniversity as string | undefined;
  const sort = searchParams.sort as string | undefined;

  // Build query string from all active filters
  const queryObj = new URLSearchParams();
  if (q) queryObj.append("q", q);
  if (category) queryObj.append("category", category);
  if (minPrice) queryObj.append("minPrice", minPrice);
  if (maxPrice) queryObj.append("maxPrice", maxPrice);
  if (condition) queryObj.append("condition", condition);
  if (buyerUniversity) queryObj.append("buyerUniversity", buyerUniversity);
  if (sort) queryObj.append("sort", sort);

  const res = await apiFetch(`/api/v1/listings?${queryObj.toString()}`);
  const listings: ListingOption[] = res.success ? (res.data || []) : [];

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results header — matching Figma */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            {q ? (
              <>Showing {listings.length} results for &apos;{q}&apos;</>
            ) : (
              "All Listings"
            )}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Found across {buyerUniversity ? buyerUniversity.toUpperCase() : "5 university"} campus{buyerUniversity ? "" : "es"}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <SearchSidebar
              currentParams={{
                q,
                category,
                minPrice,
                maxPrice,
                condition,
                buyerUniversity,
                sort,
              }}
              categories={CATEGORIES.map(c => ({ name: c.name, slug: c.slug }))}
            />
          </aside>

          {/* Main Results Board */}
          <section className="flex-grow">
            {listings.length === 0 ? (
              /* No Results State — matching Figma: centered illustration + tips + CTA */
              <div className="w-full py-16 flex flex-col items-center text-center">
                {/* Search icon illustration */}
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-6xl text-gray-300">search_off</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
                  No results found for &quot;{q || "your search"}&quot;
                </h2>
                <p className="text-gray-500 max-w-md mb-6">
                  We couldn&apos;t find anything matching your search. Don&apos;t give up yet—try adjusting your filters or search terms.
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

                {/* Tips cards matching Figma */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  <div className="border border-gray-200 rounded-2xl p-6 text-left">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-ushop-pink">lightbulb</span>
                      Try these instead
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-500">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-green-500 mt-0.5">check_circle</span>
                        Check your spelling (e.g., &quot;Macbook&quot; instead of &quot;Makbook&quot;).
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-green-500 mt-0.5">check_circle</span>
                        Use more general keywords like &quot;Laptop&quot; instead of specific model numbers.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm text-green-500 mt-0.5">check_circle</span>
                        Browse our popular categories to find similar alternatives.
                      </li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-2xl p-6 text-left">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-ushop-purple">support_agent</span>
                      Need assistance?
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Our campus support team is ready to help you find the right gear for your studies.
                    </p>
                    <div className="flex items-center gap-4">
                      <Link href="/contact" className="text-sm font-bold text-ushop-purple hover:underline inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">chat</span> Live Chat
                      </Link>
                      <Link href="/contact" className="text-sm font-bold text-ushop-purple hover:underline inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">call</span> Request a Callback
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Results Grid — matching Figma: 3-col product cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item) => (
                  <ListingCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    slug={item.id}
                    price={item.price}
                    condition={item.condition}
                    thumbnailUrl={item.images?.[0] || ""}
                    store={{
                      handle: item.store?.handle || "unknown",
                      name: item.store?.name || "Unknown Store",
                      isVerified: item.store?.user?.verificationStatus === "VERIFIED",
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
