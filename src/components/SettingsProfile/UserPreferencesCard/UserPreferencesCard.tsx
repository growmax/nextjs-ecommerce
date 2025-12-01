"use client";

import SectionCard from "@/components/custom/SectionCard";
import { AutoCompleteField } from "@/components/forms/AutoCompleteField/AutoCompleteField";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyService } from "@/lib/api";
import { Calendar, Clock, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UserPreferencesData {
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
}

interface PreferenceOption {
  value: string;
  label: string;
}

interface UserPreferencesCardProps {
  preferences: UserPreferencesData;
  onChange: (field: keyof UserPreferencesData, value: string) => void;
  timeZoneOptions: PreferenceOption[];
  dateFormatOptions: PreferenceOption[];
  timeFormatOptions: PreferenceOption[];
  isLoading?: boolean;
  dataLoading?: boolean;
  userId?: number;
  tenantId?: string | number;
  preferenceId?: number;
  onSaveSuccess?: () => void | Promise<void>;
}

export function UserPreferencesCard({
  preferences,
  onChange,
  timeZoneOptions,
  dateFormatOptions,
  timeFormatOptions,
  isLoading = false,
  dataLoading = false,
  userId,
  tenantId,
  preferenceId,
  onSaveSuccess,
}: UserPreferencesCardProps) {
  const t = useTranslations("profileSettings");
  // Simple validation state - no react-hook-form needed
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserPreferencesData, string>>
  >({});

  // Track original preferences and changes
  const [originalPreferences, setOriginalPreferences] =
    useState<UserPreferencesData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isCancellingRef = useRef(false);

  // Local state that mirrors preferences - allows instant reset without waiting for parent
  const [localPreferences, setLocalPreferences] = useState<UserPreferencesData>(
    () => preferences
  );

  // Sync localPreferences with preferences prop (but not during cancel)
  useEffect(() => {
    if (
      preferences.timeZone &&
      preferences.dateFormat &&
      preferences.timeFormat
    ) {
      // Only update local if we're not cancelling (to prevent reset from being overwritten)
      if (!isCancellingRef.current) {
        setLocalPreferences(prev => {
          // Only update if there's an actual difference
          const hasDiff =
            preferences.timeZone !== prev.timeZone ||
            preferences.dateFormat !== prev.dateFormat ||
            preferences.timeFormat !== prev.timeFormat;

          return hasDiff ? { ...preferences } : prev;
        });
      }
    }
  }, [preferences]);

  // Initialize original preferences when data loads
  useEffect(() => {
    if (
      localPreferences.timeZone &&
      localPreferences.dateFormat &&
      localPreferences.timeFormat &&
      !originalPreferences
    ) {
      setOriginalPreferences({ ...localPreferences });
      setErrors({});
      setHasChanges(false);
    }
  }, [localPreferences, originalPreferences]);

  // Detect changes - skip detection during cancel operation
  useEffect(() => {
    if (!originalPreferences) return;

    const allMatch =
      localPreferences.timeZone === originalPreferences.timeZone &&
      localPreferences.dateFormat === originalPreferences.dateFormat &&
      localPreferences.timeFormat === originalPreferences.timeFormat;

    // If we're canceling and all values now match, clear the canceling flag
    if (isCancellingRef.current && allMatch) {
      isCancellingRef.current = false;
      setHasChanges(false);
      return;
    }

    // Skip change detection if we're in the middle of canceling (values still don't match)
    if (isCancellingRef.current) {
      return;
    }

    // Normal change detection
    const changed = !allMatch;
    setHasChanges(changed);
  }, [localPreferences, originalPreferences]);

  // Validate field on change
  const handleFieldChange = (
    field: keyof UserPreferencesData,
    value: string
  ) => {
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    // Validate: field is required
    if (!value || value.trim() === "") {
      setErrors(prev => ({
        ...prev,
        [field]: getFieldLabel(field) + " is required",
      }));
    }

    // Update local state immediately for instant UI update
    setLocalPreferences(prev => ({ ...prev, [field]: value }));

    // Call parent onChange to sync with parent state
    onChange(field, value);
  };

  // Helper to get user-friendly field labels
  const getFieldLabel = (field: keyof UserPreferencesData): string => {
    const labels: Record<keyof UserPreferencesData, string> = {
      timeZone: t("timeZone"),
      dateFormat: t("dateDisplayFormat"),
      timeFormat: t("timeFormat"),
    };
    return labels[field];
  };

  // Handle save
  const handleSave = async () => {
    if (!hasChanges) return;
    if (!userId) {
      toast.error("User ID is required"); // TODO: Add translation key
      return;
    }

    // Validate required fields
    if (
      !localPreferences.timeZone ||
      !localPreferences.dateFormat ||
      !localPreferences.timeFormat
    ) {
      toast.error(t("selectAnOption"));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        dateFormat: localPreferences.dateFormat,
        timeFormat: localPreferences.timeFormat,
        timeZone: localPreferences.timeZone,
        userId: { id: userId },
        ...(preferenceId && { id: preferenceId }),
        ...(tenantId && {
          tenantId:
            typeof tenantId === "string" ? parseInt(tenantId) || 0 : tenantId,
        }),
        vendorId: null,
      };

      await CompanyService.saveUserPreferences(payload);

      // Update original preferences after successful save
      setOriginalPreferences({ ...localPreferences });
      setHasChanges(false);

      // Reload preferences after successful save
      if (onSaveSuccess) {
        try {
          await onSaveSuccess();
        } catch (reloadError) {
          console.error("Error during reload:", reloadError);
        }
      }

      // Show success message - ensure it's called after all operations
      toast.success(t("changesSavedSuccessfully"), {
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error(t("failedToSaveChanges"));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!originalPreferences) return;

    // Set flag to prevent change detection during reset
    isCancellingRef.current = true;

    // Clear errors and immediately hide buttons
    setErrors({});
    setHasChanges(false);

    // Reset local preferences immediately - UI updates instantly
    setLocalPreferences({ ...originalPreferences });

    // Sync with parent state - update all three values
    onChange("timeZone", originalPreferences.timeZone);
    onChange("dateFormat", originalPreferences.dateFormat);
    onChange("timeFormat", originalPreferences.timeFormat);

    // Clear canceling flag after a brief delay to allow parent state to update
    setTimeout(() => {
      isCancellingRef.current = false;
    }, 100);

    toast.info(t("allChangesCancelled"));
  };

  // Show skeleton when loading or data is not available
  if (
    dataLoading ||
    !localPreferences ||
    !localPreferences.timeZone ||
    !localPreferences.dateFormat ||
    !localPreferences.timeFormat
  ) {
    return (
      <SectionCard title={t("userPreferences")} className="w-full">
        <div className="space-y-4">
          {/* Skeleton for dropdowns */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Preview skeleton */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={t("userPreferences")}
      className="w-full py-2.5"
      headerActions={
        hasChanges ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving || isLoading}
            >
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isLoading}
            >
              {isSaving ? "saving" : "save"}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {/* Time Zone */}
        <AutoCompleteField
          label={t("timeZone")}
          value={localPreferences.timeZone}
          onChange={value => handleFieldChange("timeZone", value)}
          options={timeZoneOptions}
          placeholder={t("selectTimezone")}
          required
          disabled={isLoading}
          {...(errors.timeZone && { error: errors.timeZone })}
        />

        {/* Date Format */}
        <AutoCompleteField
          label={t("dateDisplayFormat")}
          value={localPreferences.dateFormat}
          onChange={value => handleFieldChange("dateFormat", value)}
          options={dateFormatOptions}
          placeholder={t("selectDateFormat")}
          required
          disabled={isLoading}
          {...(errors.dateFormat && { error: errors.dateFormat })}
        />

        {/* Time Format */}
        <AutoCompleteField
          label={t("timeFormat")}
          value={localPreferences.timeFormat}
          onChange={value => handleFieldChange("timeFormat", value)}
          options={timeFormatOptions}
          placeholder={t("selectTimeFormat")}
          required
          disabled={isLoading}
          {...(errors.timeFormat && { error: errors.timeFormat })}
        />

        {/* Preview */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t("preview")}
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              {t("timezone")} {localPreferences.timeZone || t("notSelected")}
            </p>
            <DateTimePreview
              dateFormat={localPreferences.dateFormat}
              timeFormat={localPreferences.timeFormat}
              timeZone={localPreferences.timeZone}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function DateTimePreview({
  dateFormat,
  timeFormat,
  timeZone,
}: {
  dateFormat: string;
  timeFormat: string;
  timeZone: string;
}) {
  const t = useTranslations("profileSettings");
  const now = new Date();

  // helper to get localized parts (day, month, year, hour, minute)
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || undefined,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  })
    .formatToParts(now)
    .reduce(
      (acc: any, p) => {
        acc[p.type] = p.value;
        return acc;
      },
      {} as Record<string, string>
    );

  const monthLong = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || undefined,
    month: "long",
  }).format(now);

  const monthShort = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || undefined,
    month: "short",
  }).format(now);

  const pad = (v: string, n = 2) => v.toString().padStart(n, "0");

  const formattedDate = (() => {
    if (!dateFormat)
      return new Intl.DateTimeFormat(undefined, {
        timeZone: timeZone || undefined,
      }).format(now);

    // order replacements to avoid collisions (MMMM before MM)
    let out = dateFormat;
    out = out.replace(/MMMM/g, monthLong);
    out = out.replace(/MMM/g, monthShort);
    if (parts.day) out = out.replace(/dd/g, pad(parts.day));
    if (parts.month) out = out.replace(/MM/g, pad(parts.month));
    if (parts.year) out = out.replace(/yyyy/g, parts.year);

    return out;
  })();

  const formattedTime = (() => {
    if (!timeFormat)
      return new Intl.DateTimeFormat(undefined, {
        timeZone: timeZone || undefined,
        hour: "numeric",
        minute: "numeric",
      }).format(now);

    const hour24 = parts.hour ? parseInt(parts.hour, 10) : now.getHours();
    const minute = parts.minute
      ? pad(parts.minute)
      : pad(now.getMinutes().toString());

    if (/H{1,2}/.test(timeFormat) && timeFormat.includes("H")) {
      // 24-hour
      const hh = pad(String(hour24));
      return timeFormat.replace(/HH/g, hh).replace(/mm/g, minute);
    }

    // assume 12-hour with am/pm (e.g., hh:mm a)
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const hh12 = pad(String(hour12));
    return timeFormat
      .replace(/hh/g, hh12)
      .replace(/mm/g, minute)
      .replace(/a/g, ampm.toLowerCase());
  })();

  return (
    <>
      <p className="flex items-center gap-2">
        <Calendar className="h-3 w-3" />
        {t("date")} {formattedDate}
      </p>
      <p className="flex items-center gap-2">
        <Clock className="h-3 w-3" />
        {t("time")} {formattedTime}
      </p>
    </>
  );
}
