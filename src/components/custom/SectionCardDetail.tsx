"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React from "react";

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
  return (
    <div
      className={cn("grid grid-cols-2 gap-4 py-1.5 items-center", className)}
    >
      <div>
        <p className="text-sm font-normal text-gray-900">{label}</p>
      </div>
      <div className="relative">
        <Input
          type="date"
          value={value || ""}
          onChange={e => onChange?.(e.target.value)}
          className="text-sm h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 pr-10"
        />
      </div>
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
