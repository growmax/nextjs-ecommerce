"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge"
import { PlusIcon, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SideDrawer from "@/components/custom/sidedrawer";
import {
  QuoteFilterForm,
  QuoteFilterFormData,
  FormMethods,
} from "@/components/sales/QuoteFilterForm";

interface FilterTab {
  id: string;
  label: string;
  hasFilter?: boolean;
  count?: number;
}

interface FilterTabsProps {
  tabs?: FilterTab[];
  defaultValue?: string;
  onTabChange?: (value: string) => void;
  onAddTab?: () => void;
  onFilterClick?: (tabId: string) => void;
  onSettingsClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  filterType?: string;
  statusOptions?: Array<{ value: string; label: string }>;
  onFilterSubmit?: (data: QuoteFilterFormData) => void;
  onFilterReset?: () => void;
  usePreferenceService?: boolean;
  module?: string;
}

export function FilterTabs({
  tabs = [{ id: "all", label: "All", hasFilter: false }],
  defaultValue = "all",
  onTabChange,
  onAddTab,
  onFilterClick,
  onSettingsClick,
  className,
  children,
  filterType = "Order",
  statusOptions = [],
  onFilterSubmit,
  onFilterReset,
}: FilterTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const formRef = React.useRef<FormMethods>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  const handlePlusClick = () => {
    if (onAddTab) {
      onAddTab();
    } else {
      setIsDrawerOpen(true);
    }
  };

  const handleFilterSubmit = (data: QuoteFilterFormData) => {
    onFilterSubmit?.(data);
    setIsDrawerOpen(false);
  };

  const handleFilterReset = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    onFilterReset?.();
  };

  const handleApply = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between border-b">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent h-auto p-0 border-none">
              {tabs.map(tab => (
                <div key={tab.id} className="relative flex items-center">
                  <TabsTrigger
                    value={tab.id}
                    className={cn(
                      "bg-transparent border-none shadow-none rounded-none px-4 py-3",
                      "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                      "hover:bg-accent/50 transition-colors"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.hasFilter && (
                        <span
                          className="inline-block relative cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            onFilterClick?.(tab.id);
                          }}
                        >
                          <svg
                            className="text-primary w-6 h-6"
                            focusable="false"
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            data-testid="FilterListIcon"
                            fill="currentColor"
                          >
                            <path d="M10 18h4v-2h-4zM3 6v2h18V6zm3 7h12v-2H6z"></path>
                          </svg>
                          {tab.count && tab.count > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </span>
                      )}
                    </span>
                  </TabsTrigger>
                </div>
              ))}

              <span
                className="inline-flex items-center justify-center h-8 w-8 ml-2 hover:text-accent-foreground transition-colors cursor-pointer"
                onClick={handlePlusClick}
                title="Add New Order"
              >
                <PlusIcon className="h-4 w-4 text-gray-600" />
              </span>
            </TabsList>

            {onSettingsClick && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onSettingsClick}
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          {children && (
            <div className="mt-4">
              {tabs.map(tab => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  {children}
                </TabsContent>
              ))}
            </div>
          )}
        </Tabs>
      </div>

      {/* SideDrawer */}
      <SideDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`${filterType} Filters`}
        onClearAll={handleFilterReset}
        onApply={handleApply}
      >
        <QuoteFilterForm
          formRef={formRef}
          onSubmit={handleFilterSubmit}
          onReset={handleFilterReset}
          filterType={filterType}
          statusOptions={statusOptions}
          showFilterInfo={true}
        />
      </SideDrawer>
    </div>
  );
}
