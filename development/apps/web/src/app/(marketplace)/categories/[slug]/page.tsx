import { Metadata } from "next";
import { apiFetch } from "@/lib/api-server";
import { ListingCard } from "@/components/ui/ListingCard";
import { CATEGORIES } from "@ushop/shared";
import SearchSidebar from "../../search/SearchSidebar";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const category = CATEGORIES.find(c => c.slug === resolvedParams.slug);
  if (!category) return { title: "Category Not Found | U-Shop" };
  
  return {
    title: `${category.name} | U-Shop`,
    description: `Shop the best student deals on ${category.name}.`,
  };
}

export const dynamic = "force-dynamic";

export default async function CategorySlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const category = CATEGORIES.find(c => c.slug === resolvedParams.slug);
  if (!category) {
    notFound();
  }

  const q = resolvedSearchParams.q as string | undefined;
  const minPrice = resolvedSearchParams.minPrice as string | undefined;
  const maxPrice = resolvedSearchParams.maxPrice as string | undefined;
  const condition = resolvedSearchParams.condition as string | undefined;
  const buyerUniversity = resolvedSearchParams.buyerUniversity as string | undefined;
  const sort = resolvedSearchParams.sort as string | undefined;

  const queryObj = new URLSearchParams();
  queryObj.append("categorySlug", resolvedParams.slug); // Using specific override
  if (q) queryObj.append("q", q);
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
        <Link 
          href="/categories"
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <span className="material-symbols-outlined mr-2 text-sm">arrow_back</span>
          All Categories
        </Link>
        <SearchSidebar
          currentParams={{
            q,
            category: resolvedParams.slug,
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
          <div className="flex items-center gap-4">
            {category.iconUrl && (
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative">
                {category.iconUrl.startsWith('/') ? (
                  <Image src={category.iconUrl} alt={category.name} fill className="object-cover" />
                ) : (
                   <span className="text-3xl">{category.iconUrl}</span>
                )}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-white">
                {category.name}
              </h1>
              <p className="text-gray-400 mt-1 font-medium">
                {listings.length} item{listings.length !== 1 ? "s" : ""} found
              </p>
            </div>
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
            <h3 className="text-2xl font-bold text-white mb-2">Nothing available yet</h3>
            <p className="text-gray-400 font-medium text-center max-w-md">
              Check back later or adjust your filters. Be the first to start selling in this category!
            </p>
            <Link 
              href="/dashboard/store/create"
              className="mt-6 px-6 py-3 bg-ushop-purple text-white font-bold rounded-xl hover:bg-ushop-purple/80 transition-colors"
            >
              Start Selling
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => (
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
                  isVerified: item.store?.user?.verificationStatus === "VERIFIED" || item.store?.user?.verificationStatus === "storeVerification",
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
