"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

interface Category {
  name: string;
  slug: string;
}

// Search sidebar matching the Figma design — light theme with
// university checkboxes, price range, condition radio buttons.
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

  // Build the search URL from all filter values and navigate
  const applyFilters = (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (currentParams.category) params.set("category", currentParams.category);
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

  const universities = [
    { value: "ug", label: "UG (Legon)" },
    { value: "knust", label: "KNUST" },
    { value: "ucc", label: "UCC" },
    { value: "gctu", label: "GCTU" },
  ];

  const conditions = [
    { value: "", label: "Any" },
    { value: "BRAND_NEW", label: "New" },
    { value: "LIKE_NEW", label: "Like New" },
    { value: "EXCELLENT", label: "Excellent" },
    { value: "GOOD", label: "Good" },
    { value: "FAIR", label: "Fair" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24 shadow-sm">
      <form onSubmit={applyFilters} className="space-y-6">
        {/* University — radio list matching Figma */}
        <div>
          <h3 className="text-sm font-bold text-ushop-purple mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">school</span>
            University
          </h3>
          <div className="space-y-2.5">
            {universities.map((uni) => (
              <label key={uni.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="buyerUniversity"
                  value={uni.value}
                  checked={buyerUniversity === uni.value}
                  onChange={(e) => setBuyerUniversity(e.target.value)}
                  className="w-4 h-4 text-ushop-purple border-gray-300 focus:ring-ushop-purple accent-ushop-purple"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{uni.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range — matching Figma with min/max inputs */}
        <div>
          <h3 className="text-sm font-bold text-ushop-purple mb-3">
            Price Range (GH₵)
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="w-full border border-gray-200 text-gray-900 p-2.5 rounded-lg focus:ring-2 focus:ring-ushop-purple outline-none text-sm"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="w-full border border-gray-200 text-gray-900 p-2.5 rounded-lg focus:ring-2 focus:ring-ushop-purple outline-none text-sm"
            />
          </div>
        </div>

        {/* Condition — radio buttons matching Figma */}
        <div>
          <h3 className="text-sm font-bold text-ushop-purple mb-3">
            Condition
          </h3>
          <div className="space-y-2.5">
            {conditions.map((cond) => (
              <label key={cond.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="condition"
                  value={cond.value}
                  checked={condition === cond.value}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-4 h-4 text-ushop-purple border-gray-300 focus:ring-ushop-purple accent-ushop-purple"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{cond.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply Filters Button — matching Figma purple */}
        <button
          type="submit"
          className="w-full py-3 bg-ushop-purple text-white text-sm font-bold rounded-xl hover:bg-ushop-purple/90 transition-colors"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
}
