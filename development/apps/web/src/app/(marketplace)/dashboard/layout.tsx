"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ─── Dashboard Layout ───────────────────────────────────────────
// Light-themed sidebar + mobile navigation matching the design mockup:
// design/ui-kit/Screens/desktop/Profile dashboard.png
// design/web-designs/Profile dashboard.html
//
// Structure:
//   Desktop: Fixed sidebar (w-72) with logo, nav links, separator, settings, logout
//   Mobile: Slide-out overlay sidebar + fixed bottom nav bar
//
// The sidebar renders nav items conditionally based on the user's
// role: sellers see "My Store" and "Listings"; buyers see "Become a Seller".

// ─── Navigation item shape ──────────────────────────────────────
interface NavItem {
  href: string;
  icon: string;
  label: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading state — show an animated spinner while the auth context resolves
  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-ushop-purple-dark border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Safety redirect — middleware should handle this, but this covers edge cases
  // like stale cookies or session expiry during a long browser session.
  if (!user) {
    router.push("/login");
    return null;
  }

  // Helper: determine if a nav link is the active page
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  // Build the primary navigation items
  // Sellers see store management links; buyers see the "Become a Seller" CTA.
  const primaryNav: NavItem[] = [
    { href: "/dashboard", icon: "person", label: "Overview" },
    { href: "/dashboard/orders", icon: "inventory_2", label: "My Orders" },
    { href: "/dashboard/saved", icon: "favorite", label: "Saved Items" },
  ];

  // Seller-specific nav items — shown below a separator
  const sellerNav: NavItem[] =
    user.role === "SELLER" || user.role === "BOTH" || user.role === "ADMIN"
      ? [
          { href: "/dashboard/store/settings", icon: "store", label: "My Store" },
          { href: "/dashboard/store/listings", icon: "inventory_2", label: "Listings" },
        ]
      : [
          { href: "/dashboard/store/create", icon: "add_business", label: "Become a Seller" },
        ];

  // Settings section nav items
  const settingsNav: NavItem[] = [
    { href: "/dashboard/settings", icon: "settings", label: "Profile Settings" },
    { href: "/dashboard/addresses", icon: "import_contacts", label: "Address Book" },
  ];

  // Admin link — only visible to admin users
  if (user.role === "ADMIN") {
    settingsNav.push({ href: "/admin", icon: "admin_panel_settings", label: "Admin Panel" });
  }

  // Helper to render a single nav link with active styling
  function renderNavLink(item: NavItem) {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-4 px-8 py-3.5 text-sm border-l-[3px] transition-all ${
          active
            ? "bg-violet-50 text-ushop-purple-dark font-semibold border-ushop-purple-dark"
            : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-ushop-purple-dark"
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">
          {item.icon}
        </span>
        {item.label}
      </Link>
    );
  }

  // Mobile bottom nav — simplified 4-icon bar
  const mobileNav: NavItem[] = [
    { href: "/dashboard", icon: "dashboard", label: "Home" },
    { href: "/dashboard/orders", icon: "inventory_2", label: "Orders" },
    { href: "/dashboard/saved", icon: "favorite", label: "Saved" },
    { href: "/dashboard/settings", icon: "settings", label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Mobile sidebar overlay backdrop ─────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      {/* Desktop: always visible, fixed position with scroll.
          Mobile: slide-in drawer with overlay. */}
      <aside
        className={`fixed md:sticky top-0 md:top-[132px] left-0 z-50 md:z-30 h-screen md:h-[calc(100vh-132px)] w-72 bg-white shadow-[1px_0_20px_rgba(0,0,0,0.03)] flex flex-col py-8 transition-transform duration-300 ease-in-out overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo + mobile close button */}
        <div className="px-8 mb-10 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/assets/logos/web/logo-300w.png"
              alt="U-Shop"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-1">
          {primaryNav.map(renderNavLink)}

          {/* Seller Section Separator + Links */}
          <div className="h-6" />
          {sellerNav.map(renderNavLink)}

          {/* Settings Separator + Links */}
          <div className="h-6" />
          {settingsNav.map(renderNavLink)}
        </nav>

        {/* Logout Button — pinned to the bottom */}
        <div className="px-8 pt-6 mt-auto">
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="w-full text-left text-sm font-semibold text-slate-400 hover:text-[#D4009B] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">
              logout
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile top header with hamburger and user status */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 flex items-center justify-between md:hidden relative z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-700"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <Link href="/">
            <Image
              src="/assets/logos/web/logo-300w.png"
              alt="U-Shop"
              width={100}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Verification badge (mobile) */}
          <div className="flex items-center gap-2">
            {user.verificationStatus === "VERIFIED" && (
              <span
                className="material-symbols-outlined text-emerald-500 text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            )}
            <button className="text-slate-400">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
            </button>
          </div>
        </header>

        {/* Desktop top bar — minimal with verification status + notifications */}
        <header className="hidden md:flex bg-slate-50/80 backdrop-blur-md px-8 lg:px-14 py-4 items-center justify-end gap-4 relative z-20 border-b border-transparent">
          {user.verificationStatus === "VERIFIED" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-xs font-bold">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              Verified
            </div>
          )}
          {user.verificationStatus === "PENDING" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-amber-600 text-xs font-bold">
              <span className="material-symbols-outlined text-sm">
                pending
              </span>
              Verification Pending
            </div>
          )}
          {user.verificationStatus === "UNVERIFIED" && (
            <Link
              href="/verify"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full text-ushop-purple-dark text-xs font-bold hover:bg-violet-100 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">shield</span>
              Verify Now
            </Link>
          )}
          <button className="relative text-slate-400 hover:text-slate-700 transition-colors">
            <span className="material-symbols-outlined text-xl">
              notifications
            </span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-14 pb-24 md:pb-14">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ──────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white flex justify-around items-center py-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-8">
        {mobileNav.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 ${
              isActive(link.href) ? "text-ushop-purple-dark" : "text-slate-400"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {link.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
