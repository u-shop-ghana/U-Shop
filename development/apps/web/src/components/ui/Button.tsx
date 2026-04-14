"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

// ─── Button Component ───────────────────────────────────────────
// Variants: Primary (purple), Secondary (pink), Outline, Ghost, Danger
// Sizes: sm, md, lg
// Supports: disabled state, loading spinner, full-width, icons
//
// Design reference: design/ui-kit/atoms/buttons.png
// Colors: Primary=#6B1FA8, Secondary=#D4009B, Danger=#ef4444

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

// Base styles shared across all variants
const baseStyles =
  "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a]";

// Variant-specific styles matching the UI kit color tokens
const variantStyles = {
  primary:
    "bg-[#6B1FA8] text-white hover:bg-[#420c6b] focus:ring-[#6B1FA8] shadow-lg shadow-[#6B1FA8]/20",
  secondary:
    "bg-[#D4009B] text-white hover:bg-[#b50f7e] focus:ring-[#D4009B] shadow-lg shadow-[#D4009B]/20",
  outline:
    "bg-transparent border-2 border-[#6B1FA8] text-[#6B1FA8] hover:bg-[#6B1FA8]/10 focus:ring-[#6B1FA8]",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
  danger:
    "bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444] shadow-lg shadow-[#ef4444]/20",
};

// Size-specific styles matching the UI kit
const sizeStyles = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-6 py-3",
  lg: "text-lg px-8 py-4",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading spinner replaces leftIcon when loading */}
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
