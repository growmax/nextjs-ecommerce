"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  status: z.string().optional(),
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
}

export interface FormMethods {
  submit: () => void;
  reset: () => void;
  getValues: () => QuoteFilterFormData;
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
      status: "",
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
  React.useImperativeHandle(
    formRef,
    () => ({
      submit: () => form.handleSubmit(handleSubmit)(),
      reset: handleReset,
      getValues: () => form.getValues(),
    }),
    [form, handleSubmit, handleReset]
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.length > 0 ? (
                      statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
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
