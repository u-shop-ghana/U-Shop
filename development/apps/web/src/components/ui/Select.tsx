"use client";

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";

// ─── Select Component ───────────────────────────────────────────
// Dropdown select with same styling as the Input component.

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, helperText, error, fullWidth = true, placeholder, className = "", id, children, ...props },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          className={`
            w-full rounded-xl border bg-white text-gray-900 transition-all
            appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-ushop-purple focus:border-ushop-purple
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-gray-200 hover:border-gray-300"}
            px-4 py-3 pr-10 text-sm
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>

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

Select.displayName = "Select";

export { Select };
export type { SelectProps };
