import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api-server';
import { ListingCard } from '@/components/ui/ListingCard';
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

export const dynamic = 'force-dynamic';

async function getHomePageData() {
  const [unisRes, storesRes, featuredRes, trendingRes] = await Promise.all([
    apiFetch('/api/v1/universities'),
    apiFetch('/api/v1/stores?limit=4'),
    apiFetch('/api/v1/listings?limit=4'), // Simulated featured
    apiFetch('/api/v1/listings?sort=newest&limit=4'), // Simulated trending
  ]);

  return {
    universities: unisRes.success ? (unisRes.data || []).slice(0, 4) : [],
    stores: storesRes.success ? (storesRes.data || []).slice(0, 4) : [],
    featured: featuredRes.success ? (featuredRes.data || []).slice(0, 4) : [],
    trending: trendingRes.success ? (trendingRes.data || []).slice(0, 4) : [],
  };
}

// Map Figma's static category imagery dynamically to the Top 4 Array
const CATEGORY_IMAGES: Record<string, string> = {
  laptops: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8o9UFBvF8YrrOwwhPsIraLinv3q4JYdd7y_qk2nVeWyzGU41KjszX-UgxJbqQhUirLspmW1EaDL1xU1h3Mi1a9O7jjAum8nLiHLnd_c47dDnkaN3MD7krRjkJCuYtaW1NEcEfqK3SGRAa7iV9_uJg-vL8sZhBelZPJNLu675ZKEuGyJaAJHMk7EFfGOq9EkJhMDWNKEY7dDZRZTR5ni3tEtcw2QY6FKqsrUBSvLAslzCqLMiArmrACZjfOkF6OKRnNWq-uDAjBTip",
  phones: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwVCnYU-hEQDIPkZk1hJ0HJctkL47Q_iKgGuUJeQFPie_jGOj-bFnR46msq-SEDxB6_7Xz1vZg3MrIuxl6XIcRr4exntBZ7r-ygrUFyVWBxcNAYCta1kB6QRNT8bJFzS9tinLBSyJiRv2ZpDICsTwOazc7AfN3RlJ06tXJdHiQPz1p_f3foyCyf3IECyXGOTPYjZ2BEldvF2LBFJGAOfJ-g_LoW8OtIXzYOx7uHDLDkwKSNYGCjPujYZWHw-EWGljS8rWshYZffpUS",
  accessories: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-3EQxB_ussuVVi18YDyweMvv_gHmw1dVMWAOmN23K_x7I2sGapO_FuQoJqoUVhIiGf3Jgdmw1-kyfAlycAZTytrrZtGcTKRkMXnTg98FgxzMMX_iyNOi0M7gY95i1xOolwt7hhyDRibmlKgchbRpiiznVMQGB5vGSFJ_-r-6yb45sJrxNJz9utH5cjRavpj_YpZjgBzxgzNm2IX71HrDpE8qOkMXJT0jZDpJ_FcPw7CmtoU1ZbKBzeLkWauzQ0Fo_GHWAJWUJ2sM7",
  tablets: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPTL0TwEeInxlRVwk4QWiE3X-qeLZuURu5eJwL2HHcl4De78CZwnvtUll-mok9dRCV3oJvJmNcdsREhUggLmawgxz7kti31v3ST3N2wQzBYT4fesbD63st8ukG-xApKpwDLSFP9hIVAMkCVGsyEDl6BSsDR3_IqxQ7MEmGMDTH8ONKvI6av7zJQIA3c0Wi0o7ruCADBZu5jXylp6xawq_zGGwJ98yXjzmrxR8i6pdGiP_R3SfTmAxW-ZgiinwYSWlProoyRWwKi9FY"
};

