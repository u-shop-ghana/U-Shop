// ─── Component Library Barrel Exports ────────────────────────────
// Import components from '@/components' for cleaner imports.
//
// Usage:
//   import { Button, Badge, Input, ProductCard, Modal } from '@/components';

// ── UI Atoms ──
export { Button } from "./ui/Button";
export type { ButtonProps } from "./ui/Button";

export { Badge, ConditionBadge, VerificationBadge, StockBadge } from "./ui/Badge";

export { Input } from "./ui/Input";
export type { InputProps } from "./ui/Input";

export { Textarea } from "./ui/Textarea";
export type { TextareaProps } from "./ui/Textarea";

export { Select } from "./ui/Select";
export type { SelectProps } from "./ui/Select";

export { Toggle } from "./ui/Toggle";

// ── Cards (Molecules) ──
export { Card, CardHeader, CardContent, CardFooter } from "./cards/Card";
export { ProductCard } from "./cards/ProductCard";
export { SearchBar } from "./cards/SearchBar";

// ── Modals (Molecules) ──
export { Modal } from "./modals/Modal";
export { ConfirmModal } from "./modals/ConfirmModal";

// ── Layout (Organisms) ──
export { Header } from "./layout/Header";
export { Footer } from "./layout/Footer";
export { EmptyState } from "./layout/EmptyState";
