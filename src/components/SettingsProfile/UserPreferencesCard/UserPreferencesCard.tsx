"use client";

import SectionCard from "@/components/custom/SectionCard";
import { AutoCompleteField } from "@/components/forms/AutoCompleteField/AutoCompleteField";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Globe } from "lucide-react";
import { useEffect, useState } from "react";

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
}

export function UserPreferencesCard({
  preferences,
  onChange,
  timeZoneOptions,
  dateFormatOptions,
  timeFormatOptions,
  isLoading = false,
  dataLoading = false,
}: UserPreferencesCardProps) {
  // Simple validation state - no react-hook-form needed
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserPreferencesData, string>>
  >({});

  // Clear errors when preferences are loaded successfully
  useEffect(() => {
    if (
      preferences.timeZone &&
      preferences.dateFormat &&
      preferences.timeFormat
    ) {
      setErrors({});
    }
  }, [preferences]);

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

    // Call parent onChange
    onChange(field, value);
  };

  // Helper to get user-friendly field labels
  const getFieldLabel = (field: keyof UserPreferencesData): string => {
    const labels: Record<keyof UserPreferencesData, string> = {
      timeZone: "Time zone",
      dateFormat: "Date format",
      timeFormat: "Time format",
    };
    return labels[field];
  };
  if (dataLoading) {
    return (
      <SectionCard title="User Preferences" className="w-full">
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
    <SectionCard title="User Preferences" className="w-full">
      <div className="space-y-4">
        {/* Time Zone */}
        <AutoCompleteField
          label="Time Zone"
          value={preferences.timeZone}
          onChange={value => handleFieldChange("timeZone", value)}
          options={timeZoneOptions}
          placeholder="Select timezone"
          required
          disabled={isLoading}
          {...(errors.timeZone && { error: errors.timeZone })}
        />

        {/* Date Format */}
        <AutoCompleteField
          label="Date Display Format"
          value={preferences.dateFormat}
          onChange={value => handleFieldChange("dateFormat", value)}
          options={dateFormatOptions}
          placeholder="Select date format"
          required
          disabled={isLoading}
          {...(errors.dateFormat && { error: errors.dateFormat })}
        />

        {/* Time Format */}
        <AutoCompleteField
          label="Time Format"
          value={preferences.timeFormat}
          onChange={value => handleFieldChange("timeFormat", value)}
          options={timeFormatOptions}
          placeholder="Select time format"
          required
          disabled={isLoading}
          {...(errors.timeFormat && { error: errors.timeFormat })}
        />

        {/* Preview */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preview
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              Timezone: {preferences.timeZone || "Not selected"}
            </p>
            <DateTimePreview
              dateFormat={preferences.dateFormat}
              timeFormat={preferences.timeFormat}
              timeZone={preferences.timeZone}
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
        Date: {formattedDate}
      </p>
      <p className="flex items-center gap-2">
        <Clock className="h-3 w-3" />
        Time: {formattedTime}
      </p>
    </>
  );
}
