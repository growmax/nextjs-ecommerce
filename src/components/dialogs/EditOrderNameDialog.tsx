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

// Helper function to create validation schema with custom messages
const createOrderNameSchema = (nameType: string = "Order") => {
  return z.object({
    orderName: z
      .string()
      .min(1, `${nameType} name is required`)
      .min(3, `${nameType} name must be at least 3 characters`)
      .max(100, `${nameType} name must be less than 100 characters`)
      .regex(
        /^[a-zA-Z0-9\s\-_.,()&']+$/,
        `${nameType} name contains invalid characters`
      ),
  });
};

// Type for form data
type OrderNameFormData = z.infer<ReturnType<typeof createOrderNameSchema>>;

export interface EditOrderNameDialogProps
  extends Omit<BaseDialogProps, "title" | "description"> {
  currentOrderName: string;
  onSave: (newOrderName: string) => Promise<void>;
  loading?: boolean;
  title?: string;
  label?: string;
  placeholder?: string;
  successMessage?: string;
  errorMessage?: string;
  nameType?: string; // "Order" or "Quote" - used for validation messages
  showLabel?: boolean; // Whether to show the label above the input
}

export function EditOrderNameDialog({
  open,
  onOpenChange,
  currentOrderName,
  onSave,
  loading = false,
  title,
  label = "Order Name",
  placeholder = "Enter order name",
  successMessage = "Order name updated successfully",
  errorMessage = "Failed to update order name",
  nameType = "Order",
  showLabel = false,
}: EditOrderNameDialogProps) {
  // Auto-generate title based on nameType if not provided
  // Ensure title is always a plain string, not a translation key
  const dialogTitle = React.useMemo(() => {
    if (title) {
      // If title is provided, use it directly (should be a plain string like "Edit Quote Name")
      return title;
    }
    // Otherwise, generate from nameType
    return `Edit ${nameType} Name`;
  }, [title, nameType]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(currentOrderName);
  const prevOpenRef = React.useRef(open);
  const orderNameOnOpenRef = React.useRef(currentOrderName);

  // Create schema with custom name type
  const orderNameSchema = React.useMemo(
    () => createOrderNameSchema(nameType),
    [nameType]
  );

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<OrderNameFormData>({
    resolver: zodResolver(orderNameSchema),
    mode: "onChange",
    defaultValues: {
      orderName: currentOrderName,
    },
  });

  // Ref for input element to prevent auto-focus and auto-select
  const inputRef = React.useRef<HTMLInputElement>(null);
  const shouldPreventFocusRef = React.useRef(true);

  // Sync local state with form when dialog opens
  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Store the order name when dialog opens
      orderNameOnOpenRef.current = currentOrderName;
      // Set both local state and form value
      setInputValue(currentOrderName);
      setValue("orderName", currentOrderName, { shouldValidate: true });

      // Prevent auto-focus and auto-selection
      // Use multiple attempts to ensure we catch it after dialog animation
      shouldPreventFocusRef.current = true;

      const preventFocus = () => {
        if (inputRef.current) {
          // Blur if focused
          if (document.activeElement === inputRef.current) {
            inputRef.current.blur();
          }
          // Move cursor to end without selecting text
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      };

      // Try multiple times to catch any auto-focus behavior
      setTimeout(preventFocus, 0);
      setTimeout(preventFocus, 50);
      setTimeout(preventFocus, 100);
      setTimeout(preventFocus, 200);

      // After dialog is fully open, allow normal focus
      setTimeout(() => {
        shouldPreventFocusRef.current = false;
      }, 300);
    } else if (!open) {
      shouldPreventFocusRef.current = true;
    }
    prevOpenRef.current = open;
    // Only depend on 'open' to prevent resets while dialog is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: OrderNameFormData) => {
    // Validate that the name is not empty
    if (!data.orderName || data.orderName.trim().length === 0) {
      // Validation error will be shown by the form, don't submit
      return;
    }

    // If no changes, just close silently without showing any message
    if (data.orderName.trim() === currentOrderName.trim()) {
      onOpenChange(false);
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(data.orderName);
      toast.success(successMessage, {
        id: "edit-name-success", // Use ID to prevent duplicates
      });
      onOpenChange(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage;
      toast.error(errorMsg, {
        id: "edit-name-error", // Use ID to prevent duplicates
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setInputValue(orderNameOnOpenRef.current);
    setValue("orderName", orderNameOnOpenRef.current, {
      shouldValidate: false,
    });
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      setInputValue(orderNameOnOpenRef.current);
      setValue("orderName", orderNameOnOpenRef.current, {
        shouldValidate: false,
      });
    }
    onOpenChange(open);
  };

  // Handle input change - update both local state and form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setValue("orderName", newValue, { shouldValidate: true });
    trigger("orderName"); // Trigger validation
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // handleSubmit will only call onSubmit if validation passes
    // If validation fails, it will update the errors state and prevent submission
    await handleSubmit(onSubmit)(e);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={dialogTitle}
      onSubmit={handleFormSubmit}
      isLoading={loading || isSubmitting}
      submitText="Save"
      cancelText="Cancel"
      size="sm"
      showCloseButton={false}
      onCancel={handleCancel}
      disabled={false}
      onOpenAutoFocus={e => {
        // Prevent auto-focus on dialog open
        e.preventDefault();
      }}
    >
      <div className="space-y-2">
        {showLabel && (
          <Label htmlFor="orderName" className="text-sm font-medium">
            {label}
          </Label>
        )}
        <Input
          ref={inputRef}
          id="orderName"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full"
          disabled={loading || isSubmitting}
          autoFocus={false}
          tabIndex={0}
          onFocus={e => {
            // Prevent text selection on focus
            if (shouldPreventFocusRef.current) {
              e.target.blur();
              return;
            }
            const length = e.target.value.length;
            e.target.setSelectionRange(length, length);
          }}
          onMouseDown={e => {
            // Prevent text selection on mouse down if we're still preventing focus
            if (shouldPreventFocusRef.current) {
              e.preventDefault();
              // Allow focus after a short delay
              setTimeout(() => {
                shouldPreventFocusRef.current = false;
                if (inputRef.current) {
                  inputRef.current.focus();
                  const length = inputRef.current.value.length;
                  inputRef.current.setSelectionRange(length, length);
                }
              }, 0);
            }
          }}
          onClick={() => {
            // Ensure cursor is at end when clicking
            if (
              inputRef.current &&
              document.activeElement === inputRef.current
            ) {
              const length = inputRef.current.value.length;
              inputRef.current.setSelectionRange(length, length);
            }
          }}
        />
        {errors.orderName && (
          <p className="text-sm text-red-600">{errors.orderName.message}</p>
        )}
      </div>
    </FormDialog>
  );
}
