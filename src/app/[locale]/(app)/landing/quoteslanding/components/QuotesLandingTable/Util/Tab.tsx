"use client";

import { X, ChevronDown } from "lucide-react";
import { MouseEvent } from "react";

interface TabProps {
  label: string;
  isActive: boolean;
  onSelect: () => void;
  onClose: (() => void) | undefined;
  allowClose: boolean;
}

export function Tab({
  label,
  isActive,
  onSelect,
  onClose,
  allowClose = true,
}: TabProps) {
  return (
    <div onClick={onSelect} className="relative group cursor-pointer">
      <div className="flex items-center gap-1 px-3 py-3">
        <span
          className={`text-sm font-medium whitespace-nowrap transition-colors ${
            isActive ? "text-purple-600" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {label}
        </span>

        {/* Filter dropdown icon */}
        <ChevronDown
          className={`w-4 h-4 transition-colors ${
            isActive ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
          }`}
        />

        {/* Close button */}
        {allowClose && onClose && (
          <button
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onClose();
            }}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>

      {/* Underline indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 transition-all duration-200" />
      )}
    </div>
  );
}
