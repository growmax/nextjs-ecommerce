"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import SearchBox from "./search";

interface SearchDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ open, onClose }: SearchDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="top" className="h-auto p-6">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Search</h2>
          <SearchBox size="md" autoFocus />
        </div>
      </SheetContent>
    </Sheet>
  );
}
