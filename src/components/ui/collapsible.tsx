"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
  icon,
  badge,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("border-b border-border/40 last:border-b-0", className)}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2 text-left">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <h3 className="text-base font-semibold">{title}</h3>
            {badge && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                ({badge})
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300">
          <div className="pb-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export {
    Collapsible,
    CollapsibleContent,
    CollapsibleSection,
    CollapsibleTrigger
};

