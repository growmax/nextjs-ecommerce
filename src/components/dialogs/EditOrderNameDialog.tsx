"use client";

import { FormDialog } from "@/components/dialogs/common";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BaseDialogProps } from "@/types/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
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

export interface EditOrderNameDialogProps
  extends Omit<BaseDialogProps, "title" | "description"> {
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

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(onSubmit)(e);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit Order Name"
      onSubmit={handleFormSubmit}
      isLoading={loading || isSubmitting}
      submitText="Save"
      cancelText="Cancel"
      size="sm"
      showCloseButton={false}
      onCancel={handleCancel}
      disabled={
        !isValid ||
        !currentFormValue ||
        currentFormValue.trim() === currentOrderName.trim()
      }
    >
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
    </FormDialog>
  );
}
