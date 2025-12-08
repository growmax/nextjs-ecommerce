"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface SectionCardDetailProps {
  title: string;
  children: React.ReactNode;
  headerColor?:
    | "default"
    | "muted"
    | "accent"
    | "primary"
    | "secondary"
    | "green";
  shadow?: "none" | "sm" | "md" | "lg";
  showSeparator?: boolean;
  className?: string;
  headerClassName?: string;
  headerContainerClassName?: string;
  contentClassName?: string;
  headerActions?: React.ReactNode;
  headerDescription?: string | React.ReactNode;
}

// InfoRow component for consistent label-value display
interface InfoRowProps {
  label: string;
  value?: string | React.ReactNode;
  showEmpty?: boolean;
  className?: string;
}

export function InfoRow({
  label,
  value,
  showEmpty = false,
  className,
}: InfoRowProps) {
  if (!value && !showEmpty) return null;

  return (
    <div className={cn("grid grid-cols-2 gap-4 py-1.5", className)}>
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div>
        {typeof value === "string" ? (
          <p className="text-sm font-semibold text-gray-900">{value || "-"}</p>
        ) : (
          <div className="text-sm font-semibold text-gray-900">
            {value || "-"}
          </div>
        )}
      </div>
    </div>
  );
}

// SkeletonRow component for loading states
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 py-1.5", className)}>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}

// EditableDateRow component for date inputs
interface EditableDateRowProps {
  label: string;
  value?: string;
  onChange?: (date: string) => void;
  className?: string;
}

export function EditableDateRow({
  label,
  value,
  onChange,
  className,
}: EditableDateRowProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Format date value to dd/mm/yyyy for display
  const formatDateForDisplay = (dateValue?: string): string => {
    if (!dateValue) return "";
    
    try {
      // Try parsing as ISO string or Date object
      const date = new Date(dateValue);
      if (isValid(date)) {
        return format(date, "dd/MM/yyyy");
      }
      
      // If already in dd/mm/yyyy format, return as is
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        return dateValue;
      }
    } catch {
      // Invalid date, return empty
    }
    
    return "";
  };

  // Parse user input (dd/mm/yyyy) to Date object
  const parseDateInput = (input: string): Date | null => {
    if (!input || !/^\d{2}\/\d{2}\/\d{4}$/.test(input.trim())) {
      return null;
    }

    try {
      // Parse dd/mm/yyyy format
      const parsed = parse(input.trim(), "dd/MM/yyyy", new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      // Invalid date
    }
    
    return null;
  };

  // Convert Date to ISO string for onChange callback
  const convertDateToString = (date: Date | undefined): string => {
    if (!date) return "";
    return date.toISOString();
  };

  // Convert string value to Date for Calendar
  const getDateFromValue = (dateValue?: string): Date | undefined => {
    if (!dateValue) return undefined;
    
    try {
      const date = new Date(dateValue);
      if (isValid(date)) {
        return date;
      }
    } catch {
      // Invalid date
    }
    
    return undefined;
  };

  // Handle manual typing in input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typedValue = e.target.value;
    setInputValue(typedValue);

    // If format matches dd/mm/yyyy, parse and call onChange
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(typedValue.trim())) {
      const parsedDate = parseDateInput(typedValue);
      if (parsedDate) {
        // Convert to ISO string for onChange callback
        onChange?.(parsedDate.toISOString());
        // Clear inputValue so it uses the formatted value from prop
        setInputValue("");
      }
    }
  };

  // Handle input blur - validate and format
  const handleInputBlur = () => {
    if (inputValue) {
      const parsedDate = parseDateInput(inputValue);
      if (parsedDate) {
        onChange?.(parsedDate.toISOString());
      }
      // Clear inputValue to show formatted value from prop
      setInputValue("");
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const isoString = convertDateToString(date);
      onChange?.(isoString);
      setInputValue(""); // Clear inputValue to show formatted value
      setOpen(false);
    }
  };

  // Get display value - use inputValue if user is typing, otherwise format the prop value
  const displayValue = inputValue || formatDateForDisplay(value);

  return (
    <div
      className={cn("grid grid-cols-2 gap-4 py-1.5 items-center", className)}
    >
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
  <div className="w-full">
    <InputGroup className="w-full">
      <InputGroupInput
        placeholder="dd/mm/yyyy"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        // Remove onFocus handler
      />
      <InputGroupAddon align="inline-end">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-auto w-auto p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
      </InputGroupAddon>
    </InputGroup>
  </div>
      
        <PopoverContent className="w-[280px] p-0">
          <Calendar mode="single"    selected={getDateFromValue(value)}  onSelect={handleDateSelect} className="w-full"/>
        </PopoverContent>
      </Popover>

    </div>
  );
}

// EditableTextRow component for text inputs
interface EditableTextRowProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function EditableTextRow({
  label,
  value,
  onChange,
  placeholder,
  className,
}: EditableTextRowProps) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-4 py-1.5 items-center", className)}
    >
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div>
        <Input
          type="text"
          value={value || ""}
          onChange={e => onChange?.(e.target.value)}
          className="text-sm h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50"
          placeholder={placeholder || label}
        />
      </div>
    </div>
  );
}

export default function SectionCardDetail({
  title,
  children,
  headerColor = "muted",
  shadow = "sm",
  showSeparator = false,
  className,
  headerClassName,
  headerContainerClassName,
  contentClassName,
  headerActions,
  headerDescription,
}: SectionCardDetailProps) {
  // Map headerColor to background classes
  const headerColorClasses = {
    default: "!bg-white",
    muted: "!bg-muted",
    accent: "!bg-accent/10",
    primary: "!bg-primary/10",
    secondary: "!bg-secondary/10",
    green: "!bg-green-100",
  };

  // Map shadow to shadow classes
  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <Card
      className={cn(
        "pb-0 py-0 gap-0 overflow-hidden",
        shadowClasses[shadow],
        className
      )}
    >
      {title && (
        <>
          <CardHeader
            className={cn(
              "px-6 py-2 rounded-t-lg items-end gap-0 relative z-10",
              headerColorClasses[headerColor],
              headerClassName
            )}
          >
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1",
                headerContainerClassName
              )}
            >
              <div className="flex flex-col">
                <CardTitle className="text-xl font-semibold text-gray-900 m-0!">
                  {title}
                </CardTitle>
                {headerDescription && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {headerDescription}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center gap-2">{headerActions}</div>
              )}
            </div>
          </CardHeader>
          {showSeparator && <Separator />}
        </>
      )}
      <CardContent className={cn("px-6 pt-2 pb-4 gap-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
