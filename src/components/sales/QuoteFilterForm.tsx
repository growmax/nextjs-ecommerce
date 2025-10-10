"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

// Form validation schema
const formSchema = z.object({
  filterName: z.string().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  quoteId: z.string().optional(),
  quoteName: z.string().optional(),
  quotedDateStart: z.date().optional(),
  quotedDateEnd: z.date().optional(),
  lastUpdatedDateStart: z.date().optional(),
  lastUpdatedDateEnd: z.date().optional(),
  subtotalStart: z.string().optional(),
  subtotalEnd: z.string().optional(),
  taxableStart: z.string().optional(),
  taxableEnd: z.string().optional(),
  totalStart: z.string().optional(),
  totalEnd: z.string().optional(),
});

// Form data interface - infer from schema to ensure consistency
export type QuoteFilterFormData = z.infer<typeof formSchema>;

export interface StatusOption {
  value: string;
  label: string;
  id?: string;
}

export interface FormMethods {
  submit: () => void;
  reset: () => void;
  getValues: () => QuoteFilterFormData;
  getCurrentData: () => QuoteFilterFormData;
  loadData: (data: QuoteFilterFormData) => void;
}

interface QuoteFilterFormProps {
  onSubmit?: (data: QuoteFilterFormData) => void;
  onReset?: () => void;
  statusOptions?: StatusOption[];
  formRef?: React.RefObject<FormMethods | null>;
  filterType?: string;
  activeTab?: string | undefined;
  showFilterInfo?: boolean;
}

export function QuoteFilterForm({
  onSubmit,
  onReset,
  statusOptions = [],
  formRef,
  filterType = "Quote",
  showFilterInfo = false,
}: QuoteFilterFormProps) {
  const form = useForm<QuoteFilterFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filterName: "",
      status: [] as string[],
      quoteId: "",
      quoteName: "",
      quotedDateStart: undefined,
      quotedDateEnd: undefined,
      lastUpdatedDateStart: undefined,
      lastUpdatedDateEnd: undefined,
      subtotalStart: "",
      subtotalEnd: "",
      taxableStart: "",
      taxableEnd: "",
      totalStart: "",
      totalEnd: "",
    },
  });

  const handleSubmit = useCallback(
    (data: QuoteFilterFormData) => {
      onSubmit?.(data);
    },
    [onSubmit]
  );

  const handleReset = useCallback(() => {
    form.reset();
    onReset?.();
  }, [form, onReset]);

  // Expose form methods for external access
  // Load data into form - optimized for array handling
  const loadData = useCallback(
    (data: QuoteFilterFormData) => {
      // Batch update all form values efficiently
      const formValues = { ...form.getValues() };

      Object.entries(data).forEach(([key, value]) => {
        const formKey = key as keyof QuoteFilterFormData;

        // Special handling for status field - ensure it's always an array
        if (formKey === "status") {
          if (typeof value === "string" && value !== "") {
            formValues[formKey] = [value];
          } else if (Array.isArray(value)) {
            // Filter and keep only valid string values
            formValues[formKey] = value.filter(
              v => typeof v === "string" && v !== ""
            );
          } else {
            formValues[formKey] = [];
          }
        } else if (value !== undefined && value !== null && value !== "") {
          // For other fields, set value directly
          (formValues as Record<string, unknown>)[formKey] = value;
        }
      });

      // Batch update all fields at once for better performance
      form.reset(formValues);
    },
    [form]
  );

  React.useImperativeHandle(
    formRef,
    () => ({
      submit: () => form.handleSubmit(handleSubmit)(),
      reset: handleReset,
      getValues: () => form.getValues(),
      getCurrentData: () => form.getValues(),
      loadData,
    }),
    [form, handleSubmit, handleReset, loadData]
  );

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "Pick a date";
    return date.toLocaleDateString();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Filter Info Section - Only show when showFilterInfo is true */}
        {showFilterInfo && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Filter Info</h3>

            {/* Filter Name */}
            <FormField
              control={form.control}
              name="filterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Filter Name
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter filter name..."
                      {...field}
                      value={field.value || ""}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Quote Info Section */}
        <div className="space-y-4">
          {!showFilterInfo && (
            <h3 className="text-sm font-medium text-gray-900">
              {filterType} Info
            </h3>
          )}

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => {
              const selectedValues = Array.isArray(field.value)
                ? field.value
                : field.value
                  ? [field.value]
                  : [];

              const handleStatusToggle = (value: string) => {
                const newValues = selectedValues.includes(value)
                  ? selectedValues.filter(v => v !== value)
                  : [...selectedValues, value];
                field.onChange(newValues);
              };

              const selectedLabels = selectedValues
                .map(val => statusOptions.find(opt => opt.value === val)?.label)
                .filter(Boolean)
                .join(", ");

              return (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between font-normal",
                            !selectedValues.length && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate text-left flex-1">
                            {selectedValues.length > 0
                              ? selectedLabels
                              : "Select status..."}
                          </span>
                          {selectedValues.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-md">
                              {selectedValues.length}
                            </span>
                          )}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <div className="max-h-64 overflow-y-auto p-2">
                        {statusOptions.length > 0 ? (
                          <>
                            {/* Select All / Clear All option */}
                            <div className="flex items-center justify-between px-3 py-2 border-b mb-2">
                              <button
                                type="button"
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                onClick={e => {
                                  e.stopPropagation();
                                  const allValues = statusOptions.map(
                                    opt => opt.value
                                  );
                                  field.onChange(allValues);
                                }}
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                                onClick={e => {
                                  e.stopPropagation();
                                  field.onChange([]);
                                }}
                              >
                                Clear All
                              </button>
                            </div>
                            {statusOptions.map((option, index) => (
                              <div
                                key={option.id || `${option.value}-${index}`}
                                className="flex items-center space-x-3 px-3 py-2 hover:bg-accent rounded-sm cursor-pointer transition-colors"
                                onClick={() => handleStatusToggle(option.value)}
                              >
                                <Checkbox
                                  id={`status-${option.value}`}
                                  checked={selectedValues.includes(
                                    option.value
                                  )}
                                  onCheckedChange={() =>
                                    handleStatusToggle(option.value)
                                  }
                                  className="h-4 w-4 border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground"
                                />
                                <label
                                  htmlFor={`status-${option.value}`}
                                  className="text-sm font-normal cursor-pointer flex-1 leading-none"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                            No status options available
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Quote ID */}
          <FormField
            control={form.control}
            name="quoteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{filterType} ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Enter ${filterType.toLowerCase()} ID...`}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quote Name */}
          <FormField
            control={form.control}
            name="quoteName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{filterType} Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Enter ${filterType.toLowerCase()} name...`}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Quoted Date Range */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">
            {filterType === "Quote"
              ? "Quoted"
              : filterType === "Order"
                ? "Ordered"
                : filterType}{" "}
            Date Range
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quotedDateStart"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {formatDate(field.value)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quotedDateEnd"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {formatDate(field.value)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Last Updated Date */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">
            Last Updated Date
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="lastUpdatedDateStart"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {formatDate(field.value)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastUpdatedDateEnd"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {formatDate(field.value)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Separator */}
        <Separator />

        {/* Subtotal Range */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Subtotal Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="subtotalStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtotalEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Taxable Range */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Taxable Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxableStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Taxable Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxableEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Taxable Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Separator */}
        <Separator />

        {/* Total Range */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">Total Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="totalStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Total</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Total</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}

export default QuoteFilterForm;