const UNI_IMAGES: Record<string, string> = {
  "ug": "https://lh3.googleusercontent.com/aida-public/AB6AXuB26A0x9-Y5Xlq3hV0E7u_9X2s1k5F5g2p5R8z8V8x6A1x8S2-Z0_9f6L5e_1r6k5D5X1x8R2-Z0_9f6L5e_1r6k5D",
  "knust": "https://lh3.googleusercontent.com/aida-public/AB6AXuC9-X1v9-Z5Xlq3hV0E7u_9X2s1k5F5g2p5R8z8V8x6A1x8S2-Z0_9f6L5e_1r6k5D5X1x8R2-Z0_9f6L5e_1r6k5D",
  "ucc": "https://lh3.googleusercontent.com/aida-public/AB6AXuD2-Z1v9-Z5Xlq3hV0E7u_9X2s1k5F5g2p5R8z8V8x6A1x8S2-Z0_9f6L5e_1r6k5D5X1x8R2-Z0_9f6L5e_1r6k5D",
  "ashesi": "https://lh3.googleusercontent.com/aida-public/AB6AXuE2-Z1v9-Z5Xlq3hV0E7u_9X2s1k5F5g2p5R8z8V8x6A1x8S2-Z0_9f6L5e_1r6k5D5X1x8R2-Z0_9f6L5e_1r6k5D"
};

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <main className="bg-background text-on-background flex flex-col min-h-screen">
      {/* Escrow Banner */}
      <div id="escrow-banner" className="bg-emerald-950 text-emerald-400 py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium">
            <span className="flex items-center gap-2">
              <span className="text-sm">🔒</span>
              Every purchase protected by escrow — pay safely, get your money back if anything&apos;s wrong.
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-ushop-purple to-[#3b0a63] text-white overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
          <svg className="w-full h-full" fill="none" viewBox="0 0 640 640">
            <path d="M320 0C143.269 0 0 143.269 0 320C0 496.731 143.269 640 320 640C496.731 640 640 496.731 640 320C640 143.269 496.731 0 320 0Z" fill="#D41295"></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-ushop-pink px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                CAMPUS TECH HUB
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
                Power Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-ushop-pink to-[#1275e2]">Academic Excellence</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-lg">
                The ultimate tech marketplace for Ghanaian students. Genuine gear, campus delivery, and student-first pricing.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/search" className="bg-white text-ushop-purple px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all inline-flex items-center gap-2 group">
                  Shop Deals <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <Link href="/dashboard/store/create" className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-ushop-purple transition-all">
                  Sell Now
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <Image fill priority src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa-2zJ-fOX1H7fpRqYO2AEe6o7UIGHNPdY01Wm9dTD6SAEpLmf2yS0DoKQNrAWiUHNcRtsUPZDVhSQezzhtU0n-GAIzgkUegLViuqrL84FAgfkkeGar77RnEXXvtcbg3eT5Gcrv8drKZB_F59u4XSqr1lMRe-IZBzdVpJ3584FrYVvsd6y0bdKNuazrEf3U-7cSFLicrY6Ckt_gEAgnJ-2d3Cu86QdDkXX34I-DMIsMzeUpZ9XAlykn4q_B-QySaeavjWPsH3nLt88" alt="Tech Essentials" className="object-cover" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-6">
                   <p className="text-gray-600 text-sm">Starting from</p>
                   <p className="text-ushop-purple text-2xl font-bold">GH₵ 1,500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b py-10">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center group">
               <div className="w-12 h-12 bg-purple-50 flex items-center justify-center rounded-full text-ushop-purple mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">verified_user</span>
               </div>
               <h4 className="font-bold text-gray-900 text-sm">Secure Payment</h4>
               <p className="text-xs text-gray-500 mt-1">Momo & Card protection</p>
            </div>
            <div className="flex flex-col items-center text-center group">
               <div className="w-12 h-12 bg-purple-50 flex items-center justify-center rounded-full text-ushop-purple mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">verified</span>
               </div>
               <h4 className="font-bold text-gray-900 text-sm">Verified Sellers</h4>
               <p className="text-xs text-gray-500 mt-1">100% Genuine tech gear</p>
            </div>
            <div className="flex flex-col items-center text-center group">
               <div className="w-12 h-12 bg-purple-50 flex items-center justify-center rounded-full text-ushop-purple mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">local_shipping</span>
               </div>
               <h4 className="font-bold text-gray-900 text-sm">Campus Delivery</h4>
               <p className="text-xs text-gray-500 mt-1">Direct to your hostel</p>
            </div>
            <div className="flex flex-col items-center text-center group">
               <div className="w-12 h-12 bg-purple-50 flex items-center justify-center rounded-full text-ushop-purple mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
               </div>
               <h4 className="font-bold text-gray-900 text-sm">Local Support</h4>
               <p className="text-xs text-gray-500 mt-1">Call or WhatsApp 24/7</p>
            </div>
         </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-16 bg-background">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h2 className="text-3xl font-bold text-gray-900">Browse Categories</h2>
                  <p className="text-gray-500">Everything a student needs to succeed</p>
               </div>
               <Link href="/categories" className="text-ushop-purple font-semibold flex items-center gap-1 hover:underline group">
                  View All <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {CATEGORIES.slice(0, 4).map((category) => (
                   <Link key={category.slug} href={`/categories/${category.slug}`}>
                      <div className="group relative overflow-hidden aspect-square rounded-lg cursor-pointer">
                         <Image fill src={CATEGORY_IMAGES[category.slug] || '/assets/images/defaults/placeholder.webp'} alt={category.name} className="object-cover group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                         <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="font-bold text-lg">{category.name}</h3>
                         </div>
                      </div>
                   </Link>
                ))}
            </div>
         </div>
      </section>

      {/* Browse Universities */}
      <section className="py-16 bg-white border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h2 className="text-3xl font-bold text-gray-900">Browse Universities</h2>
                  <p className="text-gray-500">Find tech deals specifically for your campus</p>
               </div>
               <Link href="/universities" className="text-ushop-purple font-semibold flex items-center gap-1 hover:underline group">
                  All Universities <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {data.universities.map((uni: UniversityOption) => (
                  <Link key={uni.id} href={`/universities/${uni.shortName.toLowerCase()}`}>
                     <div className="group relative overflow-hidden rounded-xl cursor-pointer h-48 shadow-sm">
                        <Image fill src={UNI_IMAGES[uni.shortName.toLowerCase()] || '/assets/images/defaults/placeholder.webp'} alt={uni.shortName} className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ushop-purple/90 via-ushop-purple/40 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                           <h3 className="font-bold text-lg">{uni.name}</h3>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-white/80">{uni.shortName}</span>
                              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                              <span className="text-xs font-bold text-ushop-pink">Available</span>
                           </div>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* Browse Stores */}
      <section className="py-16 bg-[#f8fafc] border-y border-slate-100">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-end mb-10">
               <div>
                  <h2 className="text-3xl font-bold text-gray-900">Browse Stores</h2>
                  <p className="text-gray-600">Trusted local sellers from your university community</p>
               </div>
               <Link href="/stores" className="text-ushop-purple font-semibold flex items-center gap-1 hover:underline group">
                  View All Stores <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {data.stores.map((store: StoreOption) => (
                  <div key={store.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all group flex flex-col justify-between">
                     <div>
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-purple-50 group-hover:border-ushop-purple transition-colors bg-gray-100 flex items-center justify-center">
                              {store.logoUrl ? (
                                 <Image fill src={store.logoUrl} alt={store.name} className="object-cover" />
                              ) : (
                                 <span className="font-bold text-ushop-purple text-xl">{store.name.substring(0, 2).toUpperCase()}</span>
                              )}
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 group-hover:text-ushop-purple transition-colors">{store.name}</h3>
                              {store.user?.verificationStatus === "VERIFIED" && (
                                 <div className="flex items-center gap-1 text-ushop-pink">
                                    <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
                                    <span className="text-xs font-bold">Verified</span>
                                 </div>
                              )}
                           </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                           {store.user?.universityName && (
                              <span className="bg-purple-50 text-ushop-purple text-[10px] font-bold px-2 py-1 rounded uppercase">{store.user.universityName}</span>
                           )}
                           <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded">@{store.handle}</span>
                        </div>
                     </div>
                     <Link href={`/store/${store.handle}`} className="block w-full py-2 text-center border-2 border-ushop-purple text-ushop-purple font-bold rounded-lg hover:bg-ushop-purple hover:text-white transition-all text-sm mt-4">
                        Visit Store
                     </Link>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Featured Deals */}
      <section className="py-16 bg-white">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-end mb-10">
               <div>
                  <h2 className="text-3xl font-bold text-gray-900">Featured Deals</h2>
                  <p className="text-gray-600">Top picks for students this semester</p>
               </div>
               <Link href="/search" className="text-ushop-purple font-semibold flex items-center gap-1 hover:underline">
                  See all <span className="material-symbols-outlined text-sm">arrow_forward</span>
               </Link>
            </div>
            {data.featured.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">No active listings available.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {data.featured.map((item: ListingOption) => (
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
            <div className="flex items-center gap-3 mb-10">
               <span className="material-symbols-outlined text-white text-3xl">local_offer</span>
               <h2 className="text-3xl font-bold text-white">Student Deals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="bg-gradient-to-br from-ushop-pink to-[#8c0a62] p-8 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="relative z-10">
                     <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Exclusive</span>
                     <h3 className="text-2xl font-black text-white mt-2 leading-tight">University of Ghana Tech Fest</h3>
                     <p className="text-white/90 mt-4 font-medium">Up to 40% OFF on all accessories for Legon students.</p>
                     <Link href="/student-deals" className="mt-6 inline-block bg-white text-ushop-pink px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform">Get Code</Link>
                  </div>
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform">school</span>
               </div>
               <div className="bg-gradient-to-br from-[#1275e2] to-[#0a4ea0] p-8 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="relative z-10">
                     <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Limited Time</span>
                     <h3 className="text-2xl font-black text-white mt-2 leading-tight">KNUST Hostel Delivery Promo</h3>
                     <p className="text-white/90 mt-4 font-medium">FREE delivery to all KNUST hostels this week only!</p>
                     <Link href="/student-deals" className="mt-6 inline-block bg-white text-[#1275e2] px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform">Claim Now</Link>
                  </div>
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform">local_shipping</span>
               </div>
               <div className="bg-gradient-to-br from-[#00c853] to-[#008c3a] p-8 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="relative z-10">
                     <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Flash Sale</span>
                     <h3 className="text-2xl font-black text-white mt-2 leading-tight">UCC Freshers Laptop Bundle</h3>
                     <p className="text-white/90 mt-4 font-medium">Laptops + Wireless Mouse + Bag. Save GH₵ 800.</p>
                     <Link href="/student-deals" className="mt-6 inline-block bg-white text-[#00c853] px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform">Shop Sale</Link>
                  </div>
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform">laptop_mac</span>
               </div>
            </div>
         </div>
      </section>

      {/* Trending Now */}
      <section className="py-16 bg-[#f8fafc]">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-end mb-10">
               <div>
                  <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
                  <p className="text-gray-600">What students are buying this week</p>
               </div>
               <Link href="/search" className="text-ushop-purple font-semibold flex items-center gap-1 hover:underline">
                  View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
               </Link>
            </div>
            {data.trending.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">No trending listings available.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {data.trending.map((item: ListingOption) => (
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
