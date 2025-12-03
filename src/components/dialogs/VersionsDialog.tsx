"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { BaseDialogProps } from "@/types/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { zoneDateTimeCalculator } from "@/utils/date-format/date-format";
import { ExternalLink, X } from "lucide-react";
import { useTranslations } from "next-intl";

export interface Version {
  versionNumber: number;
  versionName?: string;
  sentBy: string;
  sentDate: string;
  orderId?: string;
  orderIdentifier?: string;
  orderVersion?: number;
}

export interface VersionsDialogProps
  extends Omit<BaseDialogProps, "title" | "description"> {
  versions?: Version[];
  orderId?: string;
  loading?: boolean;
  currentVersionNumber?: number;
  onVersionSelect?: (version: Version) => void;
}

// Helper function to get user preferences
const getUserPreferences = () => {
  try {
    const savedPrefs = localStorage.getItem("userPreferences");
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      return {
        timeZone: prefs.timeZone || "Asia/Kolkata",
        dateFormat: prefs.dateFormat || "dd/MM/yyyy",
        timeFormat: prefs.timeFormat || "hh:mm a",
      };
    }
  } catch {
    // Fallback to defaults
  }
  return {
    timeZone: "Asia/Kolkata",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "hh:mm a",
  };
};

export function VersionsDialog({
  open,
  onOpenChange,
  versions = [],
  orderId: _orderId,
  loading = false,
  currentVersionNumber,
  onVersionSelect,
}: VersionsDialogProps) {
  const t = useTranslations("components");
  const preferences = getUserPreferences();

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const formatted = zoneDateTimeCalculator(
      dateString,
      preferences.timeZone,
      preferences.dateFormat,
      preferences.timeFormat,
      true
    );
    if (formatted) {
      // Replace the separator with middle dot if needed
      return formatted.replace("·", "·");
    }
    return dateString;
  };

  // Handle version click (select version)
  const handleVersionClick = (version: Version) => {
    if (onVersionSelect) {
      onVersionSelect(version);
    }
  };

  // Use provided versions or empty array
  const displayVersions: Version[] = versions || [];
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="fixed top-[116px] right-0 left-auto bottom-0 translate-x-0 translate-y-0 w-[280px] sm:w-[320px] max-w-[320px] h-[calc(100vh-116px)] rounded-tl-lg p-0 shadow-[-4px_0_12px_0_rgba(0,0,0,0.15)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full duration-300 border border-black/10 z-30"
          showCloseButton={false}
          hideOverlay={true}
        >
          <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Header */}
            <DialogHeader className="px-4 py-3 border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <DialogTitle className="text-base font-bold text-gray-900 flex-1">
                  {t("versions")}
                </DialogTitle>
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:pointer-events-none flex items-center justify-center shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-gray-700" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 bg-white">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-sm text-gray-500">{t("loading")}</div>
                </div>
              ) : displayVersions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-sm text-gray-500">
                    {t("noVersionsAvailable")}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-8">
                  {displayVersions.map(version => {
                    const isSelected =
                      currentVersionNumber !== undefined
                        ? version.versionNumber === currentVersionNumber
                        : version.versionNumber === 1;
                    return (
                      <div
                        key={`version-${version.versionNumber}-${version.sentDate}`}
                        className={`rounded-lg p-5 border transition-all duration-200 cursor-pointer group ${
                          isSelected
                            ? "bg-primary/10 border-primary/50 shadow-md"
                            : "bg-gray-50 border-gray-200 hover:bg-primary/10 hover:border-primary/30 hover:shadow-md"
                        }`}
                        onClick={() => handleVersionClick(version)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-3">
                              <span className="font-bold text-gray-900 text-base">
                                {version.versionName ||
                                  `VERSION ${version.versionNumber}`}
                              </span>
                              <ExternalLink className="h-4 w-4 text-gray-600 shrink-0 group-hover:text-gray-900 transition-colors" />
                            </div>
                            <div className="text-sm text-gray-700 mb-2 font-medium">
                              Sent by {version.sentBy}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDateTime(version.sentDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        showCloseButton={false}
        className="max-h-[90vh] flex flex-col"
      >
        <DrawerHeader className="text-left px-4 py-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DrawerTitle className="text-base font-bold text-gray-900 flex-1">
              {t("versions")}
            </DrawerTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:pointer-events-none flex items-center justify-center shrink-0"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-700" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-gray-500">{t("loading")}</div>
            </div>
          ) : displayVersions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-gray-500">
                {t("noVersionsAvailable")}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-8">
              {displayVersions.map(version => {
                const isSelected =
                  currentVersionNumber !== undefined
                    ? version.versionNumber === currentVersionNumber
                    : version.versionNumber === 1;
                return (
                  <div
                    key={`version-${version.versionNumber}-${version.sentDate}`}
                    className={`rounded-lg p-5 border transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? "bg-primary/10 border-primary/50 shadow-md"
                        : "bg-gray-50 border-gray-200 hover:bg-primary/10 hover:border-primary/30 hover:shadow-md"
                    }`}
                    onClick={() => handleVersionClick(version)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="font-bold text-gray-900 text-base">
                            {version.versionName ||
                              `VERSION ${version.versionNumber}`}
                          </span>
                          <ExternalLink className="h-4 w-4 text-gray-600 shrink-0 group-hover:text-gray-900 transition-colors" />
                        </div>
                        <div className="text-sm text-gray-700 mb-2 font-medium">
                          Sent by {version.sentBy}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(version.sentDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
