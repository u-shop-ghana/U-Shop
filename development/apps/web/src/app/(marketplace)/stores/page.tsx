import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiPublicFetch } from "@/lib/api-public";
import { StoreFilters } from "@/components/ui/StoreFilters";

interface StoreOption {
  id: string;
  name: string;
  handle: string;
  logoUrl?: string;
  user?: {
    verificationStatus?: string;
    universityName?: string;
  };
}

export const metadata: Metadata = {
  title: "Campus Stores | U-Shop",
  description: "Shop directly from verified student entrepreneurs and local tech hubs at your favorite university campus.",
};

export const dynamic = "force-dynamic";

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page as string) : 1;
  const qStr = resolvedParams.q ? `&q=${encodeURIComponent(resolvedParams.q as string)}` : '';
  
  let sortStr = '';
  if (resolvedParams.sort && resolvedParams.sort !== 'default') {
    sortStr = `&sort=${encodeURIComponent(resolvedParams.sort as string)}`;
  } else if (resolvedParams.type && resolvedParams.type !== 'all') {
    sortStr = `&sort=${encodeURIComponent(resolvedParams.type as string)}`; // store backend treats student/elite as sort/filter
  }

  const res = await apiPublicFetch(`/api/v1/stores?page=${page}&limit=24${qStr}${sortStr}`);
  const stores: StoreOption[] = res.success ? (res.data || []) : [];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner — matching Figma: dark image overlay with title + search */}
      <section className="relative bg-[#0f172a] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/hero/all stores.png"
            alt="Campus stores"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]/90" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="md:absolute top-8 left-4 md:left-8 mb-6 md:mb-0 w-full md:w-auto text-left">
            <Link href="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm">
              <span className="material-symbols-outlined text-base">arrow_back</span> Back to Home
            </Link>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm text-white/90 font-medium">Verified Marketplace</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-2">
            Discover Ghana&apos;s
          </h1>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ushop-purple to-ushop-pink">Elite Campus Stores</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Shop directly from verified student entrepreneurs and local tech hubs at your favorite university campus.
          </p>
          {/* Search bar matching Figma */}
          <form action="/stores" method="GET" className="flex max-w-xl mx-auto">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                name="q"
                defaultValue={(resolvedParams.q as string) || ""}
                id="stores-search"
                placeholder="Search by store name, university, or gear..."
                className="w-full pl-12 pr-4 py-3 md:py-4 bg-white rounded-l-xl text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm md:text-base shadow-lg"
              />
            </div>
            <button
              type="submit"
              className="px-6 md:px-8 py-3 md:py-4 bg-ushop-purple text-white font-bold rounded-r-xl hover:bg-ushop-purple/90 transition-colors text-sm"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Section Title + Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 bg-ushop-purple rounded-full" />
              <h2 className="text-2xl font-black text-gray-900">Verified Stores</h2>
            </div>
            <p className="text-gray-500 text-sm ml-3">
              Find the perfect gadget from our curated list of student-run and campus-based tech stores.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-hidden">
            <StoreFilters />
          </div>
        </div>
      </div>

      {/* Store Cards Grid — matching Figma: 4-col cards with ratings and badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {stores.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">storefront</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No stores active right now</h3>
            <p className="text-gray-500">Check back later or be the first to open a store!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {stores.map((store: StoreOption) => (
              <Link key={store.id} href={`/store/${store.handle}`}>
                <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col">
                  {/* Store header image area — uses logo or campus placeholder */}
                  <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                    {store.logoUrl ? (
                      <Image src={store.logoUrl} alt={store.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300">storefront</span>
                      </div>
                    )}
                    {/* Storefront icon badge */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                      <span className="material-symbols-outlined text-ushop-purple text-lg">storefront</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-ushop-purple transition-colors">{store.name}</h3>
                      {store.user?.verificationStatus === "VERIFIED" && (
                        <span className="material-symbols-outlined text-sm text-green-500" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">@{store.handle}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                      {store.user?.universityName && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded">
                          <span className="text-gray-400 text-[8px]">●</span> University
                          <span className="text-gray-800 ml-0.5">{store.user.universityName}</span>
                        </span>
                      )}
                    </div>

                    {/* Browse Store CTA */}
                    <button className="w-full py-2.5 bg-ushop-purple text-white text-sm font-bold rounded-xl group-hover:bg-ushop-purple/90 transition-colors flex items-center justify-center gap-1">
                      Browse Store <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>


    </main>
  );
}
