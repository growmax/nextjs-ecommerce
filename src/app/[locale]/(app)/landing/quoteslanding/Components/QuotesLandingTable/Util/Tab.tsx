"use client";

import { X } from "lucide-react";
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
    <div
      onClick={onSelect}
      className={`relative group cursor-pointer transition-all duration-200 ${
        isActive ? "z-20" : "z-10 hover:z-15"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-all duration-300 ease-out
          ${
            isActive
              ? "bg-white border-gray-300 border-b-transparent rounded-t-lg shadow-[0_-2px_8px_rgba(0,0,0,0.05)] scale-[1.02] translate-y-[-1px]"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:translate-y-[-1px] rounded-t-lg border-b-gray-300"
          }`}
        style={{
          marginBottom: isActive ? "-1px" : "0",
          clipPath: "inset(-8px -8px 0px -8px)", // This creates a shadow only on top
        }}
      >
        <span className="whitespace-nowrap">{label}</span>
        {allowClose && onClose && (
          <button
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onClose();
            }}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <div className="p-1 rounded-full hover:bg-gray-200">
              <X className="w-3 h-3 text-gray-500" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
