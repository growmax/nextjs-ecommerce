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
    // reduced vertical spacing so inputs are closer together
    <div className={cn("space-y-1", className)}>
      {/* smaller label text to make labels less prominent */}
      <Label className={cn("text-xs font-medium", labelClassName)}>
        {label}
        {required && <span className="text-red-500 ml-0">*</span>}
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
