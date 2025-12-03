export interface SaveCancelAction {
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface SaveCancelTexts {
  saveText?: string;
  cancelText?: string;
  confirmText?: string;
}

export interface SaveCancelToolbarProps
  extends SaveCancelAction,
    SaveCancelTexts {
  show: boolean;
  className?: string;
  style?: React.CSSProperties;
  anchorSelector?: string;
}

import type { BaseDialogProps } from "./dialog";

export interface SaveCancelDialogProps
  extends SaveCancelAction,
    SaveCancelTexts,
    Omit<BaseDialogProps, "title" | "description" | "onOpenChange"> {
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  alertMode?: boolean;
}
