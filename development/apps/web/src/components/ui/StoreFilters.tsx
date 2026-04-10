"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function StoreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get("sort") || "default";
  const currentType = searchParams.get("type") || "all";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "default" || value === "all" || value === "") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between sm:justify-end">
      {/* Filter pills */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 w-full sm:w-auto overflow-x-auto scroolbar-hide">
        <button 
          onClick={() => router.push(`?${createQueryString("type", "all")}`)}
          className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${currentType === "all" ? "bg-ushop-purple text-white" : "text-gray-500 hover:bg-gray-200"}`}
        >
          All Stores
        </button>
        <button 
          onClick={() => router.push(`?${createQueryString("type", "student")}`)}
          className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${currentType === "student" ? "bg-ushop-purple text-white" : "text-gray-500 hover:bg-gray-200"}`}
        >
          Student Run
        </button>
        <button 
          onClick={() => router.push(`?${createQueryString("type", "elite")}`)}
          className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${currentType === "elite" ? "bg-ushop-purple text-white" : "text-gray-500 hover:bg-gray-200"}`}
        >
          Elite
        </button>
      </div>

      <div className="relative inline-block w-full sm:w-auto">
        <select
          value={currentSort}
          onChange={(e) => router.push(`?${createQueryString("sort", e.target.value)}`)}
          className="w-full sm:w-auto appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ushop-purple cursor-pointer transition-colors"
        >
          <option value="default">Sort: Default</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating">Highest Rated</option>
          <option value="a-z">Alphabetical (A-Z)</option>
          <option value="z-a">Alphabetical (Z-A)</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <span className="material-symbols-outlined text-base">expand_more</span>
        </div>
      </div>
    </div>
  );
}
