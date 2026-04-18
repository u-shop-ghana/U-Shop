import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { apiPublicFetch } from '@/lib/api-public';
import { ListingCard } from '@/components/ui/ListingCard';
import { HeroSlider } from '@/components/ui/HeroSlider';
import { StoreCard } from '@/components/ui/StoreCard';
import { CATEGORIES } from '@ushop/shared';

interface UniversityOption {
  id: string;
  name: string;
  shortName: string;
}

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

interface ListingOption {
  id: string;
  title: string;
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
  title: 'U-Shop | Tech for Ghanaian Students',
  description: 'The ultimate tech marketplace for Ghanaian students. Genuine gear, campus delivery, and student-first pricing.',
};

export const revalidate = 15; // Enable ISR (15s caching block) for instant TTFB Edge resolution

async function getHomePageData() {
  const [unisRes, storesRes, featuredRes, trendingRes] = await Promise.all([
    apiPublicFetch('/api/v1/universities'),
    apiPublicFetch('/api/v1/stores?limit=4'),
    apiPublicFetch('/api/v1/listings?limit=4'), // Simulated featured
    apiPublicFetch('/api/v1/listings?sort=newest&limit=4'), // Simulated trending
  ]);

  return {
    universities: unisRes.success ? (unisRes.data || []).slice(0, 4) : [],
    stores: storesRes.success ? (storesRes.data || []).slice(0, 4) : [],
    featured: featuredRes.success ? (featuredRes.data || []).slice(0, 4) : [],
    trending: trendingRes.success ? (trendingRes.data || []).slice(0, 4) : [],
  };
}

// Map category imagery to the local assets in /public/assets/images/categories/
const CATEGORY_IMAGES: Record<string, string> = {
  laptops: "/assets/images/categories/laptop.jpg",
  phones: "/assets/images/categories/phone.png",
  accessories: "/assets/images/categories/Accessories.png",
  tablets: "/assets/images/categories/Tablet.png",
  gaming: "/assets/images/categories/Gaming.png",
  storage: "/assets/images/categories/storage.png",
};

