"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormValidation } from "@/hooks/Forms/useFormValidation";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useState } from "react";
import { FormField } from "@/components/forms/FormField";

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
}

export function PhoneInput({
  label,
  value,
  onChange,
  onVerify,
  verified = false,
  required = false,
  placeholder,
  disabled = false,
  className,
  maxLength = 10,
}: PhoneInputProps) {
  const t = useTranslations("profileSettings");
  const defaultPlaceholder = placeholder || t("enter10DigitNumber");
  const { validatePhone } = useFormValidation();
  const [error, setError] = useState<string>("");

  const handleChange = (inputValue: string) => {
    // Only allow digits and limit length
    const cleanValue = inputValue.replace(/\D/g, "").slice(0, maxLength);

    // Validate
    const validationError = validatePhone(cleanValue);
    setError(validationError || "");

    onChange(cleanValue);
  };

  const handleVerify = () => {
    if (value && !error && onVerify) {
      onVerify(value);
    }
  };

  const canVerify =
    value.length === maxLength && !error && !verified && onVerify;

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      {...(className && { className })}
    >
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={defaultPlaceholder}
          disabled={disabled}
          className={`pr-20 ${error ? "border-red-500" : ""}`}
        />

        {canVerify && (
          <Button
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs px-2"
            onClick={handleVerify}
            disabled={disabled}
          >
            {t("verify")}
          </Button>
        )}

        {verified && (
          <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-800 text-xs">
            <Check className="h-3 w-3 mr-1" />
            {t("verified")}
          </Badge>
        )}
      </div>
    </FormField>
  );
}
