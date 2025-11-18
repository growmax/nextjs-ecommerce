"use client";

import { statusColor } from "@/components/custom/statuscolors";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MoreVertical, Pencil, RefreshCw, X } from "lucide-react";

export interface SalesHeaderButton {
  label: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link";
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SalesHeaderMenuOption {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface SalesHeaderProps {
  title: string;
  identifier: string;
  status?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  };
  onEdit?: () => void;
  onRefresh?: () => void;
  onClose?: () => void;
  onMenuClick?: () => void;
  menuOptions?: SalesHeaderMenuOption[];
  buttons?: SalesHeaderButton[];
  showEditIcon?: boolean;
  showRefresh?: boolean;
  showMenu?: boolean;
  showClose?: boolean;
  className?: string;
  loading?: boolean;
}

export default function SalesHeader({
  title,
  identifier: _identifier,
  status,
  onEdit,
  onRefresh,
  onClose,
  onMenuClick,
  menuOptions = [],
  buttons = [],
  showEditIcon = true,
  showRefresh = true,
  showMenu = true,
  showClose = true,
  className,
  loading = false,
}: SalesHeaderProps) {
  const { state, isMobile } = useSidebar();
  const leftOffset = isMobile
    ? "0px"
    : state === "expanded"
      ? "var(--sidebar-width)"
      : "var(--sidebar-width-icon)";

  return (
    <div
      className={cn(
        "fixed top-14 left-0 right-0 z-40 flex items-center justify-between gap-3 md:gap-4 px-3 md:px-4 py-3 md:py-3.5 bg-white border-b shadow-sm transition-all duration-200 min-h-[56px] md:min-h-[64px]",
        className
      )}
      style={{ left: leftOffset }}
    >
      {/* Left Section - Title, Identifier, and Status */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        {/* Title with Edit Icon */}
        <div className="flex items-center gap-2 min-w-0">
          {loading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
          )}
          {showEditIcon && onEdit && !loading && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="size-8 md:size-9 text-gray-500 hover:text-gray-700 hover:bg-gray-100 shrink-0"
            >
              <Pencil className="size-4 md:size-4.5" />
            </Button>
          )}
        </div>

        {/* Status Container */}
        {status && (
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {/* Status Badge */}
            {loading ? (
              <Skeleton className="h-6 w-25 " />
            ) : (
              <span
                className="px-2.5 py-1 rounded-full text-[10px] md:text-xs font-medium text-white whitespace-nowrap shrink-0 leading-tight"
                style={{
                  backgroundColor: statusColor(status.label.toUpperCase()),
                }}
              >
                {status.label
                  .split(" ")
                  .map(
                    word =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right Section - Action Buttons and Icons */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0 mt-1">
        {/* Custom Action Buttons */}
        {loading ? (
          <>
            <Skeleton className="h-9 w-20 md:w-24" />
            <Skeleton className="h-9 w-20 md:w-24" />
          </>
        ) : (
          buttons.map(button => (
            <Button
              key={button.label}
              variant={button.variant || "outline"}
              onClick={button.onClick}
              disabled={button.disabled}
              className="uppercase text-[10px] md:text-xs font-semibold px-3 md:px-4 py-2 h-9 md:h-10 whitespace-nowrap"
            >
              {button.icon && <span className="mr-1.5">{button.icon}</span>}
              {button.label}
            </Button>
          ))
        )}

        {/* Menu Icon with Dropdown */}
        {showMenu && (menuOptions.length > 0 || onMenuClick) && !loading && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 size-9 md:size-10"
              >
                <MoreVertical className="size-4 md:size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {menuOptions.map((option, index) => (
                <DropdownMenuItem
                  key={`menu-option-${index}`}
                  onClick={option.onClick}
                  disabled={option.disabled || false}
                  className="cursor-pointer"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              {onMenuClick && menuOptions.length === 0 && (
                <DropdownMenuItem onClick={onMenuClick}>
                  Menu Options
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Refresh Icon */}
        {showRefresh && onRefresh && !loading && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 size-9 md:size-10"
          >
            <RefreshCw className="size-4 md:size-5" />
          </Button>
        )}

        {/* Close Icon */}
        {showClose && onClose && !loading && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 size-9 md:size-10"
          >
            <X className="size-4 md:size-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
