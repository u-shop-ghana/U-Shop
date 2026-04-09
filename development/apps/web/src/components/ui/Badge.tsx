import type { ReactNode } from "react";

// ─── Badge Component ────────────────────────────────────────────
// Status/label badges used across the app for conditions, roles,
// order statuses, verification states, etc.
//
// Design reference: design/ui-kit/atoms/badges.png
// Variants match the U-Shop design system semantic colors.

interface BadgeProps {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "neutral";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

// Color mapping from the design tokens
// Primary=#6B1FA8, Secondary=#D4009B, Success=#22c55e,
// Warning=#f59e0b, Error=#ef4444, Info=#3b82f6
const variantStyles = {
  primary:
    "bg-[#6B1FA8]/15 text-[#6B1FA8] border-[#6B1FA8]/30",
  secondary:
    "bg-[#D4009B]/15 text-[#D4009B] border-[#D4009B]/30",
  success:
    "bg-emerald-100 text-emerald-700 border-emerald-300",
  warning:
    "bg-amber-100 text-amber-700 border-amber-300",
  error:
    "bg-red-100 text-red-700 border-red-300",
  info:
    "bg-blue-100 text-blue-700 border-blue-300",
  neutral:
    "bg-gray-100 text-gray-700 border-gray-300",
};

const sizeStyles = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export function Badge({
  variant = "primary",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border uppercase tracking-wide whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Pre-built badge variants for common use cases ──────────────
// These match the badge groups shown in the UI kit badges.png

// Listing condition badges
const conditionMap = {
  NEW: { variant: "success" as const, label: "New" },
  LIKE_NEW: { variant: "success" as const, label: "Like New" },
  EXCELLENT: { variant: "info" as const, label: "Excellent" },
  GOOD: { variant: "neutral" as const, label: "Good" },
  FAIR: { variant: "warning" as const, label: "Fair" },
  FOR_PARTS: { variant: "error" as const, label: "For Parts" },
};

export function ConditionBadge({ condition }: { condition: keyof typeof conditionMap }) {
  const config = conditionMap[condition];
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}

// Verification status badges
const verificationMap = {
  UNVERIFIED: { variant: "neutral" as const, label: "Unverified" },
  PENDING: { variant: "warning" as const, label: "Pending" },
  VERIFIED: { variant: "success" as const, label: "Verified" },
  REJECTED: { variant: "error" as const, label: "Rejected" },
  EXPIRED: { variant: "neutral" as const, label: "Expired" },
};

export function VerificationBadge({ status }: { status: keyof typeof verificationMap }) {
  const config = verificationMap[status];
  return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
}

// Stock availability indicator (dot + label)
const stockMap = {
  IN_STOCK: { color: "bg-emerald-500", label: "In Stock" },
  OUT_OF_STOCK: { color: "bg-red-500", label: "Out of Stock" },
  LOW_STOCK: { color: "bg-amber-500", label: "Low Stock" },
};

export function StockBadge({ status }: { status: keyof typeof stockMap }) {
  const config = stockMap[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}
