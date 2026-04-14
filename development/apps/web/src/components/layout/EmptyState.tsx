import type { ReactNode } from "react";
import { Button } from "../ui/Button";

// ─── EmptyState Component ───────────────────────────────────────
// Generic empty state with icon, title, description, and CTA button.
// Design reference: design/ui-kit/organisms/empty state.png
// Example: "Your cart is empty" with a "Start Shopping" button.

interface EmptyStateProps {
  icon?: string;       // Material Symbols icon name (default: "shopping_bag")
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon = "shopping_bag",
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = "",
  children,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      {/* Icon circle */}
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-gray-400">
          {icon}
        </span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>

      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      )}

      {/* CTA — renders as link or button depending on props */}
      {actionLabel && actionHref && (
        <a href={actionHref}>
          <Button variant="primary" size="lg">
            {actionLabel}
          </Button>
        </a>
      )}

      {actionLabel && onAction && !actionHref && (
        <Button variant="primary" size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      )}

      {children}
    </div>
  );
}
