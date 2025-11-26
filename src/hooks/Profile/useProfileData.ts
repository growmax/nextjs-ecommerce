"use client";

import { useState } from "react";
import { toast } from "sonner";
import { usePostNavigationFetch } from "@/hooks/usePostNavigationFetch";

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
            (tf: { value: string; timeFormatName: string }) => ({
              value: tf.value,
              label: tf.timeFormatName,
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
      const response = await fetch("/api/userpreferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferencesData),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      localStorage.setItem("userPreferences", JSON.stringify(preferencesData));
      setPreferences(preferencesData);
      toast.success("Preferences saved successfully!");

      return true;
    } catch {
      toast.error("Failed to save preferences. Please try again.");
      return false;
    }
  };

  // Initialize data after navigation completes - ensures instant navigation
  usePostNavigationFetch(() => {
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
