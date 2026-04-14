"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { SearchBar } from "../cards/SearchBar";
import { createClient } from "@/lib/supabase/client";

// ─── Header Component ───────────────────────────────────────────
// Three-row header matching design/ui-kit/organisms/header.png:
//   Row 1 (topBar): Phone, email | Sell on U-Shop, Track Order
//   Row 2 (main):   Logo, SearchBar, Wishlist, Cart, Login/SignUp
//   Row 3 (nav):    All Products, Categories, Universities, Stores | Student Deals
//
// Responsive: Mobile hamburger shows full nav + wishlist/cart.
// Auto-closes mobile menu on navigation.

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  isLoggedIn?: boolean;
  userName?: string;
  hasStore?: boolean;
  onSearch?: (query: string) => void;
}

export function Header({
  cartCount = 0,
  wishlistCount = 0,
  isLoggedIn = false,
  userName,
  hasStore = false,
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    await supabase.auth.signOut();
    router.refresh(); // Refresh route to update useAuth state
  };

  // Default search handler navigates to /search?q=... or bare /search
  function handleSearch(query: string) {
    if (onSearch) {
      onSearch(query);
    } else {
      if (query) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      } else {
        router.push(`/search`);
      }
    }
    // Close mobile menu after search
    setMobileMenuOpen(false);
  }

  // Close mobile menu when a link is clicked
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Check if a nav link is the current page for active styling
  const isActive = (href: string) => pathname === href;

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
              <span className="hidden sm:inline">+233 50 956 5794</span>
            </a>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <a
              href="mailto:support@ushop.com"
              className="hover:text-gray-300 transition-colors hidden sm:inline"
            >
              support@ushop.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/store/create"
              className="hover:text-gray-300 transition-colors"
            >
              Sell on U-Shop
            </Link>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <Link
              href="/dashboard"
              className="font-bold hover:text-gray-300 transition-colors hidden sm:inline"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* ── Row 2: Main bar ── */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0 shrink-0">
            <div className="bg-red-600 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg">
              <span className="text-white font-extrabold text-base md:text-lg">
                U
              </span>
            </div>
            <span className="text-[#0f172a] font-extrabold text-lg md:text-xl ml-1">
              shop
            </span>
          </Link>

          {/* Search bar — hidden on mobile, shown on md+ */}
          <div className="hidden md:flex flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-3 md:gap-4 ml-auto md:ml-0">
            {/* Wishlist — hidden on mobile (shown in hamburger) */}
            <Link
              href="/wishlist"
              className="relative hidden sm:flex items-center gap-1 text-gray-600 hover:text-[#6B1FA8] transition-colors"
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
              className="relative flex items-center gap-1 text-gray-600 hover:text-[#6B1FA8] transition-colors"
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#6B1FA8] transition-colors"
                >
                  <span className="material-symbols-outlined text-2xl">
                    account_circle
                  </span>
                  <span className="hidden lg:inline">
                    {userName || "Account"}
                  </span>
                  <span className="material-symbols-outlined text-sm hidden lg:inline pt-0.5">
                    expand_more
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),_0_8px_10px_-6px_rgba(0,0,0,0.1)] py-2 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#6B1FA8]"
                    >
                      Profile Dashboard
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#6B1FA8]"
                    >
                      My Orders
                    </Link>
                    {hasStore && (
                      <Link
                        href="/dashboard/store"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#6B1FA8]"
                      >
                        My Store
                      </Link>
                    )}
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-bold text-gray-700 hover:text-[#6B1FA8] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#D4009B] text-white text-sm font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-xl hover:bg-[#b50f7e] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
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
            aria-label="Main navigation"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-6 w-full md:w-auto">
              {/* Navigation links — close menu on click for mobile */}
              {[
                { href: "/search", label: "All Products" },
                { href: "/categories", label: "Categories" },
                { href: "/universities", label: "Universities" },
                { href: "/stores", label: "Stores" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`text-sm font-medium transition-colors py-2 md:py-1 w-full md:w-auto ${
                    isActive(link.href)
                      ? "text-[#6B1FA8] font-bold"
                      : "text-gray-700 hover:text-[#6B1FA8]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile-only: Wishlist, Login/SignUp inside hamburger */}
              <div className="md:hidden flex flex-col gap-1 border-t border-gray-100 mt-2 pt-2 w-full">
                <Link
                  href="/wishlist"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#6B1FA8] py-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    favorite
                  </span>
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#6B1FA8] py-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      account_circle
                    </span>
                    {userName || "Profile Dashboard"}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="text-sm font-bold text-gray-700 hover:text-[#6B1FA8] py-2 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="text-sm font-bold text-[#D4009B] hover:text-[#6B1FA8] py-2 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Student Deals — highlighted */}
            <Link
              href="/student-deals"
              onClick={closeMobileMenu}
              className="flex items-center gap-1 text-sm font-bold text-[#D4009B] hover:text-[#6B1FA8] transition-colors py-2 md:py-1 mt-2 md:mt-0"
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
