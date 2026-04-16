"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api-client";

// ─── Profile Dashboard — Account Overview ───────────────────────
// This is the main dashboard page that shows the user's account
// summary at a glance: profile info cards, alert banners,
// recent orders table, and personalized product recommendations.
//
// Design Reference: design/ui-kit/Screens/desktop/Profile dashboard.png
// Design Reference: design/web-designs/Profile dashboard.html
//
// Data Flow:
//   - User profile data comes from AuthContext (useAuth hook)
//   - Recent orders fetched client-side from GET /api/v1/orders?limit=3
//   - Recommendations: placeholder section (API not yet implemented)

// ─── Order item shape returned from the API ─────────────────────
interface OrderItem {
  id: string;
  orderId: string;
  listing: {
    title: string;
    images: string[];
    variant?: string;
  };
  status: string;
  createdAt: string;
}

// Maps a verification status to a styled badge
function getVerificationBadge(status: string) {
  switch (status) {
    case "VERIFIED":
      return { label: "Verified", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    case "PENDING":
      return { label: "Pending", cls: "bg-blue-50 text-blue-600 border-blue-100" };
    case "REJECTED":
      return { label: "Rejected", cls: "bg-red-50 text-red-600 border-red-100" };
    default:
      return { label: "Unverified", cls: "bg-amber-50 text-amber-600 border-amber-100" };
  }
}

// Maps an order status to a styled pill badge
function getOrderStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return { label: "Delivered", cls: "bg-emerald-50 text-emerald-600" };
    case "ON_THE_WAY":
    case "SHIPPED":
      return { label: "On the way", cls: "bg-blue-50 text-blue-600" };
    case "PROCESSING":
      return { label: "Processing", cls: "bg-yellow-50 text-yellow-600" };
    case "CANCELLED":
      return { label: "Cancelled", cls: "bg-red-50 text-red-600" };
    default:
      return { label: status, cls: "bg-slate-50 text-slate-600" };
  }
}

