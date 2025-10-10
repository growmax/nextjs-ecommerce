"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import SideDrawer from "@/components/custom/sidedrawer";
import {
  QuoteFilterForm,
  QuoteFilterFormData,
  StatusOption,
  FormMethods,
} from "./QuoteFilterForm";
import QuoteStatusService from "@/lib/api/services/StatusService";
import { toast } from "sonner";

interface QuoteFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: QuoteFilterFormData) => void;
  onReset?: () => void;
  userId?: number | undefined;
  companyId?: number | undefined;
  module?: "quote" | "order";
  title?: string;
  filterType?: string;
  activeTab?: string;
  enableSaveFilter?: boolean;
  onSaveFilter?: (
    filterName: string,
    filterData: QuoteFilterFormData
  ) => Promise<void>;
  initialFilterData?: QuoteFilterFormData | undefined;
}

export function FilterDrawer({
  open,
  onClose,
  onSubmit,
  onReset,
  userId,
  companyId,
  module = "quote",
  title = "Filters",
  filterType = "Quote",
  activeTab,
  enableSaveFilter = false,
  onSaveFilter,
  initialFilterData,
}: QuoteFilterDrawerProps) {
  const formRef = useRef<FormMethods>(null);

  // Service-only state management
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);

  // Save filter state
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Service-only loading function
  const loadStatusOptions = useCallback(async () => {
    if (!userId || !companyId) {
      setStatusOptions([]); // Empty array, no fallback
      return;
    }

    try {
      const statusModule = module === "quote" ? "quotes" : "orders";
      const response = await QuoteStatusService.getQuoteStatusByCompany({
        userId,
        companyId,
        module: statusModule,
      });

      // Handle both string array and object array responses
      const validStatuses = response.data.filter(
        status => status !== null && status !== undefined
      );
      const mappedOptions: StatusOption[] = validStatuses.map(
        (status, index) => {
          // If status is already an object with value and label
          if (typeof status === "object" && status.value && status.label) {
            return {
              value: status.value,
              label: status.label,
              id: `${status.value}-${index}`,
            };
          }
          // If status is a string
          const statusStr =
            typeof status === "string" ? status : String(status);
          return {
            value: statusStr,
            label: statusStr,
            id: `${statusStr}-${index}`,
          };
        }
      );

      // Remove duplicates based on value
      const uniqueOptions = mappedOptions.filter(
        (option, index, self) =>
          index === self.findIndex(o => o.value === option.value)
      );

      setStatusOptions(uniqueOptions);
    } catch (_error) {
      setStatusOptions([]); // Empty, no fallback
    }
  }, [userId, companyId, module]);

  // Load status options when drawer opens and load initial filter data
  useEffect(() => {
    if (open) {
      // Load status options first
      loadStatusOptions().then(() => {
        // After status options are loaded, load initial filter data
        if (initialFilterData && formRef.current) {
          setTimeout(() => {
            formRef.current?.loadData(initialFilterData);
          }, 150);
        }
      });
    }
  }, [open, loadStatusOptions, initialFilterData]);

  const handleApply = () => {
    if (formRef.current) {
      formRef.current.submit();
      onClose();
    }
  };

  const handleClearAll = () => {
    if (formRef.current) {
      formRef.current.reset();
      onReset?.();
    }
  };

  const handleFormSubmit = (data: QuoteFilterFormData) => {
    onSubmit(data);
  };

  const handleSaveFilter = async () => {
    if (!formRef.current || !filterName.trim()) {
      toast.error("Please enter a filter name");
      return;
    }

    setIsSaving(true);
    try {
      const currentFormData = formRef.current.getCurrentData();
      await onSaveFilter?.(filterName.trim(), currentFormData);

      setFilterName("");
      setIsCreateMode(false);
      toast.success("Filter saved successfully!");
    } catch (_error) {
      toast.error("Failed to save filter");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={title}
      onClearAll={handleClearAll}
      onApply={handleApply}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <QuoteFilterForm
            formRef={formRef}
            onSubmit={handleFormSubmit}
            onReset={onReset || (() => {})}
            statusOptions={statusOptions}
            filterType={filterType}
            activeTab={activeTab}
          />
        </div>

        {enableSaveFilter && (
          <div className="border-t p-4 mt-4">
            {isCreateMode ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Name
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={e => setFilterName(e.target.value)}
                    placeholder="Enter filter name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveFilter}
                    disabled={!filterName.trim() || isSaving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Filter"}
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateMode(false);
                      setFilterName("");
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreateMode(true)}
                className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              >
                Save Current Filter
              </button>
            )}
          </div>
        )}
      </div>
    </SideDrawer>
  );
}

export default FilterDrawer;
