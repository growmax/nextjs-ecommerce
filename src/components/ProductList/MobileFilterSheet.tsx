"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { useState } from "react";
import { FilterSection } from "@/components/ProductList/FilterSection";

/**
 * MobileFilterSheet Component
 * Mobile drawer for filters
 */
export function MobileFilterSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96 z-[110] pt-10 px-4">
        <SheetHeader>
          <SheetTitle className="sr-only">Filters</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full pr-4 mt-0">
          <FilterSection />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
