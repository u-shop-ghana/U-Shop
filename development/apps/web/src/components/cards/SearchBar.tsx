"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";

// ─── SearchBar Component ────────────────────────────────────────
// Search input with suggestions dropdown.
// Design reference: design/ui-kit/molecules/search bar.png
// Placeholder: "Search products, categories, universities ..."

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search products, categories, universities ...",
  suggestions = [],
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter suggestions based on current query
  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  }

  return (
    <div ref={wrapperRef} className={`relative flex-1 ${className}`}>
      <form onSubmit={handleSubmit} className="flex">
        {/* Search icon */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-xl" aria-hidden="true">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => query.length > 0 && setShowSuggestions(true)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-l-xl
              text-gray-900 text-sm placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-[#6B1FA8] focus:border-[#6B1FA8]
              transition-all"
            placeholder={placeholder}
          />
        </div>

        {/* Search button matching the header design */}
        <button
          type="submit"
          className="px-6 bg-[#6B1FA8] text-white rounded-r-xl hover:bg-[#420c6b]
            transition-colors flex items-center justify-center"
          aria-label="Submit search"
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">search</span>
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {filteredSuggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 text-sm text-gray-700
                hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-gray-500 text-base" aria-hidden="true">
                search
              </span>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
