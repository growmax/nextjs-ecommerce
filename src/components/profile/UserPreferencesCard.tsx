"use client";

import { Settings, Clock, Calendar, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { AutoCompleteField } from "@/components/forms/AutoCompleteField";

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
  const t = useTranslations("profileSettings");

  if (dataLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("userPreferences")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t("userPreferences")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Zone */}
        <AutoCompleteField
          label={t("timeZone")}
          value={preferences.timeZone}
          onChange={value => onChange("timeZone", value)}
          options={timeZoneOptions}
          placeholder={t("selectTimezone")}
          required
          disabled={isLoading}
        />

        {/* Date Format */}
        <AutoCompleteField
          label={t("dateDisplayFormat")}
          value={preferences.dateFormat}
          onChange={value => onChange("dateFormat", value)}
          options={dateFormatOptions}
          placeholder={t("selectDateFormat")}
          required
          disabled={isLoading}
        />

        {/* Time Format */}
        <AutoCompleteField
          label={t("timeFormat")}
          value={preferences.timeFormat}
          onChange={value => onChange("timeFormat", value)}
          options={timeFormatOptions}
          placeholder={t("selectTimeFormat")}
          required
          disabled={isLoading}
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
              {t("timezone")} {preferences.timeZone || t("notSelected")}
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {t("date")} {new Date().toLocaleDateString()}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {t("time")} {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
