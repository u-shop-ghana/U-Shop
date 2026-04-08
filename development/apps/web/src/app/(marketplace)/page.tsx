import { Metadata } from 'next';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-server';
import { ListingCard } from '@/components/ui/ListingCard';
import { CATEGORIES } from '@ushop/shared';

export const metadata: Metadata = {
  title: 'U-Shop | Ghana\'s Campus Tech Marketplace',
  description: 'Buy and sell tech hardware safely across Ghanaian university campuses.',
};

export const dynamic = 'force-dynamic';

async function getRecentListings() {
  const res = await apiFetch('/api/v1/listings?limit=8&sort=newest', { next: { revalidate: 60 } });
  return res.success && res.data ? res.data : [];
}

export default async function HomePage() {
  const recentListings = await getRecentListings();

  return (
    <main className="min-h-screen bg-campus-dark pb-20">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-black pb-20 pt-32 lg:pb-32 lg:pt-48 border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-brand opacity-20 mix-blend-screen" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] bg-ushop-purple/30 blur-[120px] rounded-full" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tight leading-tight mb-6">
            Upgrade Your Tech.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-brand">On Campus.</span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 leading-relaxed font-medium">
            The safest way for Ghanaian students to buy and sell laptops, phones, and hardware. Protected by Escrow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
            <Link 
               href="/search" 
               className="px-8 py-4 bg-white text-black font-extrabold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-xl shadow-white/10"
            >
              Browse Hardware
            </Link>
            <Link 
              href="/dashboard/store/create"
              className="px-8 py-4 bg-transparent border-2 border-white/20 text-white font-extrabold rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CATEGORIES.slice(0, 5).map((cat) => (
            <Link key={cat.slug} href={`/categories/${cat.slug}`}>
              <div className="flex flex-col items-center justify-center p-6 bg-campus-form-bg border border-white/5 rounded-2xl hover:bg-white/5 hover:-translate-y-1 hover:border-ushop-purple/50 transition-all group backdrop-blur-xl shadow-xl">
                 <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.iconUrl}</span>
                 <span className="font-bold text-gray-300 group-hover:text-white text-center text-sm">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
           <div>
             <h2 className="text-3xl font-black text-white mb-2">Fresh on Campus</h2>
             <p className="text-gray-400 font-medium">The latest hardware dropped by students today.</p>
           </div>
           <Link href="/search" className="hidden sm:flex items-center text-ushop-purple font-bold hover:text-white transition-colors">
              View All <span className="material-symbols-outlined ml-1">arrow_forward</span>
           </Link>
        </div>

        {recentListings.length === 0 ? (
          <div className="w-full p-12 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-3xl">
             <span className="material-symbols-outlined text-4xl text-gray-500 mb-4">inventory_2</span>
             <p className="text-gray-400 font-medium">No fresh items right now. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentListings.map((item: {
              id: string; title: string; slug?: string; price: number; condition: string; images?: string[]; store: { name: string; handle: string; isVerified: boolean };
            }) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                slug={item.slug || ""}
                price={item.price}
                condition={item.condition}
                thumbnailUrl={item.images?.[0] || ''}
                store={item.store}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/5">
              <div className="w-12 h-12 bg-ushop-purple/20 text-ushop-purple rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Student Verified</h3>
              <p className="text-gray-400 leading-relaxed">Sellers are verified via institutional student IDs, keeping scammers off campus.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-gradient-to-b from-status-success/10 to-transparent border border-status-success/10">
              <div className="w-12 h-12 bg-status-success/20 text-status-success rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">lock</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Escrow Protected</h3>
              <p className="text-gray-400 leading-relaxed">Your money is held in escrow until you verify the item works as described.</p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/5">
              <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Campus Meetups</h3>
              <p className="text-gray-400 leading-relaxed">Filter sellers by your university for safe, free, and immediate local meetups.</p>
            </div>
         </div>
      </section>
    </main>
  );
}
