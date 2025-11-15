import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownGroup {
  label?: string;
  options: DropdownOption[];
}

interface FormDropdownProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string | React.ReactNode;
  description?: string;
  placeholder?: string;
  options?: DropdownOption[];
  groups?: DropdownGroup[];
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  required?: boolean;
  buttonVariant?:
    | "default"
    | "outline"
    | "ghost"
    | "secondary"
    | "destructive"
    | "link";
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  showCheckIcon?: boolean;
  onValueChange?: (value: string) => void;
}

export function FormDropdown<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = "Select an option",
  options = [],
  groups = [],
  triggerClassName,
  contentClassName,
  disabled = false,
  required = false,
  buttonVariant = "outline",
  align = "start",
  side = "bottom",
  showCheckIcon = true,
  onValueChange,
}: FormDropdownProps<TFieldValues, TName>) {
  // Determine if we're using groups or flat options
  const useGroups = groups.length > 0;
  const allOptions = useGroups
    ? groups.flatMap(group => group.options)
    : options;

  const getSelectedLabel = (value: string) => {
    const option = allOptions.find(opt => opt.value === value);
    return option?.label || placeholder;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;

        return (
          <FormItem>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={buttonVariant}
                    className={cn(
                      "w-full justify-between font-normal",
                      !field.value && "text-muted-foreground",
                      hasError && "border-destructive text-destructive",
                      triggerClassName
                    )}
                    disabled={disabled}
                    aria-invalid={hasError}
                  >
                    <span className="truncate">
                      {getSelectedLabel(field.value)}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    "w-[var(--radix-dropdown-menu-trigger-width)] max-h-80 overflow-y-auto z-50",
                    contentClassName
                  )}
                  align={align}
                  side={side}
                >
                  {useGroups ? (
                    groups.map(group => (
                      <div
                        key={group.label || `group-${group.options[0]?.value}`}
                      >
                        {group.label && (
                          <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                        )}
                        <DropdownMenuGroup>
                          {group.options.map(option => (
                            <DropdownMenuItem
                              key={option.value}
                              disabled={option.disabled ?? false}
                              onSelect={() => {
                                field.onChange(option.value);
                                onValueChange?.(option.value);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  {option.icon}
                                  <span>{option.label}</span>
                                </div>
                                {showCheckIcon &&
                                  field.value === option.value && (
                                    <Check className="h-4 w-4" />
                                  )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                        {group.label && groups[groups.length - 1] !== group && (
                          <DropdownMenuSeparator />
                        )}
                      </div>
                    ))
                  ) : (
                    <DropdownMenuGroup>
                      {options.map(option => (
                        <DropdownMenuItem
                          key={option.value}
                          disabled={option.disabled ?? false}
                          onSelect={() => {
                            field.onChange(option.value);
                            onValueChange?.(option.value);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {option.icon}
                              <span>{option.label}</span>
                            </div>
                            {showCheckIcon && field.value === option.value && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
