"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export function FormField({
  label,
  required = false,
  error,
  hint,
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn("text-sm font-medium", labelClassName)}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="hover:bg-muted/50 transition-colors rounded-lg">
        {children}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
