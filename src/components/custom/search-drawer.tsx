"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import SearchBox from "@/components/custom/search";

interface SearchDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ open, onClose }: SearchDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="top" className="h-auto p-6">
        <div className="space-y-6">
          <SheetTitle className="text-lg font-semibold">Search</SheetTitle>
          <SearchBox size="md" autoFocus />
        </div>
      </SheetContent>
    </Sheet>
  );
}
