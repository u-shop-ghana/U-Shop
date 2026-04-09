"use client";

import { useState } from "react";

// ─── Quantity Selector Component ────────────────────────────────
// Matches Figma: "QUANTITY" label + [−] [count] [+] grouped inline.
// Bounded by min=1 and max (stock available).
interface QuantitySelectorProps {
  min?: number;
  max: number;
  onChange?: (quantity: number) => void;
}

export function QuantitySelector({
  min = 1,
  max,
  onChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(min);

  // Update quantity within bounds and notify parent
  function update(newVal: number) {
    const clamped = Math.max(min, Math.min(max, newVal));
    setQuantity(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        Quantity
      </span>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        {/* Decrement button */}
        <button
          type="button"
          onClick={() => update(quantity - 1)}
          disabled={quantity <= min}
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease quantity"
        >
          −
        </button>
        {/* Current value */}
        <span className="w-12 h-10 flex items-center justify-center text-sm font-bold text-gray-900 border-x border-gray-300 select-none">
          {quantity}
        </span>
        {/* Increment button */}
        <button
          type="button"
          onClick={() => update(quantity + 1)}
          disabled={quantity >= max}
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      {/* Show stock warning when running low */}
      {max <= 5 && max > 0 && (
        <span className="text-xs text-red-500 font-medium">
          Only {max} left!
        </span>
      )}
    </div>
  );
}
