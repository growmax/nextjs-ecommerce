"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  identifier,
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
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 px-3 md:px-4 py-2 md:py-3 bg-white border-b",
        className
      )}
    >
      {/* Left Section - Title, Identifier, and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
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
              className="size-7 md:size-8 text-gray-500 hover:text-gray-700 shrink-0"
            >
              <Pencil className="size-3.5 md:size-4" />
            </Button>
          )}
        </div>

        {/* Identifier and Status Container */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Identifier */}
          {loading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <span className="text-xs md:text-sm font-medium text-gray-600 truncate">
              {identifier}
            </span>
          )}

          {/* Status Badge */}
          {loading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            status && (
              <Badge
                variant={status.variant || "secondary"}
                className={cn(
                  "uppercase text-[10px] md:text-xs font-semibold px-2 md:px-3 py-0.5 md:py-1 shrink-0",
                  status.className
                )}
              >
                {status.label}
              </Badge>
            )
          )}
        </div>
      </div>

      {/* Right Section - Action Buttons and Icons */}
      <div className="flex items-center gap-1.5 md:gap-2 self-end md:self-auto">
        {/* Custom Action Buttons */}
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 md:w-24" />
            <Skeleton className="h-8 w-20 md:w-24" />
          </>
        ) : (
          buttons.map(button => (
            <Button
              key={button.label}
              variant={button.variant || "outline"}
              onClick={button.onClick}
              disabled={button.disabled}
              className="uppercase text-[10px] md:text-xs font-semibold px-2 md:px-4 py-1.5 md:py-2 h-7 md:h-9 whitespace-nowrap"
            >
              {button.icon && <span className="mr-1">{button.icon}</span>}
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
                className="text-gray-500 hover:text-gray-700 size-7 md:size-9"
              >
                <MoreVertical className="size-4 md:size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* eslint-disable react/no-array-index-key */}
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
              {/* eslint-enable react/no-array-index-key */}
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
            className="text-gray-500 hover:text-gray-700 size-7 md:size-9"
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
            className="text-gray-500 hover:text-gray-700 size-7 md:size-9"
          >
            <X className="size-4 md:size-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
