import type { UserPreferences } from "@/types/details/orderdetails/version.types";

/**
 * Get user preferences for date/time formatting from localStorage
 * Falls back to default values if not available
 */
export function getUserPreferences(): UserPreferences {
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
    // Fallback to defaults on parse error
  }

  return {
    timeZone: "Asia/Kolkata",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "hh:mm a",
  };
}
