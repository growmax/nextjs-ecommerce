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
            className="flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-600 
              hover:bg-gray-100 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Filter</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
