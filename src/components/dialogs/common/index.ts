/**
 * Common Dialog Components
 *
 * This module exports standardized dialog components for consistent UX across the application.
 *
 * Available components:
 * - ConfirmationDialog: For confirmation dialogs with confirm/cancel actions
 * - FormDialog: For dialogs containing forms
 * - InfoDialog: For information/display dialogs
 * - ActionDialog: For dialogs with custom actions
 *
 * All dialogs follow shadcn/ui patterns and provide:
 * - Consistent styling and spacing
 * - Mobile responsiveness
 * - Loading states
 * - Accessibility features
 * - Type safety
 */

export { ConfirmationDialog } from "./ConfirmationDialog";
export { FormDialog } from "./FormDialog";
export { InfoDialog } from "./InfoDialog";
export { ActionDialog } from "./ActionDialog";

export type {
  BaseDialogProps,
  ConfirmationDialogProps,
  FormDialogProps,
  InfoDialogProps,
  ActionDialogProps,
  DialogSize,
  DialogVariant,
} from "@/types/dialog";
