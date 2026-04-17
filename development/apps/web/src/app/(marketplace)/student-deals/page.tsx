import { Metadata } from 'next';
import Link from 'next/link';
import { apiPublicFetch } from '@/lib/api-public';
import { ListingCard } from '@/components/ui/ListingCard';

interface ListingItem {
  id: string;
  title: string;
  slug?: string;
  price: number;
  condition: string;
  stock?: number;
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
  title: 'Student Deals | U-Shop',
  description: 'Exclusive student discounts and promotional deals on U-Shop.',
};

export const revalidate = 60; // 1-minute caching for deal rotation

async function getDealsData() {
  // We'll fetch listings that might be flagged as student deals.
  // For now, sorting by newest and applying limit=20. In the future, a ?hasDeal=true flag could be created.
  const res = await apiPublicFetch('/api/v1/listings?sort=popular&limit=20');
  
  if (!res.ok || !res.success) {
    return [];
  }
  return res.data || [];
}

export default async function StudentDealsPage() {
  const listings = await getDealsData();

  return (
    <main className="bg-background min-h-screen pb-20">
      {/* Hero Header */}
      <section className="bg-ushop-purple py-16 md:py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-mesh opacity-40"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Exclusive Student Deals
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Get your tech gear sorted with massive campus discounts. Validate your student status at checkout for up to 40% off.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-8 border-b pb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-ushop-magenta">local_offer</span>
              Live Promos
            </h2>
            <p className="text-sm text-gray-500 mt-1">Available strictly for verified campus students</p>
          </div>
        </div>

        {listings.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border shadow-sm flex flex-col items-center">
             <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory_2</span>
             <h3 className="text-xl font-bold text-gray-900">No deals right now</h3>
             <p className="text-gray-500 mt-2 max-w-md">Our sellers are busy preparing the next batch of student exclusives. Check back soon!</p>
             <Link href="/search" className="mt-6 px-6 py-2 bg-ushop-purple text-white font-bold rounded-lg hover:bg-[#420c6b] transition-colors">
               Browse All Products
             </Link>
           </div>
        ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
             {listings.map((item: ListingItem) => (
                <ListingCard
                   key={item.id}
                   id={item.id}
                   title={item.title}
                   slug={item.slug || item.id}
                   price={Number(item.price)}
                   originalPrice={item.price * 1.2} // Dummy original price to show discount strike-through
                   condition={item.condition}
                   stock={item.stock}
                   thumbnailUrl={item.images?.[0] || ""}
                   dealLabel="STUDENT EXCLUSIVE"
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
    </main>
  );
}
