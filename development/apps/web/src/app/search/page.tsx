import { Metadata } from "next";
import { apiFetch } from "@/lib/api-server";
import { ListingCard } from "@/components/ui/ListingCard";
import { CATEGORIES } from "@ushop/shared";
import SearchSidebar from "./SearchSidebar";
import Image from "next/image";

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
    <main className="min-h-screen bg-campus-dark flex flex-col md:flex-row pb-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8">
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
        <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white">
              {q ? `Search: "${q}"` : "All Listings"}
            </h1>
            <p className="text-gray-400 mt-1 font-medium">
              {listings.length} item{listings.length !== 1 ? "s" : ""} found
              {buyerUniversity && ` around ${buyerUniversity.toUpperCase()}`}
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-3xl">
            <Image 
              src="/assets/images/defaults/placeholder.webp"
              alt="No results"
              width={200}
              height={200}
              className="opacity-50 blur-[2px] mb-6 grayscale mix-blend-screen"
            />
            <h3 className="text-2xl font-bold text-white mb-2">No hardware found</h3>
            <p className="text-gray-400 font-medium text-center max-w-md">
              Try adjusting your filters, searching for a broader term, or stripping location requirements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                slug={item.id} // Or map slugs if integrated
                price={item.price}
                condition={item.condition}
                thumbnailUrl={item.images?.[0] || ""}
                store={{
                  handle: item.store?.handle || "unknown",
                  name: item.store?.name || "Unknown Store",
                  isVerified: item.store?.user?.verificationStatus === "VERIFIED" || item.store?.user?.verificationStatus === "storeVerification", // matching logic override
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
