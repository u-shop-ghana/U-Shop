"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ─── Dashboard Layout ───────────────────────────────────────────
// Wraps all /dashboard/* pages with a sidebar navigation and header.
// Uses the AuthProvider to display user info and handle sign-out.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show skeleton while auth state is being resolved
  if (loading) {
    return (
      <div className="flex min-h-screen bg-ink-void">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-ushop-purple border-t-transparent rounded-full animate-spin" />
            <p className="text-ink-mid text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // The middleware should have caught this, but as a safety net:
  // if no user is found after loading, redirect to login.
  if (!user) {
    router.push("/login");
    return null;
  }

  // Helper to get user initials for the avatar fallback
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  // Sidebar navigation items with icons and labels.
  // Only show "Store" items if user is a seller.
  const navItems = [
    { href: "/dashboard", icon: "dashboard", label: "Overview" },
    { href: "/dashboard/orders", icon: "receipt_long", label: "Orders" },
    { href: "/dashboard/messages", icon: "chat", label: "Messages" },
    { href: "/dashboard/wallet", icon: "account_balance_wallet", label: "Wallet" },
    ...(user.role === "SELLER" || user.role === "BOTH" || user.role === "ADMIN"
      ? [
          { href: "/dashboard/store", icon: "storefront", label: "My Store" },
          { href: "/dashboard/store/listings", icon: "inventory_2", label: "Listings" },
          { href: "/dashboard/store/transactions", icon: "payments", label: "Transactions" },
        ]
      : [
          { href: "/dashboard/store/create", icon: "add_business", label: "Become a Seller" },
        ]),
    { href: "/dashboard/settings", icon: "settings", label: "Settings" },
  ];

  // Insert admin link for admin users
  if (user.role === "ADMIN") {
    navItems.push({ href: "/admin", icon: "admin_panel_settings", label: "Admin Panel" });
  }

  return (
    <div className="flex min-h-screen bg-ink-void">
      {/* ── Mobile sidebar overlay ───────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-ink-deep border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logos/web/logo-300w.png"
              alt="U-Shop"
              width={120}
              height={36}
              className="object-contain"
            />
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-white/60 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 group"
            >
              <span className="material-symbols-outlined text-xl group-hover:text-ushop-purple transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 px-2">
            {/* Avatar */}
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName ?? "User avatar"}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ushop-purple to-ushop-magenta flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.fullName ?? "User"}
              </p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="text-white/40 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-ink-void/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Page title area — child pages can override via context */}
          <div className="hidden lg:block" />

          {/* Right side: verification status + notifications */}
          <div className="flex items-center gap-4">
            {/* Verification badge */}
            {user.verificationStatus === "VERIFIED" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                Verified Student
              </div>
            )}
            {user.verificationStatus === "PENDING" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-medium">
                <span className="material-symbols-outlined text-sm">pending</span>
                Verification Pending
              </div>
            )}
            {user.verificationStatus === "UNVERIFIED" && (
              <Link
                href="/dashboard/verification"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ushop-purple/10 border border-ushop-purple/20 rounded-full text-ushop-purple text-xs font-medium hover:bg-ushop-purple/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">shield</span>
                Verify Now
              </Link>
            )}

            {/* Notifications bell (placeholder for Phase 9) */}
            <button className="relative text-white/60 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
