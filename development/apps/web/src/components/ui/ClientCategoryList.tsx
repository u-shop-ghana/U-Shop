"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "./Breadcrumbs";

interface Category {
  name: string;
  slug: string;
  iconUrl?: string | null;
  count?: number;
}

interface ClientCategoryListProps {
  categories: readonly Category[];
  images: Record<string, string>;
  descriptions: Record<string, string>;
  searchQuery?: string;
}

export function ClientCategoryList({ categories, images, descriptions, searchQuery = "" }: ClientCategoryListProps) {
  const [query, setQuery] = useState(searchQuery);
  const [sortOrder, setSortOrder] = useState<"default" | "a-z" | "z-a">("default");

  // Filter logic
  const filtered = categories.filter((cat) => {
    const term = query.toLowerCase();
    return (
      cat.name.toLowerCase().includes(term) ||
      (descriptions[cat.slug] || "").toLowerCase().includes(term)
    );
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "a-z") return a.name.localeCompare(b.name);
    if (sortOrder === "z-a") return b.name.localeCompare(a.name);
    return 0; // default order based on initial array
  });

  return (
    <div className="w-full">
      {/* Responsive Hero Section */}
      <section className="relative bg-[#0f172a] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/hero/categories browsing.png"
            alt="Tech categories"
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
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            Explore Categories
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Find the best tech essentials for your academic journey. From high-performance laptops to campus-ready accessories.
          </p>
          <div className="flex max-w-xl mx-auto relative">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What tech are you looking for today?"
                className="w-full pl-12 pr-4 py-3 md:py-4 bg-white rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm md:text-base shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white">
        {/* Sort Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-2 flex justify-end">
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
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {sorted.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">category</span>
              <h3 className="text-xl font-bold text-gray-800">No categories found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sorted.map((cat) => (
                <Link key={cat.slug} href={`/categories/${cat.slug}`}>
                  <div className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/3] shadow-md hover:shadow-xl transition-all">
                    <Image
                      fill
                      src={images[cat.slug] || "/assets/images/categories/laptop.jpg"}
                      alt={cat.name}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Product count badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-ushop-purple text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md">
                        {cat.count === 0 ? "Empty" : `${cat.count} Products`}
                      </span>
                    </div>

                    {/* Bottom text */}
                    <div className="absolute bottom-4 md:bottom-5 left-4 md:left-5 right-4 md:right-5 text-white">
                      <h3 className="font-bold text-lg md:text-xl mb-1">{cat.name}</h3>
                      <p className="text-xs md:text-sm text-white/70 mb-2 md:mb-3 line-clamp-1">
                        {descriptions[cat.slug] || "Browse collection"}
                      </p>
                      <span className="text-xs md:text-sm font-semibold group-hover:underline inline-flex items-center gap-1">
                        Browse Collection <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </span>
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
