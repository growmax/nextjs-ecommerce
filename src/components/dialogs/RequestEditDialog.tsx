"use client";

import { ConfirmationDialog } from "@/components/dialogs/common";
import type { BaseDialogProps } from "@/types/dialog";
import { Pencil } from "lucide-react";

export interface RequestEditDialogProps
  extends Omit<BaseDialogProps, "title" | "description" | "onConfirm"> {
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

/**
 * RequestEditDialog - Dialog for requesting edit access to an order
 *
 * Uses the common ConfirmationDialog component for consistent UX.
 */
export function RequestEditDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: RequestEditDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request Edit"
      description="This will place a request for edit with the order recipient."
      onConfirm={onConfirm}
      confirmText="YES"
      cancelText="CANCEL"
      isLoading={loading}
      icon={<Pencil className="h-4 w-4 text-gray-700" />}
      size="sm"
      showCloseButton={false}
    />
  );
}
