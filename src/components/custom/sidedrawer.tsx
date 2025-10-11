"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  onClearAll?: () => void;
  onApply?: () => void;
  onSave?: () => void;
  width?: number;
  mode?: "filter" | "create"; // New prop to control button mode
}

const SideDrawer: React.FC<SideDrawerProps> = ({
  open,
  onClose,
  title = "Filters",
  children,
  onClearAll,
  onApply,
  onSave,
  mode = "filter",
}) => {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="w-[320px] flex flex-col p-0 gap-0 [&>button]:hidden"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
          <SheetTitle className="text-lg font-semibold text-gray-900">
            {title}
          </SheetTitle>
          {mode === "filter" && onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-black hover:text-gray-800 hover:bg-gray-100 uppercase font-medium text-xs tracking-wide"
            >
              CLEAR ALL
            </Button>
          )}
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">{children}</div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t">
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-black border-black hover:bg-gray-50"
            >
              CANCEL
            </Button>
            {mode === "filter" && onApply && (
              <Button
                size="sm"
                onClick={onApply}
                className="bg-black hover:bg-gray-800 text-white"
              >
                APPLY
              </Button>
            )}
            {mode === "create" && onSave && (
              <Button
                size="sm"
                onClick={onSave}
                className="bg-black hover:bg-gray-800 text-white"
              >
                SAVE
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SideDrawer;
