"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import * as React from "react";

export interface RequestEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function RequestEditDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: RequestEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
      onOpenChange(false);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-xs p-4" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Pencil className="h-4 w-4 text-gray-700" />
            Request Edit
          </DialogTitle>
        </DialogHeader>

        <div className="py-3">
          <p className="text-sm text-gray-600">
            This will place a request for edit with the order recipient.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={loading || isSubmitting}
            className="text-primary hover:text-primary/90 hover:bg-primary/10"
          >
            CANCEL
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleConfirm}
            disabled={loading || isSubmitting}
          >
            {isSubmitting ? "Processing..." : "YES"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
