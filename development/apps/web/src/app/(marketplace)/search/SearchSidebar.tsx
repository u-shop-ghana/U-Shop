"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

// ─── Search Sidebar ─────────────────────────────────────────────
// Matches Figma: white card with filter sections for University,
// Category, Price Range, Condition. Includes Apply + Clear buttons.
// All filter state is driven via URL search params for SSR compatibility.

interface Category {
  name: string;
  slug: string;
}

interface SidebarProps {
  currentParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    buyerUniversity?: string;
    sort?: string;
  };
  categories?: Category[];
  universities?: { value: string; label: string }[];
}

export default function SearchSidebar({
  currentParams,
  categories = [],
  universities = [],
}: SidebarProps) {
  const router = useRouter();

  const [q, setQ] = useState(currentParams.q || "");
  const [category, setCategory] = useState(currentParams.category || "");
  const [minPrice, setMinPrice] = useState(currentParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(currentParams.maxPrice || "");
  const [condition, setCondition] = useState(currentParams.condition || "");
  const [sort, setSort] = useState(currentParams.sort || "relevant");
  const [buyerUniversity, setBuyerUniversity] = useState(
    currentParams.buyerUniversity || ""
  );

  // Build the search URL from all filter values and navigate.
  // Uses Next.js router.push for soft navigation (no full reload).
  const applyFilters = (e?: FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (condition) params.set("condition", condition);
    if (sort && sort !== "relevant") params.set("sort", sort);
    if (buyerUniversity) params.set("buyerUniversity", buyerUniversity);

    router.push(`/search?${params.toString()}`);
  };

  // Clear all filters and navigate to bare /search
  const resetFilters = () => {
    setQ("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setCondition("");
    setSort("relevant");
    setBuyerUniversity("");
    router.push("/search");
  };

  // Count how many filters are active (for badge display)
  const activeFilterCount = [category, minPrice || maxPrice, condition, buyerUniversity].filter(Boolean).length;

  const conditions = [
    { value: "", label: "Any Condition" },
    { value: "NEW", label: "Brand New" },
    { value: "LIKE_NEW", label: "Like New" },
    { value: "EXCELLENT", label: "Excellent" },
    { value: "GOOD", label: "Good" },
    { value: "FAIR", label: "Fair" },
    { value: "FOR_PARTS", label: "For Parts / Faulty" },
  ];

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl md:p-5 md:sticky md:top-24 md:shadow-sm">
      {/* Mobile Toggle Button */}
      <button 
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full flex items-center justify-between p-4 md:hidden"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-base">tune</span>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-ushop-purple text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetFilters();
              }}
              className="text-xs text-red-500 font-medium ml-2"
            >
              Clear
            </button>
          )}
        </div>
        <span className={`material-symbols-outlined transition-transform duration-300 ${isMobileOpen ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {/* Main Form content — collapsable on mobile, always visible on desktop */}
      <form 
        onSubmit={applyFilters} 
        className={`space-y-5 px-4 pb-4 md:px-0 md:pb-0 border-t border-gray-200 md:border-none pt-4 md:pt-0 ${isMobileOpen ? "block" : "hidden md:block"}`}
      >
        {/* Desktop Header with filter count + clear */}
        <div className="hidden md:flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              tune
            </span>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-ushop-purple text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </h2>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Category filter — scrollable list with radio buttons */}
        {categories.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Category
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={!category}
                  onChange={() => setCategory("")}
                  className="w-3.5 h-3.5 accent-ushop-purple"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  All Categories
                </span>
              </label>
              {categories.map((cat) => (
                <label
                  key={cat.slug}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.slug}
                    checked={category === cat.slug}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-3.5 h-3.5 accent-ushop-purple"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* University filter */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">school</span>
            University
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="buyerUniversity"
                value=""
                checked={!buyerUniversity}
                onChange={() => setBuyerUniversity("")}
                className="w-3.5 h-3.5 accent-ushop-purple"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">
                All Universities
              </span>
            </label>
            {universities.map((uni) => (
              <label
                key={uni.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="buyerUniversity"
                  value={uni.value}
                  checked={buyerUniversity === uni.value}
                  onChange={(e) => setBuyerUniversity(e.target.value)}
                  className="w-3.5 h-3.5 accent-ushop-purple"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  {uni.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Price Range (GH₵)
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              min="0"
              className="w-full border border-gray-200 text-gray-900 p-2.5 rounded-lg focus:ring-2 focus:ring-ushop-purple outline-none text-sm"
            />
            <span className="text-gray-400 text-sm">–</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              min="0"
              className="w-full border border-gray-200 text-gray-900 p-2.5 rounded-lg focus:ring-2 focus:ring-ushop-purple outline-none text-sm"
            />
          </div>
        </div>

        {/* Condition */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Condition
          </h3>
          <div className="space-y-2">
            {conditions.map((cond) => (
              <label
                key={cond.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="condition"
                  value={cond.value}
                  checked={condition === cond.value}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-3.5 h-3.5 accent-ushop-purple"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  {cond.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply Filter Button */}
        <button
          type="submit"
          className="w-full py-3 bg-ushop-purple text-white text-sm font-bold rounded-xl hover:bg-ushop-purple/90 transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">search</span>
          Apply Filters
        </button>
      </form>
    </div>
  );
}
