import { Metadata } from "next";
import { apiFetch } from "@/lib/api-server";
import { ListingCard } from "@/components/ui/ListingCard";
import { CATEGORIES } from "@ushop/shared";
import SearchSidebar from "../../search/SearchSidebar";
import { notFound } from "next/navigation";
import Link from "next/link";

interface UniversityOption {
  id: string;
  name: string;
  shortName: string;
  slug: string;
}

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
  // Try fetching the university to get real name
  const res = await apiFetch(`/api/v1/universities`);
  const unis: UniversityOption[] = res.success ? res.data : [];
  const university = unis.find((u) => 
    (u.shortName?.toLowerCase() === resolvedParams.slug.toLowerCase()) || 
    (u.slug === resolvedParams.slug)
  );
  
  if (!university) return { title: "Campus Not Found | U-Shop" };
  
  return {
    title: `${university.shortName} Deals | U-Shop`,
    description: `Shop the best hardware deals safely on ${university.name} campus.`,
  };
}

export const dynamic = "force-dynamic";

export default async function UniversityDealsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const getUniRes = await apiFetch(`/api/v1/universities`);
  const unis: UniversityOption[] = getUniRes.success ? (getUniRes.data || []) : [];
  const university = unis.find((u) => 
    (u.shortName?.toLowerCase() === resolvedParams.slug.toLowerCase()) || 
    (u.slug === resolvedParams.slug)
  );

  if (!university) {
    notFound();
  }

  const shortNameValue = university.shortName.toLowerCase();

  const q = resolvedSearchParams.q as string | undefined;
  const category = resolvedSearchParams.category as string | undefined;
  const minPrice = resolvedSearchParams.minPrice as string | undefined;
  const maxPrice = resolvedSearchParams.maxPrice as string | undefined;
  const condition = resolvedSearchParams.condition as string | undefined;
  const sort = resolvedSearchParams.sort as string | undefined;

  const queryObj = new URLSearchParams();
  queryObj.append("buyerUniversity", shortNameValue); // Locked
  if (q) queryObj.append("q", q);
  if (category) queryObj.append("category", category);
  if (minPrice) queryObj.append("minPrice", minPrice);
  if (maxPrice) queryObj.append("maxPrice", maxPrice);
  if (condition) queryObj.append("condition", condition);
  if (sort) queryObj.append("sort", sort);

  const res = await apiFetch(`/api/v1/listings?${queryObj.toString()}`);
  const listings: ListingOption[] = res.success ? (res.data || []) : [];

  return (
    <main className="min-h-screen bg-campus-dark flex flex-col md:flex-row pb-20 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <Link 
          href="/universities"
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <span className="material-symbols-outlined mr-2 text-sm">arrow_back</span>
          All Campuses
        </Link>
        <SearchSidebar
          currentParams={{
            q,
            category,
            minPrice,
            maxPrice,
            condition,
            buyerUniversity: shortNameValue, // locks it visually
            sort,
          }}
          categories={CATEGORIES.map(c => ({ name: c.name, slug: c.slug }))}
          universities={unis.map(u => ({ value: u.shortName.toLowerCase(), label: u.name }))}
        />
      </aside>

      {/* Main Results Board */}
      <section className="flex-grow">
        <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
          <div>
              <div className="flex items-center gap-3">
                 <div className="bg-white/10 text-white rounded-lg px-2 py-1 flex items-center mb-1 border border-white/20">
                     <span className="material-symbols-outlined text-[1rem] mr-1">location_on</span>
                     <span className="text-sm font-bold tracking-wider">{university.shortName}</span>
                 </div>
              </div>
            <h1 className="text-3xl font-black text-white">
               {university.name} Deals
            </h1>
            <p className="text-gray-400 mt-1 font-medium">
              {listings.length} item{listings.length !== 1 ? "s" : ""} verified from your campus peers.
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-3xl">
            <span className="material-symbols-outlined text-6xl text-white/30 mb-4">school</span>
            <h3 className="text-2xl font-bold text-white mb-2">No hardware here yet</h3>
            <p className="text-gray-400 font-medium text-center max-w-md">
               Be the first student to start selling hardware securely at {university.shortName}!
            </p>
            <Link 
              href="/dashboard/store/create"
              className="mt-6 px-6 py-3 bg-ushop-purple text-white font-bold rounded-xl hover:bg-ushop-purple/80 transition-colors"
            >
               Open Store Here
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
