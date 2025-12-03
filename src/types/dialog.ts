import * as React from "react";

/**
 * Common dialog size variants
 */
export type DialogSize = "sm" | "md" | "lg" | "xl" | "full" | "auto";

/**
 * Common dialog variant types
 */
export type DialogVariant = "default" | "destructive" | "warning" | "info";

/**
 * Base dialog props that all dialogs should extend
 */
export interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: DialogSize;
  variant?: DialogVariant;
  showCloseButton?: boolean;
  preventCloseOnOverlayClick?: boolean;
  preventCloseOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Confirmation dialog props
 */
export interface ConfirmationDialogProps extends BaseDialogProps {
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  confirmVariant?: "default" | "destructive";
  icon?: React.ReactNode;
}

/**
 * Form dialog props
 */
export interface FormDialogProps extends BaseDialogProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Info dialog props (display only)
 */
export interface InfoDialogProps extends BaseDialogProps {
  onClose?: () => void;
  closeText?: string;
  children: React.ReactNode;
}

/**
 * Action dialog props (custom actions)
 */
export interface ActionDialogProps extends BaseDialogProps {
  actions?: React.ReactNode;
  children: React.ReactNode;
}
