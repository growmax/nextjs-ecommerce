"use client";

import SideDrawer from "@/components/custom/sidedrawer";
import QuoteStatusService from "@/lib/api/services/StatusService/StatusService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FormMethods,
  QuoteFilterForm,
  QuoteFilterFormData,
  StatusOption,
} from "./QuoteFilterForm";

interface QuoteFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: QuoteFilterFormData) => void;
  onReset?: () => void;
  onSave?: (data: QuoteFilterFormData) => void;
  userId?: number | undefined;
  companyId?: number | undefined;
  module?: "quote" | "order";
  title?: string;
  filterType?: string;
  activeTab?: string;
  initialFilterData?: QuoteFilterFormData | undefined;
  mode?: "filter" | "create";
}

export function FilterDrawer({
  open,
  onClose,
  onSubmit,
  onReset,
  onSave,
  userId,
  companyId,
  module = "quote",
  title = "Filters",
  filterType = "Quote",
  activeTab,
  initialFilterData,
  mode = "filter",
}: QuoteFilterDrawerProps) {
  const formRef = useRef<FormMethods>(null);

  // Service-only state management
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);

  // Memoize statusModule to prevent recalculations
  const statusModule = useMemo(() => {
    return module === "quote" ? "quotes" : "orders";
  }, [module]);

  // Service-only loading function
  const loadStatusOptions = useCallback(async () => {
    if (!userId || !companyId) {
      setStatusOptions([]); // Empty array, no fallback
      return;
    }

    try {
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
    } catch {
      setStatusOptions([]); // Empty, no fallback
    }
  }, [userId, companyId, statusModule]);

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
  }, [open, userId, companyId, module, initialFilterData, loadStatusOptions]);

  const handleApply = () => {
    if (formRef.current) {
      formRef.current.submit();
      onClose();
    }
  };

  const handleSave = () => {
    if (formRef.current) {
      const data = formRef.current.getValues();
      onSave?.(data);
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
    if (mode === "create") {
      onSave?.(data);
    } else {
      onSubmit(data);
    }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={title}
      onClearAll={handleClearAll}
      onApply={handleApply}
      onSave={handleSave}
      mode={mode}
    >
      <QuoteFilterForm
        formRef={formRef}
        onSubmit={handleFormSubmit}
        onReset={onReset || (() => {})}
        statusOptions={statusOptions}
        filterType={filterType}
        activeTab={activeTab}
      />
    </SideDrawer>
  );
}

export default FilterDrawer;
