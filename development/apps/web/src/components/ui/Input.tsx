"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

// ─── Input Component ────────────────────────────────────────────
// Text input with label, helper text, error state, and icon slots.
// Design reference: design/ui-kit/atoms/inputs.png
//
// States: default, focus, error, disabled

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    // Generate a stable id for label association if not provided
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {/* Label with required indicator */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </label>
        )}

        {/* Input wrapper for icon positioning */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl border bg-white text-gray-900 transition-all
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-[#520f85] focus:border-[#520f85]
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-gray-200 hover:border-gray-300"}
              ${leftIcon ? "pl-10" : "pl-4"}
              ${rightIcon ? "pr-10" : "pr-4"}
              py-3 text-sm
              ${className}
            `}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message takes priority over helper text */}
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
