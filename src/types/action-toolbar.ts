import { ReactNode } from "react";

export interface BulkAction {
  condition: boolean;
  text: string;
  clickAction: () => void;
  loading?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary";
  icon?: ReactNode;
}

export interface FormActions {
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  saveText?: string;
  cancelText?: string;
}

export interface ActionToolbarProps {
  /** Whether to show the toolbar (usually based on selection count) */
  show: boolean | number;

  /** Whether this is a form toolbar or bulk action toolbar */
  mode?: "form" | "bulk";

  /** Form-specific actions */
  formActions?: FormActions;

  /** Primary bulk action configuration */
  primaryAction?: BulkAction;

  /** Secondary bulk action configuration */
  secondaryAction?: BulkAction;

  /** More options action configuration */
  moreOptions?: BulkAction;

  /** Check all action configuration */
  checkAllAction?: BulkAction;

  /** Function to uncheck all selected items */
  onUncheckAll?: () => void;

  /** Custom text for the selection count */
  selectionText?: string;

  /** Singular item name for pluralization */
  itemName?: string;

  /** Plural item name for pluralization */
  itemNamePlural?: string;

  /** Custom CSS classes */
  className?: string;

  /** Custom positioning */
  position?: "fixed" | "sticky" | "absolute" | "relative";

  /** Custom z-index */
  zIndex?: number;

  /** Toolbar width */
  width?: string | Record<string, string>;

  /** Custom top position */
  top?: string;

  /** Children components */
  children?: ReactNode;

  /** Animation configuration */
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
}

export interface ActionToolbarRef {
  focus: () => void;
  hide: () => void;
}

export type SelectionCount = number | boolean;
