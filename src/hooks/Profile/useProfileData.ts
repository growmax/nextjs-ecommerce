"use client";

import { useTenantCompany, useTenantId } from "@/contexts/TenantContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import UserPreferenceApiService from "@/lib/api/services/Settings/Profile/userPreference/userPreferenceApiService";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Profile {
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  altEmail: string;
  avatar?: string | null;
}

interface UserPreferencesData {
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
}

interface PreferenceOption {
  value: string;
  label: string;
}

interface PreferenceOptions {
  timeZoneOptions: PreferenceOption[];
  dateFormatOptions: PreferenceOption[];
  timeFormatOptions: PreferenceOption[];
}

export function useProfileData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferencesData>({
    timeZone: "",
    dateFormat: "",
    timeFormat: "",
  });
  const [preferenceOptions, setPreferenceOptions] = useState<PreferenceOptions>(
    {
      timeZoneOptions: [],
      dateFormatOptions: [],
      timeFormatOptions: [],
    }
  );
  const [isLoading, setIsLoading] = useState(true);
  // Current user and tenant context
  const { user } = useCurrentUser();
  const tenantId = useTenantId();
  const company = useTenantCompany();

  // Load profile data
  const loadProfile = async () => {
    try {
      const savedData = localStorage.getItem("profileData");

      const response = await fetch("/api/profile", {
        headers: {
          "x-tenant": "schwingstetterdemo",
        },
      });

      if (response.ok) {
        const apiData = await response.json();

        let data: Profile = {
          name: apiData.name || "",
          email: apiData.email || "",
          phone: apiData.phone?.replace("+91", "").replace("+null", "") || "",
          altPhone: apiData.altPhone || "",
          altEmail: apiData.altEmail || "",
          avatar: apiData.avatar || "",
        };

        if (savedData) {
          const saved = JSON.parse(savedData);
          data = { ...data, ...saved };
        }

        setProfile(data);
      } else {
        toast.error("Failed to load profile data");
      }
    } catch {
      toast.error("Failed to load profile data");
    }
  };

  // Load preferences data
  const loadPreferences = async () => {
    try {
      const savedPrefs = localStorage.getItem("userPreferences");

      const response = await fetch("/api/userpreferences");

      if (response.ok) {
        const apiData = await response.json();

        const timeZoneOptions =
          apiData.timeZoneOptions?.map(
            (tz: { value: string; key: string }) => ({
              value: tz.value,
              label: tz.key,
            })
          ) || [];

        const dateFormatOptions =
          apiData.dateFormatOptions?.map(
            (df: { value: string; dateFormatName: string }) => ({
              value: df.value,
              label: df.dateFormatName,
            })
          ) || [];

        const timeFormatOptions =
          apiData.timeFormatOptions?.map(
            (tf: { value: string; display: string }) => ({
              value: tf.value,
              label: tf.display,
            })
          ) || [];

        setPreferenceOptions({
          timeZoneOptions,
          dateFormatOptions,
          timeFormatOptions,
        });

        let defaultPreferences: UserPreferencesData = {
          timeZone: timeZoneOptions[0]?.value || "",
          dateFormat: dateFormatOptions[0]?.value || "",
          timeFormat: timeFormatOptions[0]?.value || "",
        };

        if (savedPrefs) {
          const saved = JSON.parse(savedPrefs);
          defaultPreferences = { ...defaultPreferences, ...saved };
        }

        setPreferences(defaultPreferences);
      } else {
        toast.error("Failed to load preferences data");
      }
    } catch {
      toast.error("Failed to load preferences data");
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile
  const saveProfile = async (profileData: Profile) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-tenant": "schwingstetterdemo",
        },
        body: JSON.stringify({
          name: profileData.name,
          phoneNumber: profileData.phone ? `+91${profileData.phone}` : "",
          altPhone: profileData.altPhone,
          altEmail: profileData.altEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      localStorage.setItem("profileData", JSON.stringify(profileData));
      setProfile(profileData);
      toast.success("Profile saved successfully!");

      return true;
    } catch {
      toast.error("Failed to save profile. Please try again.");
      return false;
    }
  };

  // Save preferences
  const savePreferences = async (preferencesData: UserPreferencesData) => {
    try {
      // Validate required fields before API call
      if (
        !preferencesData.timeZone ||
        !preferencesData.dateFormat ||
        !preferencesData.timeFormat
      ) {
        toast.error("Please fill all required preference fields");
        return false;
      }

      // Build payload expected by backend
      const payload: any = {
        dateFormat: preferencesData.dateFormat,
        timeFormat: preferencesData.timeFormat,
        timeZone: preferencesData.timeZone,
      };

      // Include optional ids if available in stored preferences
      if ((preferencesData as any)?.id)
        payload.id = (preferencesData as any).id;
      if (tenantId) payload.tenantId = tenantId;
      if (user && user.userId) payload.userId = { id: user.userId };
      payload.vendorId = company?.vendorId ?? null;

      const result = await UserPreferenceApiService.savePreference(payload);

      // Validate response
      if (
        !result ||
        !result.timeZone ||
        !result.dateFormat ||
        !result.timeFormat
      ) {
        throw new Error("Invalid response from server");
      }

      const saved = {
        timeZone: result.timeZone,
        dateFormat: result.dateFormat,
        timeFormat: result.timeFormat,
      };

      // Only update state and localStorage after successful API call
      localStorage.setItem("userPreferences", JSON.stringify(saved));
      setPreferences(saved);
      toast.success("Preferences saved successfully!");

      return true;
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
      return false;
    }
  };

  // Initialize data on mount
  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  return {
    profile,
    preferences,
    preferenceOptions,
    isLoading,
    setProfile,
    setPreferences,
    saveProfile,
    savePreferences,
    loadProfile,
    loadPreferences,
  };
}
