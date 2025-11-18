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
      <div className={cn("border rounded-lg", className)}>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 text-left">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <h3 className="text-lg font-semibold">{title}</h3>
            {badge && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {badge}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300">
          <div className="border-t bg-muted/20 p-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export {
  Collapsible,
  CollapsibleContent,
  CollapsibleSection,
  CollapsibleTrigger,
};
