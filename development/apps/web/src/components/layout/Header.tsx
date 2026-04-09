"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchBar } from "../cards/SearchBar";

// ─── Header Component ───────────────────────────────────────────
// Three-row header matching design/ui-kit/organisms/header.png:
//   Row 1 (topBar): Phone, email | Sell on U-Shop, Track Order
//   Row 2 (main):   Logo, SearchBar, Wishlist, Cart, Login/SignUp
//   Row 3 (nav):    All Products, Categories, Universities, Stores | Student Deals

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  isLoggedIn?: boolean;
  userName?: string;
  onSearch?: (query: string) => void;
}

export function Header({
  cartCount = 0,
  wishlistCount = 0,
  isLoggedIn = false,
  userName,
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Default search handler navigates to /search?q=...
  function handleSearch(query: string) {
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* ── Row 1: Top bar ── */}
      <div className="bg-[#0f172a] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="tel:+233509565794"
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              +233 50 956 5794
            </a>
            <span className="text-gray-600">|</span>
            <a
              href="mailto:support@ushop.com"
              className="hover:text-gray-300 transition-colors"
            >
              support@ushop.com
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/sell"
              className="hover:text-gray-300 transition-colors"
            >
              Sell on U-Shop
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/track"
              className="font-bold hover:text-gray-300 transition-colors"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* ── Row 2: Main bar ── */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 shrink-0">
            <div className="bg-red-600 w-9 h-9 flex items-center justify-center rounded-lg">
              <span className="text-white font-extrabold text-lg">U</span>
            </div>
            <span className="text-[#0f172a] font-extrabold text-xl ml-1">
              shop
            </span>
          </Link>

          {/* Search bar — hidden on mobile, shown on md+ */}
          <div className="hidden md:flex flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-4 ml-auto md:ml-0">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative flex items-center gap-1 text-gray-600 hover:text-[#520f85] transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">
                favorite
              </span>
              <span className="hidden lg:inline text-sm font-medium">
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1 text-gray-600 hover:text-[#520f85] transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">
                shopping_cart
              </span>
              <span className="hidden lg:inline text-sm font-medium">
                Cart
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth buttons */}
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#520f85] transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">
                  account_circle
                </span>
                <span className="hidden lg:inline">
                  {userName || "Account"}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-bold text-gray-700 hover:text-[#520f85] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#d41295] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#b50f7e] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search — visible only on small screens */}
        <div className="md:hidden mt-3">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* ── Row 3: Navigation bar ── */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <nav
            className={`${
              mobileMenuOpen ? "flex" : "hidden"
            } md:flex items-center justify-between py-2`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-6">
              <Link
                href="/products"
                className="text-sm font-medium text-gray-700 hover:text-[#520f85] transition-colors py-1"
              >
                All Products
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-gray-700 hover:text-[#520f85] transition-colors py-1"
              >
                Categories
              </Link>
              <Link
                href="/universities"
                className="text-sm font-medium text-gray-700 hover:text-[#520f85] transition-colors py-1"
              >
                Universities
              </Link>
              <Link
                href="/stores"
                className="text-sm font-medium text-gray-700 hover:text-[#520f85] transition-colors py-1"
              >
                Stores
              </Link>
            </div>

            {/* Student Deals — highlighted */}
            <Link
              href="/student-deals"
              className="flex items-center gap-1 text-sm font-bold text-[#d41295] hover:text-[#520f85] transition-colors py-1"
            >
              <span className="material-symbols-outlined text-base">
                school
              </span>
              Student Deals
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
