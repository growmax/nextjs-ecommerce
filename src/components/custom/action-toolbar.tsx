"use client";

import * as React from "react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "./loading-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslations } from "next-intl";
import type {
  ActionToolbarProps,
  ActionToolbarRef,
  SelectionCount,
} from "@/types/action-toolbar";

/**
 * Utility function to pluralize words
 */
const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => {
  if (count === 1 || count === -1) return singular;
  return plural || `${singular}s`;
};

/**
 * Action Toolbar Component
 *
 * A contextual toolbar that appears when items are selected or during form editing.
 * Supports both bulk actions for selected items and form save/cancel actions.
 *
 * Features:
 * - Smooth slide-in animation
 * - Mobile-responsive design
 * - Form mode for save/cancel actions
 * - Bulk mode for multi-item actions
 * - Customizable positioning and styling
 * - Loading states for async actions
 * - Automatic pluralization
 */
const ActionToolbar = forwardRef<ActionToolbarRef, ActionToolbarProps>(
  (
    {
      show,
      mode = "bulk",
      formActions,
      primaryAction = { condition: false, text: "", clickAction: () => {} },
      secondaryAction = { condition: false, text: "", clickAction: () => {} },
      moreOptions = { condition: false, text: "", clickAction: () => {} },
      checkAllAction = { condition: false, text: "", clickAction: () => {} },
      onUncheckAll,
      selectionText,
      itemName = "item",
      itemNamePlural,
      className,
      position = "fixed",
      zIndex = 50,
      width = "100%",
      top = "auto",
      children,
      animation = { enabled: true, duration: 200 },
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const toolbarRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("toolbar");
    const tButtons = useTranslations("buttons");

    useImperativeHandle(ref, () => ({
      focus: () => {
        toolbarRef.current?.focus();
      },
      hide: () => {
        // Custom hide logic if needed
      },
    }));

    // Determine if toolbar should be visible
    const isVisible = typeof show === "boolean" ? show : show > 0;
    const selectionCount = typeof show === "number" ? show : 0;

    // Generate selection text
    const getSelectionText = (): string => {
      if (selectionText) return selectionText;

      if (mode === "form") return t("unsavedChanges");

      if (selectionCount > 0) {
        const itemText = pluralize(selectionCount, itemName, itemNamePlural);
        return `${selectionCount} ${itemText} ${t("selected")}`;
      }

      return "";
    };

    if (!isVisible) return null;

    const ToolbarContent = () => (
      <>
        {/* Left Section - Info and Actions */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Selection Info */}
          <div className="text-sm font-medium text-foreground">
            {getSelectionText()}
          </div>

          {/* Uncheck All Button (Bulk Mode Only) */}
          {mode === "bulk" && onUncheckAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUncheckAll}
              className="text-primary hover:text-primary/80"
            >
              {t("uncheckAll")}
            </Button>
          )}

          {/* Check All Action (Bulk Mode Only) */}
          {mode === "bulk" && checkAllAction.condition && (
            <LoadingButton
              loading={!!checkAllAction.loading}
              onClick={checkAllAction.clickAction}
              variant={checkAllAction.variant || "default"}
              size="sm"
              className="gap-2"
            >
              {checkAllAction.icon}
              {checkAllAction.text}
            </LoadingButton>
          )}
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-2">
          {mode === "form" && formActions ? (
            /* Form Mode - Save/Cancel */
            <>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={formActions.onCancel}
                disabled={formActions.isSubmitting}
              >
                {formActions.cancelText || tButtons("cancel")}
              </Button>

              <LoadingButton
                loading={!!formActions.isSubmitting}
                onClick={formActions.onSave}
                size={isMobile ? "sm" : "default"}
              >
                {formActions.saveText || tButtons("save")}
              </LoadingButton>
            </>
          ) : (
            /* Bulk Mode - Action Buttons */
            <>
              {/* Secondary Action */}
              {secondaryAction.condition && (
                <Button
                  variant={secondaryAction.variant || "outline"}
                  size={isMobile ? "sm" : "default"}
                  onClick={secondaryAction.clickAction}
                  className="gap-2"
                >
                  {secondaryAction.icon}
                  {!isMobile && secondaryAction.text}
                </Button>
              )}

              {/* Primary Action */}
              {primaryAction.condition && (
                <LoadingButton
                  loading={!!primaryAction.loading}
                  onClick={primaryAction.clickAction}
                  variant={primaryAction.variant || "default"}
                  size={isMobile ? "sm" : "default"}
                  className="gap-2"
                >
                  {primaryAction.icon}
                  {!isMobile && primaryAction.text}
                </LoadingButton>
              )}

              {/* More Options */}
              {moreOptions.condition && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={moreOptions.clickAction}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("moreOptions")}</TooltipContent>
                </Tooltip>
              )}

              {/* Custom Children */}
              {children}
            </>
          )}
        </div>
      </>
    );

    const toolbarClasses = cn(
      // Base styles
      "bg-primary/10 backdrop-blur-sm border border-primary/20",
      "shadow-lg rounded-lg",

      // Positioning
      position === "fixed" && "fixed left-4 right-4",
      position === "sticky" && "sticky",
      position === "absolute" && "absolute left-0 right-0",
      position === "relative" && "relative",

      // Mobile positioning
      isMobile
        ? "bottom-4 mx-2"
        : position === "fixed"
          ? "bottom-4 max-w-screen-xl mx-auto left-1/2 -translate-x-1/2"
          : "",

      // Animation
      animation.enabled && [
        "transition-all duration-200",
        "animate-in slide-in-from-bottom-2 fade-in-0",
      ],

      className
    );

    return (
      <div
        ref={toolbarRef}
        className={toolbarClasses}
        style={{
          zIndex,
          width: typeof width === "string" ? width : undefined,
          top: top !== "auto" ? top : undefined,
          animationDuration: animation.enabled
            ? `${animation.duration}ms`
            : undefined,
        }}
        role="toolbar"
        aria-label={mode === "form" ? "Form actions" : "Bulk actions"}
        {...props}
      >
        <div
          className={cn(
            "px-4 py-3",
            "flex items-center justify-between gap-4",
            isMobile && "flex-col gap-3"
          )}
        >
          <ToolbarContent />
        </div>
      </div>
    );
  }
);

ActionToolbar.displayName = "ActionToolbar";

export { ActionToolbar, pluralize };
export type { ActionToolbarProps, ActionToolbarRef, SelectionCount };