// Map university imagery to the local assets in /public/assets/images/universities/
const UNI_IMAGES: Record<string, string> = {
  "ug": "/assets/images/universities/legon.jpg",
  "knust": "/assets/images/universities/knust.jpg",
  "ucc": "/assets/images/universities/ucc.jpg",
  "gctu": "/assets/images/universities/gctu.jpg",
  "umat": "/assets/images/universities/umat.jpeg",
};

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <main className="bg-background text-on-background flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSlider />

      {/* Features Bar */}
      <section className="bg-white border-b py-10">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center group">
               <div className="w-12 h-12 bg-purple-50 flex items-center justify-center rounded-full text-ushop-purple mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">security</span>
               </div>
               <h2 className="font-bold text-gray-900 text-sm">Secure Payment</h2>
               <p className="text-xs text-gray-600 mt-1">Momo & Card protection</p>
            </div>
            <div className="flex flex-col items-center text-center group">
               <div className="w-12 h-12 bg-purple-50 flex items-center justify-center rounded-full text-ushop-purple mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">verified</span>
               </div>
               <h2 className="font-bold text-gray-900 text-sm">Verified Sellers</h2>
               <p className="text-xs text-gray-500 mt-1">100% Genuine tech gear</p>
            </div>
            <div className="flex flex-col items-center text-center group">
               <div className="w-12 h-12 bg-purple-50 flex items-center justify-center rounded-full text-ushop-purple mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">local_shipping</span>
               </div>
               <h2 className="font-bold text-gray-900 text-sm">Campus Delivery</h2>
               <p className="text-xs text-gray-500 mt-1">Direct to your hostel</p>
            </div>
            <div className="flex flex-col items-center text-center group">
               <div className="w-12 h-12 bg-purple-50 flex items-center justify-center rounded-full text-ushop-purple mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">support_agent</span>
               </div>
               <h2 className="font-bold text-gray-900 text-sm">Local Support</h2>
               <p className="text-xs text-gray-500 mt-1">Call or WhatsApp 24/7</p>
            </div>
         </div>
      </section>

      {/* Featured Categories Grid — matching Figma: white bg, overlay image cards */}
      <section className="py-16 bg-white">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 md:mb-8">
               <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Categories</h2>
                  <p className="text-sm md:text-base text-gray-500">Everything a student needs to succeed</p>
               </div>
               <Link href="/categories" className="text-sm md:text-base text-ushop-purple font-semibold flex items-center gap-1 hover:underline group">
                  View All <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {CATEGORIES.slice(0, 4).map((category) => (
                   <Link key={category.slug} href={`/categories/${category.slug}`}>
                      <div className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/5] shadow-md">
                         <Image fill src={CATEGORY_IMAGES[category.slug] || '/assets/images/categories/laptop.jpg'} alt={category.name} className="object-cover group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                         <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="font-bold text-lg">{category.name}</h3>
                            <p className="text-xs text-white/70 mt-0.5">Shop now →</p>
                         </div>
                      </div>
                   </Link>
                ))}
            </div>
         </div>
      </section>

      {/* Browse Universities — matching Figma: same image card grid as categories */}
      <section className="py-16 bg-[#f8fafc]">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 md:mb-8">
               <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Universities</h2>
                  <p className="text-sm md:text-base text-gray-500">Find tech deals specifically for your campus</p>
               </div>
               <Link href="/universities" className="text-sm md:text-base text-ushop-purple font-semibold flex items-center gap-1 hover:underline group">
                  All Universities <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </Link>
            </div>
            {data.universities.length === 0 ? (
               <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl shadow-sm">
                 <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">school</span>
                 <p className="font-medium">No universities listed yet.</p>
               </div>
            ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {data.universities.map((uni: UniversityOption) => (
                     <Link key={uni.id} href={`/universities/${uni.shortName.toLowerCase()}`}>
                        <div className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/5] shadow-md border border-slate-100">
                           <Image fill src={UNI_IMAGES[uni.shortName.toLowerCase()] || '/assets/images/universities/legon.jpg'} alt={uni.shortName} className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                           <div className="absolute bottom-4 left-4 right-4 text-white">
                              <h3 className="font-bold text-base md:text-lg leading-tight drop-shadow-md">{uni.name}</h3>
                              <p className="text-xs md:text-sm text-white/80 mt-1 uppercase tracking-wider font-semibold drop-shadow">{uni.shortName}</p>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
            )}
         </div>
      </section>

      {/* Browse Stores */}
      <section className="py-16 md:py-24 bg-[#f8fafc] border-y border-slate-100">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 md:mb-10">
               <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Stores</h2>
                  <p className="text-sm md:text-base text-gray-600">Trusted local sellers from your university community</p>
               </div>
               <Link href="/stores" className="text-sm md:text-base text-ushop-purple font-semibold flex items-center gap-1 hover:underline group">
                  View All Stores <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </Link>
            </div>
            {data.stores.length === 0 ? (
               <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl shadow-sm">
                 <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">storefront</span>
                 <p className="font-medium">No active stores available.</p>
               </div>
            ) : (
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {data.stores.map((store: StoreOption) => (
                      <StoreCard key={store.id} store={store} />
                  ))}
               </div>
            )}
         </div>
      </section>

      {/* Featured Deals */}
      <section className="py-16 bg-white">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 md:mb-10">
               <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Deals</h2>
                  <p className="text-sm md:text-base text-gray-600">Top picks for students this semester</p>
               </div>
               <Link href="/search" className="text-sm md:text-base text-ushop-purple font-semibold flex items-center gap-1 hover:underline">
                  See all <span className="material-symbols-outlined text-sm">arrow_forward</span>
               </Link>
            </div>
            {data.featured.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">No active listings available.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                   {data.featured.map((item: ListingOption) => (
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
                            name: item.store?.name || "Unknown",
                            isVerified: item.store?.user?.verificationStatus === "VERIFIED",
                          }}
                      />
                   ))}
                </div>
            )}
         </div>
      </section>

      {/* Student Deals Promo Section */}
      <section className="py-16 bg-ushop-purple">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 md:mb-10">
               <span className="material-symbols-outlined text-white text-2xl md:text-3xl">local_offer</span>
               <h2 className="text-2xl md:text-3xl font-bold text-white">Student Deals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
               <div className="bg-gradient-to-br from-ushop-pink to-[#8c0a62] p-5 sm:p-8 rounded-xl sm:rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                     <div>
                        <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-widest">Exclusive</span>
                        <h3 className="text-lg sm:text-2xl font-black text-white mt-1 sm:mt-2 leading-tight">University of Ghana Tech Fest</h3>
                        <p className="text-xs sm:text-base text-white/90 mt-2 sm:mt-4 font-medium line-clamp-2">Up to 40% OFF on all accessories for Legon students.</p>
                     </div>
                     <Link href="/student-deals" className="mt-4 sm:mt-6 inline-block bg-white text-ushop-pink px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-base hover:scale-105 transition-transform self-start">Get Code</Link>
                  </div>
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] sm:text-[120px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform">school</span>
               </div>
               <div className="bg-gradient-to-br from-[#0b5ed7] to-[#0a4ea0] p-5 sm:p-8 rounded-xl sm:rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                     <div>
                        <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-widest">Limited Time</span>
                        <h3 className="text-lg sm:text-2xl font-black text-white mt-1 sm:mt-2 leading-tight">KNUST Hostel Delivery Promo</h3>
                        <p className="text-xs sm:text-base text-white/90 mt-2 sm:mt-4 font-medium line-clamp-2">FREE delivery to all KNUST hostels this week only!</p>
                     </div>
                     <Link href="/student-deals" className="mt-4 sm:mt-6 inline-block bg-white text-[#0b5ed7] px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-base hover:scale-105 transition-transform self-start">Claim Now</Link>
                  </div>
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] sm:text-[120px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform" aria-hidden="true">local_shipping</span>
               </div>
               <div className="bg-gradient-to-br from-[#118134] to-[#008c3a] p-5 sm:p-8 rounded-xl sm:rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                     <div>
                        <span className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-widest">Flash Sale</span>
                        <h3 className="text-lg sm:text-2xl font-black text-white mt-1 sm:mt-2 leading-tight">UCC Freshers Laptop Bundle</h3>
                        <p className="text-xs sm:text-base text-white/90 mt-2 sm:mt-4 font-medium line-clamp-2">Laptops + Wireless Mouse + Bag. Save GH₵ 800.</p>
                     </div>
                     <Link href="/student-deals" className="mt-4 sm:mt-6 inline-block bg-white text-[#118134] px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-base hover:scale-105 transition-transform self-start">Shop Sale</Link>
                  </div>
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] sm:text-[120px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform" aria-hidden="true">laptop_mac</span>
               </div>
            </div>
         </div>
      </section>

      {/* Trending Now */}
      <section className="py-16 bg-[#f8fafc]">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 md:mb-10">
               <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Trending Now</h2>
                  <p className="text-sm md:text-base text-gray-600">What students are buying this week</p>
               </div>
               <Link href="/search" className="text-sm md:text-base text-ushop-purple font-semibold flex items-center gap-1 hover:underline">
                  View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
               </Link>
            </div>
            {data.trending.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">No trending listings available.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                   {data.trending.map((item: ListingOption) => (
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
                            name: item.store?.name || "Unknown",
                            isVerified: item.store?.user?.verificationStatus === "VERIFIED",
                          }}
                      />
                   ))}
                </div>
            )}
         </div>
      </section>
    </main>
  );
}
