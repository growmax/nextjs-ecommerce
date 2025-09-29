"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { FormField } from "./FormField";

interface AutoCompleteOption {
  value: string;
  label: string;
}

interface AutoCompleteFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: AutoCompleteOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function AutoCompleteField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  error,
  hint,
  disabled = false,
  className,
}: AutoCompleteFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>();

  useEffect(() => {
    if (triggerRef.current) {
      setDropdownWidth(triggerRef.current.offsetWidth);
    }
  }, [triggerRef.current?.offsetWidth]);

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption?.label || value;

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between border rounded-lg px-2.5 py-1.5 text-sm text-left font-normal"
            ref={triggerRef}
          >
            <span className="truncate">{displayValue || placeholder}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 rounded-lg shadow-md"
          style={{ width: dropdownWidth }}
        >
          <Command>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex justify-between px-2 py-1.5 text-sm cursor-pointer select-none rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </FormField>
  );
}
