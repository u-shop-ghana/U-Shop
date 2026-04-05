"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

// ─── Dashboard Overview Page ────────────────────────────────────
// The main landing page after login. Shows a welcome message,
// quick stats cards, and quick-action links tailored to the user's
// role and verification status.
export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Greeting based on time of day — small personalization touch
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Quick actions change based on role and verification status.
  // Unverified users see "Verify" prominently; sellers see store actions.
  const quickActions = [
    ...(user.verificationStatus !== "VERIFIED"
      ? [
          {
            icon: "verified_user",
            label: "Verify Student Status",
            description: "Unlock student-only prices and campus delivery",
            href: "/verify",
            gradient: "from-ushop-purple to-ushop-magenta",
          },
        ]
      : []),
    ...(user.role === "BUYER"
      ? [
          {
            icon: "add_business",
            label: "Start Selling",
            description: "Create your store and list your tech",
            href: "/dashboard/store/create",
            gradient: "from-ushop-purple to-blue-600",
          },
        ]
      : []),
    ...(user.role === "SELLER" || user.role === "BOTH"
      ? [
          {
            icon: "add_circle",
            label: "New Listing",
            description: "List a product for sale",
            href: "/dashboard/store/listings/new",
            gradient: "from-ushop-purple to-ushop-magenta",
          },
        ]
      : []),
    {
      icon: "search",
      label: "Browse Marketplace",
      description: "Find deals on campus tech",
      href: "/",
      gradient: "from-blue-600 to-cyan-500",
    },
    {
      icon: "receipt_long",
      label: "View Orders",
      description: "Track your purchases and sales",
      href: "/dashboard/orders",
      gradient: "from-emerald-600 to-teal-500",
    },
    {
      icon: "chat",
      label: "Messages",
      description: "Chat with buyers and sellers",
      href: "/dashboard/messages",
      gradient: "from-orange-500 to-pink-500",
    },
  ];

  // Stats cards — will be populated from the API in later phases.
  // For now, show zeros with the right structure.
  const stats = [
    { label: "Total Orders", value: "0", icon: "shopping_cart", change: null },
    { label: "Active Listings", value: "0", icon: "inventory_2", change: null },
    {
      label: "Wallet Balance",
      value: "GH₵ 0.00",
      icon: "account_balance_wallet",
      change: null,
    },
    { label: "Unread Messages", value: "0", icon: "mark_email_unread", change: null },
  ];

  return (
    <div className="space-y-8">
      {/* ── Welcome Banner ────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ushop-purple/20 to-ushop-magenta/10 border border-white/5 p-8">
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            {greeting}, {user.fullName?.split(" ")[0] ?? "there"}! 👋
          </h1>
          <p className="mt-2 text-white/60 text-lg">
            {user.role === "BUYER"
              ? "Welcome to your U-Shop dashboard. Find the best tech deals on campus."
              : "Manage your store, track orders, and grow your business."}
          </p>
        </div>
        {/* Decorative blur circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-ushop-purple/20 rounded-full blur-[80px]" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-ushop-magenta/10 rounded-full blur-[60px]" />
      </div>

      {/* ── Stats Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-ink-deep border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="material-symbols-outlined text-white/40 text-xl">
                {stat.icon}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/50 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden bg-ink-deep border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="material-symbols-outlined text-white text-xl">
                  {action.icon}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">{action.label}</h3>
              <p className="text-white/50 text-sm">{action.description}</p>

              {/* Hover arrow */}
              <span className="absolute top-6 right-6 text-white/20 group-hover:text-white/60 transition-colors material-symbols-outlined">
                arrow_forward
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Account Info ──────────────────────────────────────── */}
      <div className="bg-ink-deep border border-white/5 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Account Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/40 mb-1">Email</p>
            <p className="text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Role</p>
            <p className="text-white capitalize">{user.role.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Verification</p>
            <p className="text-white capitalize">
              {user.verificationStatus.toLowerCase().replace("_", " ")}
            </p>
          </div>
          {user.universityName && (
            <div>
              <p className="text-white/40 mb-1">University</p>
              <p className="text-white">{user.universityName}</p>
            </div>
          )}
          {user.store && (
            <div>
              <p className="text-white/40 mb-1">Store</p>
              <Link
                href={`/store/${user.store.handle}`}
                className="text-ushop-purple hover:underline"
              >
                {user.store.name}
              </Link>
            </div>
          )}
          <div>
            <p className="text-white/40 mb-1">Member Since</p>
            <p className="text-white">
              {new Date(user.createdAt).toLocaleDateString("en-GH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
