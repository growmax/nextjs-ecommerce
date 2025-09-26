"use client";

import React, { useRef } from "react";
import SideDrawer from "@/components/custom/sidedrawer";
import {
  QuoteFilterForm,
  QuoteFilterFormData,
  StatusOption,
  FormMethods,
} from "./QuoteFilterForm";

interface QuoteFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: QuoteFilterFormData) => void;
  onReset?: () => void;
  statusOptions?: StatusOption[];
}

export function QuoteFilterDrawer({
  open,
  onClose,
  onSubmit,
  onReset,
  statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
    { value: "cancelled", label: "Cancelled" },
  ],
}: QuoteFilterDrawerProps) {
  const formRef = useRef<FormMethods>(null);

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
      title="Filters"
      onClearAll={handleClearAll}
      onApply={handleApply}
    >
      <QuoteFilterForm
        formRef={formRef}
        onSubmit={handleFormSubmit}
        onReset={onReset || (() => {})}
        statusOptions={statusOptions}
      />
    </SideDrawer>
  );
}

export default QuoteFilterDrawer;
