"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ShoppingCart, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryActionsProps {
  isOrder?: boolean;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Action buttons component for summary pages
 * Provides submit and cancel buttons with loading states
 *
 * @param isOrder - Whether this is an order (true) or quote (false)
 * @param isSubmitting - Whether form is currently submitting
 * @param onSubmit - Submit handler
 * @param onCancel - Cancel handler
 * @param submitLabel - Custom submit button label
 * @param cancelLabel - Custom cancel button label
 * @param className - Additional CSS classes
 * @param disabled - Whether buttons should be disabled
 */
export default function SummaryActions({
  isOrder = false,
  isSubmitting = false,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  className,
  disabled = false,
}: SummaryActionsProps) {
  const defaultSubmitLabel = isOrder ? "Place Order" : "Request Quote";
  const defaultCancelLabel = "Cancel";

  return (
    <Card className={cn("sticky bottom-0 z-50 shadow-lg border-t", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || disabled}
            className="flex-1"
          >
            {cancelLabel || defaultCancelLabel}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || disabled}
            className="flex-1"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isOrder ? "Placing Order..." : "Creating Quote..."}
              </>
            ) : (
              <>
                {isOrder ? (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                {submitLabel || defaultSubmitLabel}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
