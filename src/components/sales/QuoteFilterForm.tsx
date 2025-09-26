"use client";

import React from "react";
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

interface QuoteFilterFormProps {
  onSubmit: (data: QuoteFilterFormData) => void;
  onReset?: () => void;
  statusOptions?: StatusOption[];
}

export function QuoteFilterForm({
  onSubmit,
  onReset,
  statusOptions = [],
}: QuoteFilterFormProps) {
  const form = useForm<QuoteFilterFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: undefined,
      quoteId: undefined,
      quoteName: undefined,
      quotedDateStart: undefined,
      quotedDateEnd: undefined,
      lastUpdatedDateStart: undefined,
      lastUpdatedDateEnd: undefined,
      subtotalStart: undefined,
      subtotalEnd: undefined,
      taxableStart: undefined,
      taxableEnd: undefined,
      totalStart: undefined,
      totalEnd: undefined,
    },
  });

  const handleSubmit = (data: QuoteFilterFormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    form.reset();
    onReset?.();
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "Pick a date";
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">All</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Quote Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Quote Info</h3>

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
                      <SelectTrigger>
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
                  <FormLabel>Quote ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter quote ID..." {...field} />
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
                  <FormLabel>Quote Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter quote name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Quoted Date Range */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">
              Quoted Date Range
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
            <h3 className="text-sm font-medium text-gray-900">
              Subtotal Range
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subtotalStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Value</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
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
                      <Input type="number" placeholder="0.00" {...field} />
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
                      <Input type="number" placeholder="0.00" {...field} />
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
                      <Input type="number" placeholder="0.00" {...field} />
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
                      <Input type="number" placeholder="0.00" {...field} />
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
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Final Separator */}
          <Separator />

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default QuoteFilterForm;
