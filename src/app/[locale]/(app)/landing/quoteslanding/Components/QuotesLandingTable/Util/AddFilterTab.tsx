"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";

interface AddFilterTabProps {
  onClick: () => void;
}

export function AddFilterTab({ onClick }: AddFilterTabProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="group flex items-center justify-center h-8 w-8 text-gray-500 hover:text-gray-700 
              border border-transparent hover:border-gray-300 hover:bg-gray-50 hover:translate-y-[-1px] rounded-t-lg 
              transition-all duration-300 ease-out active:scale-95"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Filter</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
