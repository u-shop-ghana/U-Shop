"use client";

import { Modal } from "./Modal";
import { Button } from "../ui/Button";

// ─── ConfirmModal Component ─────────────────────────────────────
// Pre-built destructive action confirmation dialog.
// Design reference: design/ui-kit/molecules/modals.png ("Confirmation Modal")
// Uses high-contrast warning elements as described in the design.

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-center py-2">
        {/* Warning icon */}
        <div
          className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            variant === "danger"
              ? "bg-red-100 text-red-500"
              : "bg-amber-100 text-amber-500"
          }`}
        >
          <span className="material-symbols-outlined text-3xl">warning</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </Modal>
  );
}
