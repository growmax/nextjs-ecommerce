"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema for order name
const orderNameSchema = z.object({
  orderName: z
    .string()
    .min(1, "Order name is required")
    .min(3, "Order name must be at least 3 characters")
    .max(100, "Order name must be less than 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_.,()&']+$/,
      "Order name contains invalid characters"
    ),
});

type OrderNameFormData = z.infer<typeof orderNameSchema>;

export interface EditOrderNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOrderName: string;
  onSave: (newOrderName: string) => Promise<void>;
  loading?: boolean;
}

export function EditOrderNameDialog({
  open,
  onOpenChange,
  currentOrderName,
  onSave,
  loading = false,
}: EditOrderNameDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<OrderNameFormData>({
    resolver: zodResolver(orderNameSchema),
    defaultValues: {
      orderName: currentOrderName,
    },
  });

  // Watch the current form value to compare with original
  const currentFormValue = watch("orderName");

  // Ensure the input always shows the latest order name when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({ orderName: currentOrderName });
    }
  }, [open, currentOrderName, reset]);

  const onSubmit = async (data: OrderNameFormData) => {
    if (data.orderName === currentOrderName) {
      onOpenChange(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(data.orderName);
      toast.success("Order name updated successfully");
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update order name";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset({ orderName: currentOrderName });
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      reset({ orderName: currentOrderName });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md p-6" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Edit Order Name
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderName" className="text-sm font-medium">
              Order Name
            </Label>
            <Input
              id="orderName"
              {...register("orderName")}
              placeholder="Enter order name"
              className="w-full"
              disabled={loading || isSubmitting}
            />
            {errors.orderName && (
              <p className="text-sm text-red-600">{errors.orderName.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                isSubmitting ||
                !isValid ||
                !currentFormValue ||
                currentFormValue.trim() === currentOrderName.trim()
              }
              className="min-w-20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
