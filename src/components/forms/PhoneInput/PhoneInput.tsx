"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormValidation } from "@/hooks/Forms/useFormValidation";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormField } from "../FormField/FormField";

interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onVerify?: (phone: string) => void;
  verified?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  countryCode?: string;
  // originalValue allows parent to supply the original number (for RHF dirty checks)
  originalValue?: string | null;
  // External error message (overrides internal validation)
  error?: string;
}

export function PhoneInput({
  label,
  value,
  onChange,
  onVerify,
  verified = false,
  required = false,
  placeholder = "Enter 10-digit number",
  disabled = false,
  className,
  maxLength = 10,
  // originalValue can be provided by parent (e.g., RHF dirty/original value)
  originalValue,
  countryCode,
  error: externalError,
}: PhoneInputProps) {
  const { validatePhone } = useFormValidation();
  const [internalError, setInternalError] = useState<string>("");
  
  // Use external error if provided, otherwise use internal error
  const error = externalError || internalError;
  // keep the initial value so we can tell if the user entered a new number
  const initialValueRef = useRef<string | null>(null);

  useEffect(() => {
    // prefer explicit originalValue when provided (e.g., parent RHF original)
    if (initialValueRef.current === null) {
      initialValueRef.current = originalValue ?? value ?? "";
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (inputValue: string) => {
    // Only allow digits and limit length
    const cleanValue = inputValue.replace(/\D/g, "").slice(0, maxLength);

    // Validate (only if no external error)
    if (!externalError) {
      const validationError = validatePhone(cleanValue);
      setInternalError(validationError || "");
    }

    onChange(cleanValue);
  };

  const handleVerify = () => {
    if (value && !error && onVerify) {
      onVerify(value);
    }
  };

  const canVerify =
    // allow verify when there's a valid phone number and it's not already verified
    value.length >= 10 &&
    !error &&
    !verified &&
    onVerify;

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      {...(className && { className })}
    >
      <div>
        <div className="relative">
          {/* country code prefix inside input */}
          {countryCode && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {countryCode}
            </div>
          )}
          <Input
            type="text"
            value={value}
            onChange={e => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`pr-20 ${countryCode ? "pl-10" : ""} ${error ? "border-red-500" : ""}`}
          />

          {canVerify && (
            <Button
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 text-xs px-4"
              onClick={handleVerify}
              disabled={disabled}
            >
              Verify
            </Button>
          )}

          {verified && (
            <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-800 text-xs">
              <Check className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>
    </FormField>
  );
}
