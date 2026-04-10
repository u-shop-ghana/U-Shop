"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface UniversityOption {
  id: string;
  name: string;
  shortName: string;
  slug: string;
}

interface ClientUniversityListProps {
  universities: UniversityOption[];
  images: Record<string, string>;
  locations: Record<string, string>;
}

export function ClientUniversityList({ universities, images, locations }: ClientUniversityListProps) {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"default" | "a-z" | "z-a">("default");

  // Filter
  const filtered = universities.filter((uni) => {
    const term = query.toLowerCase();
    return (
      uni.name.toLowerCase().includes(term) ||
      uni.shortName.toLowerCase().includes(term) ||
      (locations[uni.shortName.toLowerCase()] || "").toLowerCase().includes(term)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "a-z") return a.name.localeCompare(b.name);
    if (sortOrder === "z-a") return b.name.localeCompare(a.name);
    return 0; // retain initial API order
  });

  return (
    <div className="w-full">
      {/* Hero Header integrated inside */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
        <Link href="/" className="inline-flex flex-col sm:flex-row items-center sm:self-start justify-center sm:justify-start gap-1 text-white/70 hover:text-white transition-colors text-sm mb-6 mr-full md:mr-auto sm:-ml-[35vw] xl:-ml-[15vw] md:absolute md:left-0">
          <div className="flex items-center gap-1"><span className="material-symbols-outlined text-base">arrow_back</span> Back to Home</div>
        </Link>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
          Partner Universities
        </h1>
        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
          Explore campus-specific marketplaces across Ghana. Get delivery directly to your hostel or hall.
        </p>
        <div className="flex max-w-xl mx-auto relative">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for your university or campus store..."
              className="w-full pl-12 pr-4 py-3 md:py-4 bg-white rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm md:text-base shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white">
        {/* Info Bar — campus count + sort */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 w-full sm:w-auto overflow-hidden">
            <span className="material-symbols-outlined text-base text-ushop-pink flex-shrink-0">location_on</span>
            <span className="truncate">Showing marketplaces across Ghana</span>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative inline-block">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "default" | "a-z" | "z-a")}
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ushop-purple cursor-pointer transition-colors"
              >
                <option value="default">Sort: Default</option>
                <option value="a-z">Alphabetical (A-Z)</option>
                <option value="z-a">Alphabetical (Z-A)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <span className="material-symbols-outlined text-base">expand_more</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-gray-800 flex-shrink-0">
              <span className="material-symbols-outlined text-base text-ushop-purple">school</span>
              {sorted.length} <span className="text-xs font-normal text-gray-500 uppercase tracking-wider hidden sm:inline">Campuses</span>
            </div>
          </div>
        </div>

        {/* University Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {sorted.length === 0 ? (
            <div className="w-full p-10 md:p-16 text-center border border-gray-200 bg-gray-50 rounded-2xl">
              <span className="material-symbols-outlined text-5xl md:text-6xl text-gray-300 mb-4 block">school</span>
              <p className="text-gray-500 text-base md:text-lg">No active campuses match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sorted.map((uni) => (
                <Link key={uni.id} href={`/universities/${uni.shortName.toLowerCase()}`}>
                  <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col h-full">
                    {/* Campus image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        fill
                        src={images[uni.shortName.toLowerCase()] || "/assets/images/universities/legon.jpg"}
                        alt={uni.name}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {/* School icon badge */}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                        <span className="material-symbols-outlined text-ushop-purple text-lg md:text-xl">school</span>
                      </div>
                      {/* University name overlay */}
                      <h3 className="absolute bottom-4 left-14 right-2 text-white font-bold text-lg md:text-xl truncate">
                        {uni.name}
                      </h3>
                    </div>
                    {/* Card body */}
                    <div className="p-4 md:p-5 flex flex-col flex-grow justify-between">
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mb-4">
                        <span className="material-symbols-outlined text-sm text-ushop-pink flex-shrink-0">location_on</span>
                        <span className="truncate">{locations[uni.shortName.toLowerCase()] || `${uni.shortName} Campus`}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-bold text-ushop-purple uppercase tracking-wide group-hover:underline">
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
      </div>
    </div>
  );
}
