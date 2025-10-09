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

interface QuoteFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: QuoteFilterFormData) => void;
  onReset?: () => void;
  userId?: number | undefined;
  companyId?: number | undefined;
  module?: "quotes" | "orders";
  title?: string;
  filterType?: string;
  activeTab?: string;
}

export function FilterDrawer({
  open,
  onClose,
  onSubmit,
  onReset,
  userId,
  companyId,
  module = "quotes",
  title = "Filters",
  filterType = "Quote",
  activeTab,
}: QuoteFilterDrawerProps) {
  const formRef = useRef<FormMethods>(null);

  // Service-only state management
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);

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
        module,
      });

      // Use ONLY the service response
      setStatusOptions(response.data);
    } catch (_error) {
      setStatusOptions([]); // Empty, no fallback
    }
  }, [userId, companyId, module]);

  // Load status options when component mounts or when drawer opens
  useEffect(() => {
    if (open) {
      loadStatusOptions();
    }
  }, [open, loadStatusOptions]);

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

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={title}
      onClearAll={handleClearAll}
      onApply={handleApply}
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
