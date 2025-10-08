"use client";

import * as React from "react";
import { useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge"
import { PlusIcon, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SideDrawer from "@/components/custom/sidedrawer";
import {
  QuoteFilterForm,
  QuoteFilterFormData,
  FormMethods,
} from "@/components/sales/QuoteFilterForm";
import PreferenceService from "@/lib/api/services/PreferenceService";
import { FilterTab } from "@/types/dashboard-toolbar";
import { AuthStorage } from "@/lib/auth";

interface LocalFilterTab {
  id: string;
  label: string;
  hasFilter?: boolean;
  count?: number;
}

interface FilterTabsProps {
  tabs?: LocalFilterTab[];
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
  // PreferenceService integration props
  module?: string;
  usePreferenceService?: boolean;
  onPreferenceTabChange?: (tabIndex: number, tabData: FilterTab) => void;
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
  statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ],
  onFilterSubmit,
  onFilterReset,
  // PreferenceService props
  module,
  usePreferenceService = false,
  onPreferenceTabChange,
}: FilterTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const formRef = React.useRef<FormMethods>(null);

  // PreferenceService state management
  const [preferenceFilterTabs, setPreferenceFilterTabs] = React.useState<
    FilterTab[]
  >([]);
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);
  const [tabsLoading, setTabsLoading] = React.useState(false);

  // Load preferences with API logging only
  const loadPreferencesWithLogging = useCallback(async () => {
    // Check if user is authenticated first
    const token = AuthStorage.getAccessToken();
    if (!token) {
      return;
    }

    if (!usePreferenceService || !module) {
      return;
    }

    try {
      setTabsLoading(true);

      const response =
        await PreferenceService.findFilterPreferencesServerSide(module);

      if (response && response.preference && response.preference.filters) {
        setPreferenceFilterTabs(response.preference.filters);
        setActiveTabIndex(response.preference.selected || 0);
      }
    } catch (_error) {
      // Handle errors silently
    } finally {
      setTabsLoading(false);
    }
  }, [module, usePreferenceService]);

  // Auto-load preferences on component mount
  useEffect(() => {
    loadPreferencesWithLogging();
  }, [module, usePreferenceService, loadPreferencesWithLogging]);

  // Fetch filter preferences when settings button is clicked
  const fetchFilterPreferences = async () => {
    if (!usePreferenceService || !module) return;

    setTabsLoading(true);
    try {
      const response =
        await PreferenceService.findFilterPreferencesServerSide(module);

      if (response && response.preference && response.preference.filters) {
        setPreferenceFilterTabs(response.preference.filters);
        setActiveTabIndex(response.preference.selected || 0);
      }
    } catch (_error) {
      // Handle errors silently
    } finally {
      setTabsLoading(false);
    }
  };

  // Handle PreferenceService tab change
  const handlePreferenceTabChange = (tabIndex: number) => {
    setActiveTabIndex(tabIndex);
    const selectedTab = preferenceFilterTabs[tabIndex];

    if (onPreferenceTabChange && selectedTab) {
      onPreferenceTabChange(tabIndex, selectedTab);
    }
  };

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

  const handleSettingsClick = () => {
    if (usePreferenceService) {
      fetchFilterPreferences();
    }
    onSettingsClick?.();
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
        {/* PreferenceService tabs or regular tabs */}
        {usePreferenceService ? (
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {tabsLoading ? (
                  // Loading skeleton for PreferenceService tabs
                  <>
                    <Skeleton className="h-7 w-12 rounded-md" />
                    <Skeleton className="h-7 w-16 rounded-md" />
                    <Skeleton className="h-7 w-14 rounded-md" />
                  </>
                ) : (
                  // Render PreferenceService filter tabs
                  preferenceFilterTabs.map((tab, index) => (
                    <Button
                      key={tab.filter_index}
                      variant={activeTabIndex === index ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePreferenceTabChange(index)}
                      className={cn(
                        "h-7 px-3 text-xs whitespace-nowrap transition-colors",
                        activeTabIndex === index
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      )}
                    >
                      {tab.filter_name}
                    </Button>
                  ))
                )}
              </div>

              {onSettingsClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleSettingsClick}
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Regular tabs implementation
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
                  onClick={handleSettingsClick}
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
        )}

        {/* Children for PreferenceService mode */}
        {usePreferenceService && children && (
          <div className="mt-4">{children}</div>
        )}
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
