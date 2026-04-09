"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";

interface Category {
  name: string;
  slug: string;
}

export default function SearchSidebar({
  currentParams,
}: {
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
}) {
  const router = useRouter();
  
  const [q, setQ] = useState(currentParams.q || "");
  const [minPrice, setMinPrice] = useState(currentParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(currentParams.maxPrice || "");
  const [condition, setCondition] = useState(currentParams.condition || "");
  const [sort, setSort] = useState(currentParams.sort || "newest");
  const [buyerUniversity, setBuyerUniversity] = useState(currentParams.buyerUniversity || "");

  const applyFilters = (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (currentParams.category) params.set("category", currentParams.category); // Preserve categories from parent route if any
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (condition) params.set("condition", condition);
    if (sort) params.set("sort", sort);
    if (buyerUniversity) params.set("buyerUniversity", buyerUniversity);

    router.push(`/search?${params.toString()}`);
  };

  const resetFilters = () => {
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    setCondition("");
    setSort("newest");
    setBuyerUniversity("");
    router.push("/search");
  };

  return (
    <div className="bg-campus-form-bg border border-white/5 rounded-2xl p-6 sticky top-24 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6">Filters</h2>

      <form onSubmit={applyFilters} className="space-y-6">
        {/* Search Term */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Search</label>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Laptops, phones..."
            className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-ushop-purple outline-none"
          />
        </div>

        {/* Categories are handled by explicit routing, but we could add selections. We skip for simplicity since ?category can handle it. */}
        
        {/* Sort */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Sort By</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl appearance-none focus:ring-2 focus:ring-ushop-purple outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Location Matcher */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Local Campus Match</label>
           <select
            value={buyerUniversity}
            onChange={(e) => setBuyerUniversity(e.target.value)}
            className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl appearance-none focus:ring-2 focus:ring-ushop-purple outline-none"
          >
            <option value="">Any Campus</option>
            <option value="ug">UG (Legon)</option>
            <option value="knust">KNUST</option>
            <option value="ucc">UCC</option>
            <option value="gctu">GCTU</option>
          </select>
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl appearance-none focus:ring-2 focus:ring-ushop-purple outline-none"
          >
            <option value="">Any Condition</option>
            <option value="BRAND_NEW">Brand New</option>
            <option value="LIKE_NEW">Like New</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Price (GHS)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl min-w-0"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-full bg-campus-input border border-gray-700 text-white p-3 rounded-xl min-w-0"
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button type="submit" variant="primary" className="w-full">
            Apply Filters
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
