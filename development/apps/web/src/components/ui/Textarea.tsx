"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

// ─── Textarea Component ─────────────────────────────────────────
// Multi-line text input. Same styling logic as Input component.
// Design reference: design/ui-kit/atoms/inputs.png (textarea row)

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, helperText, error, fullWidth = true, className = "", id, ...props },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-0.5">*</span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full rounded-xl border bg-white text-gray-900 transition-all
            placeholder:text-gray-400 resize-y min-h-[120px]
            focus:outline-none focus:ring-2 focus:ring-[#520f85] focus:border-[#520f85]
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-gray-200 hover:border-gray-300"}
            px-4 py-3 text-sm
            ${className}
          `}
          {...props}
        />

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

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
