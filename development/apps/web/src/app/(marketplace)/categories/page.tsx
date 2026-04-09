import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@ushop/shared";

export const metadata: Metadata = {
  title: "Explore Categories | U-Shop",
  description: "Find the best tech essentials for your academic journey on U-Shop.",
};

// Map category slugs to local images from /public/assets/images/categories/
const CATEGORY_IMAGES: Record<string, string> = {
  laptops: "/assets/images/categories/laptop.jpg",
  phones: "/assets/images/categories/phone.png",
  accessories: "/assets/images/categories/Accessories.png",
  tablets: "/assets/images/categories/Tablet.png",
  gaming: "/assets/images/categories/Gaming.png",
  storage: "/assets/images/categories/storage.png",
};

// Short descriptions for each category matching the Figma design
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  laptops: "MacBooks, Windows Ultrabooks & Gaming rigs.",
  phones: "Latest iPhones, Samsung Galaxy & Pixel devices.",
  tablets: "iPads and Android tablets for note-taking.",
  accessories: "Chargers, headphones, and student essentials.",
  gaming: "Consoles, controllers, and immersive gear.",
  storage: "External SSDs, Hard drives & Flash drives.",
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner — matching Figma: dark image overlay with title + search */}
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
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm mb-6">
            <span className="material-symbols-outlined text-base">arrow_back</span> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Explore Categories
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Find the best tech essentials for your academic journey. From high-performance laptops to campus-ready accessories.
          </p>
          {/* Search bar matching Figma */}
          <form action="/search" method="GET" className="flex max-w-xl mx-auto">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                name="q"
                id="categories-search"
                placeholder="What tech are you looking for today?"
                className="w-full pl-12 pr-4 py-4 bg-white rounded-l-xl text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-ushop-purple text-white font-bold rounded-r-xl hover:bg-ushop-purple/90 transition-colors uppercase text-sm tracking-wide"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Sort Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-end">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2">
          Sort: Default
          <span className="material-symbols-outlined text-base">expand_more</span>
        </div>
      </div>

      {/* Category Cards Grid — matching Figma: 3-col, image cards with count + description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/categories/${cat.slug}`}>
              <div className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/3] shadow-lg">
                <Image
                  fill
                  src={CATEGORY_IMAGES[cat.slug] || "/assets/images/categories/laptop.jpg"}
                  alt={cat.name}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Product count badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-ushop-purple text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md">
                    {cat.slug === "accessories" ? "1.2k+" : cat.slug === "phones" ? "285" : cat.slug === "laptops" ? "142" : cat.slug === "tablets" ? "96" : cat.slug === "gaming" ? "78" : "110"} Products
                  </span>
                </div>

                {/* Bottom text */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="font-bold text-xl mb-1">{cat.name}</h3>
                  <p className="text-sm text-white/70 mb-3 line-clamp-1">
                    {CATEGORY_DESCRIPTIONS[cat.slug] || "Browse collection"}
                  </p>
                  <span className="text-sm font-semibold group-hover:underline inline-flex items-center gap-1">
                    Browse Collection <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
