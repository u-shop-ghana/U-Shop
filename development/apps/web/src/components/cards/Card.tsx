import type { ReactNode, HTMLAttributes } from "react";

// ─── Card Component ─────────────────────────────────────────────
// Base card with 3 variants: Elevated (shadow), Outlined (border),
// Hoverable (lifts on hover).
// Design reference: design/ui-kit/molecules/cards.png

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "outlined" | "hoverable";
  padding?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
}

const variantStyles = {
  elevated: "bg-white shadow-md border border-gray-100",
  outlined: "bg-white border border-gray-200",
  hoverable:
    "bg-white border border-gray-200 transition-all hover:shadow-lg hover:-translate-y-0.5",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  variant = "elevated",
  padding = "md",
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── CardHeader / CardContent / CardFooter ──────────────────────
// Composable sub-components for structured card layouts.

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>{children}</div>
  );
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