// Formats an ISO date string to a short locale representation
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetch the 3 most recent orders on mount.
  // This provides a quick preview — the full list is at /dashboard/orders.
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await apiFetch("/api/v1/orders?limit=3");
        if (res.success && Array.isArray(res.data)) {
          setRecentOrders(res.data);
        }
      } catch {
        // Non-critical — the dashboard functions without orders data
      } finally {
        setOrdersLoading(false);
      }
    }
    loadOrders();
  }, []);

  // Skeleton loading state while the auth context resolves
  if (loading || !user) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-96 bg-slate-100 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Time-based greeting for a personal touch
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const verificationBadge = getVerificationBadge(user.verificationStatus);
  const memberSince = formatDate(user.createdAt);

  // Define the soft shadow used across all overview cards
  const cardShadow =
    "shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]";

  return (
    <div className="space-y-10">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Overview
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          {greeting}, {user.fullName?.split(" ")[0] ?? "there"}. Manage your
          shopping preferences and history.
        </p>
      </header>

      {/* ── 4-Card Overview Hub ────────────────────────────────────
          Matches the design: Account Info, Primary Address,
          Wallet Balance, Newsletter. 4 columns on desktop,
          2 on tablet, stacked on mobile. ──────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Account Info Card */}
        <div className={`bg-white p-7 rounded-xl ${cardShadow}`}>
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Account Info
            </h3>
            <Link
              href="/dashboard/settings"
              className="text-[#520f85] text-[11px] font-bold hover:underline"
            >
              EDIT
            </Link>
          </div>
          <div className="space-y-1">
            <p className="text-[15px] font-bold text-slate-900">
              {user.fullName || "—"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              {user.role === "BOTH"
                ? "Buyer & Seller"
                : user.role === "ADMIN"
                  ? "Admin"
                  : user.role || "Buyer"}
            </span>
            <span
              className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border ${verificationBadge.cls}`}
            >
              {verificationBadge.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-5 font-medium">
            Member since {memberSince}
          </p>
        </div>

        {/* Primary Address Card */}
        <div className={`bg-white p-7 rounded-xl ${cardShadow}`}>
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Primary Address
            </h3>
            <Link
              href="/dashboard/addresses"
              className="text-[#520f85] text-[11px] font-bold hover:underline"
            >
              MANAGE
            </Link>
          </div>
          {user.universityName ? (
            <div className="space-y-1">
              <p className="text-[15px] font-bold text-slate-900">
                {user.universityName}
              </p>
              <p className="text-xs text-slate-500">Campus Location</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 italic">
                No address added yet
              </p>
              <Link
                href="/dashboard/addresses"
                className="text-xs text-[#520f85] font-semibold hover:underline"
              >
                + Add Address
              </Link>
            </div>
          )}
        </div>

        {/* Wallet Balance Card */}
        <div className={`bg-white p-7 rounded-xl ${cardShadow}`}>
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Wallet Balance
            </h3>
            <span className="material-symbols-outlined text-[#520f85] text-xl">
              account_balance_wallet
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-extrabold text-slate-900">GH₵ 0.00</p>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-wide">
              <span className="material-symbols-outlined text-xs">
                trending_up
              </span>
              0 Points
            </p>
          </div>
        </div>

        {/* Newsletter Status Card */}
        <div className={`bg-white p-7 rounded-xl ${cardShadow}`}>
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Newsletter
            </h3>
            <span className="material-symbols-outlined text-[#520f85] text-xl">
              mail
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[15px] font-bold text-slate-900">Subscribed</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              Weekly student deals and tech updates delivered directly to you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contextual Alert Banners ──────────────────────────────
          Show one banner based on priority: unverified → store promo.
          Uses the design's primary/5 background tint. ────────── */}
      {user.verificationStatus === "UNVERIFIED" && (
        <div className="bg-[#520f85]/5 border border-[#520f85]/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#520f85] shadow-sm shrink-0">
              <span className="material-symbols-outlined text-xl">
                verified_user
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Verify Your Account
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete verification to unlock selling features and build trust
                with buyers.
              </p>
            </div>
          </div>
          <Link
            href="/verify"
            className="text-[11px] font-bold text-[#520f85] hover:text-[#D4009B] uppercase tracking-widest px-4 py-2 bg-white rounded-md shadow-sm transition-all whitespace-nowrap"
          >
            Verify Now
          </Link>
        </div>
      )}

      {/* Store management banner — shown if the user owns a store */}
      {user.store && (
        <div className="bg-gradient-to-r from-[#520f85]/5 to-[#D4009B]/5 border border-[#520f85]/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#520f85] shadow-sm shrink-0">
              <span className="material-symbols-outlined text-xl">
                storefront
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {user.store.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                @{user.store.handle} •{" "}
                {user.store.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/store/settings"
            className="text-[11px] font-bold text-[#520f85] hover:text-[#D4009B] uppercase tracking-widest px-4 py-2 bg-white rounded-md shadow-sm transition-all whitespace-nowrap"
          >
            Manage Store
          </Link>
        </div>
      )}

      {/* ── Recent Orders ─────────────────────────────────────────
          3-row preview table with item thumbnail, order ID,
          status badge, date, and action link. Matches the design
          mockup's table structure exactly. ────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-xl text-slate-900">
            Recent Orders
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-[#520f85] text-sm font-bold hover:underline"
          >
            See All Orders
          </Link>
        </div>

        {ordersLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-slate-400 text-[11px] uppercase font-bold tracking-[0.15em]">
                <tr className="border-b border-slate-100">
                  <th className="pb-5 font-bold">Item</th>
                  <th className="pb-5 font-bold">Order ID</th>
                  <th className="pb-5 font-bold">Status</th>
                  <th className="pb-5 font-bold">Date</th>
                  <th className="pb-5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const badge = getOrderStatusBadge(order.status);
                  return (
                    <tr key={order.id} className="group">
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-50 flex items-center justify-center p-2 rounded-lg group-hover:bg-slate-100 transition-colors">
                            {order.listing.images?.[0] ? (
                              <Image
                                src={order.listing.images[0]}
                                alt={order.listing.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain mix-blend-multiply"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-slate-300 text-2xl">
                                inventory_2
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-slate-900 line-clamp-1">
                              {order.listing.title}
                            </p>
                            {order.listing.variant && (
                              <p className="text-[11px] text-slate-400">
                                {order.listing.variant}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-sm font-medium text-slate-600">
                        #{order.orderId.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-6 text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-6 text-right">
                        <Link
                          href={`/dashboard/orders/${order.orderId}`}
                          className="text-[11px] font-bold text-[#520f85] hover:text-[#D4009B] uppercase tracking-widest"
                        >
                          {order.status.toUpperCase() === "DELIVERED"
                            ? "Details"
                            : "Track"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // Empty state — matches the design's clean, minimal aesthetic
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">
              shopping_bag
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              No Orders Yet
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Start exploring campus deals and your orders will appear here.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#520f85] text-white text-sm font-bold rounded-lg hover:bg-[#6B1FA8] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                search
              </span>
              Browse Products
            </Link>
          </div>
        )}
      </section>

      {/* ── Recommended For You ───────────────────────────────────
          The design shows 4 product cards with hover scaling.
          Since the recommendations API isn't built yet, we show
          a clean placeholder that invites exploration. ────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900">
            Recommended For You
          </h2>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Personalized Selection
          </span>
        </div>
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">
            auto_awesome
          </span>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Personalized Picks Coming Soon
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            We&apos;re learning your preferences to suggest the best campus
            deals for you.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-[#520f85] text-sm font-bold hover:underline"
          >
            Browse All Products
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
