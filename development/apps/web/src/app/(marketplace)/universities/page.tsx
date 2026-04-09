import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiPublicFetch } from "@/lib/api-public";

interface UniversityOption {
  id: string;
  name: string;
  shortName: string;
  slug: string;
}

// Map university short names to local campus images
const UNI_IMAGES: Record<string, string> = {
  ug: "/assets/images/universities/legon.jpg",
  knust: "/assets/images/universities/knust.jpg",
  ucc: "/assets/images/universities/ucc.jpg",
  gctu: "/assets/images/universities/gctu.jpg",
  umat: "/assets/images/universities/umat.jpeg",
};

// Map university short names to campus location strings (Figma reference)
const UNI_LOCATIONS: Record<string, string> = {
  ug: "Legon Main Campus",
  knust: "Kumasi Main Campus",
  ucc: "Cape Coast Campus",
  gctu: "Tesano, Accra",
  umat: "Tarkwa Campus",
};

export const metadata: Metadata = {
  title: "Partner Universities | U-Shop",
  description: "Explore campus-specific marketplaces across Ghana. Get delivery directly to your hostel or hall.",
};

export const revalidate = 15; // Enable Incremental Static Regeneration caching

export default async function UniversitiesPage() {
  const res = await apiPublicFetch("/api/v1/universities");
  const universities: UniversityOption[] = res.success ? (res.data || []) : [];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner — matching Figma: dark image overlay with title + search */}
      <section className="relative bg-[#0f172a] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/hero/universities directory.png"
            alt="University campus"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0f172a]/90" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm mb-6">
            <span className="material-symbols-outlined text-base">arrow_back</span> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Partner Universities
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Explore campus-specific marketplaces across Ghana. Get delivery directly to your hostel or hall.
          </p>
          {/* Search bar matching Figma */}
          <form action="/search" method="GET" className="flex max-w-xl mx-auto">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                name="q"
                id="university-search"
                placeholder="Search for your university or campus store..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-l-xl text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-ushop-purple text-white font-bold rounded-r-xl hover:bg-ushop-purple/90 transition-colors text-sm"
            >
              Find Campus
            </button>
          </form>
        </div>
      </section>

      {/* Info Bar — campus count + sort */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="material-symbols-outlined text-base text-ushop-pink">location_on</span>
          Showing marketplaces across Ghana
        </div>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2">
            Sort: Default
            <span className="material-symbols-outlined text-base">expand_more</span>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-gray-800">
            <span className="material-symbols-outlined text-base text-ushop-purple">school</span>
            {universities.length}+ <span className="text-xs font-normal text-gray-500 uppercase tracking-wider">Campuses</span>
          </div>
        </div>
      </div>

      {/* University Cards Grid — matching Figma: 3-col, image + location + CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {universities.length === 0 ? (
          <div className="w-full p-16 text-center border border-gray-200 bg-gray-50 rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">school</span>
            <p className="text-gray-500 text-lg">No active campuses found at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni: UniversityOption) => (
              <Link key={uni.id} href={`/universities/${uni.shortName.toLowerCase()}`}>
                <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                  {/* Campus image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      fill
                      src={UNI_IMAGES[uni.shortName.toLowerCase()] || "/assets/images/universities/legon.jpg"}
                      alt={uni.name}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* School icon badge */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                      <span className="material-symbols-outlined text-ushop-purple text-xl">school</span>
                    </div>
                    {/* University name overlay */}
                    <h3 className="absolute bottom-4 left-14 text-white font-bold text-xl">
                      {uni.name}
                    </h3>
                  </div>
                  {/* Card body */}
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                      <span className="material-symbols-outlined text-sm text-ushop-pink">location_on</span>
                      {UNI_LOCATIONS[uni.shortName.toLowerCase()] || `${uni.shortName} Campus`}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-ushop-purple uppercase tracking-wide group-hover:underline">
                        View Marketplace
                      </span>
                      <span className="material-symbols-outlined text-ushop-purple opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section — "Don't see your university?" matching Figma */}
      <section className="bg-ushop-purple mx-4 sm:mx-8 lg:mx-auto max-w-7xl rounded-3xl mb-16">
        <div className="px-8 py-14 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Don&apos;t see your university?
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            We&apos;re rapidly expanding to more campuses across Ghana. Partner with us to bring U-Shop to your university today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="bg-white text-ushop-purple font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors">
              Suggest University
            </Link>
            <Link href="/contact" className="bg-white/10 border border-white/30 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/20 transition-colors">
              Become an Ambassador
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
