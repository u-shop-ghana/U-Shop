"use client";

// ─── Toggle Component ───────────────────────────────────────────
// Switch toggle matching the "Verify as Student" toggle style
// already used in the register page.

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  icon?: string; // Material Symbols icon name
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  className = "",
}: ToggleProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-[#6B1FA8]/10 border border-[#6B1FA8]/30 rounded-xl ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {/* Label section with optional icon */}
      <div className="flex gap-3 items-center">
        {icon && (
          <span className="material-symbols-outlined text-[#6B1FA8]">
            {icon}
          </span>
        )}
        {(label || description) && (
          <div>
            {label && (
              <p className="text-sm font-bold text-gray-900">{label}</p>
            )}
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>

      {/* Switch rail — matches the register page toggle styling */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer
            peer-checked:after:translate-x-full peer-checked:after:border-white
            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:border-gray-300 after:border after:rounded-full
            after:h-5 after:w-5 after:transition-all
            peer-checked:bg-[#6B1FA8]`}
        />
      </label>
    </div>
  );
}
