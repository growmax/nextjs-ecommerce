"use client";

import { useTenantCompany, useTenantInfo } from "@/contexts/TenantContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CompanyService from "@/lib/api/services/CompanyService";
import UserPreferenceApiService from "@/lib/api/services/Settings/Profile/userPreference/userPreferenceApiService";
import { useCallback, useEffect, useRef, useState } from "react";
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
  id: string;
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
  const company = useTenantCompany();
  const tenantInfo = useTenantInfo();
  const tenantId = tenantInfo?.tenantCode;
  const domainName = tenantInfo?.tenantDomain;
  const userId = user?.userId;
  const [profileDatas, setProfileDatas] = useState([])
  // Use refs to track if data has been loaded to prevent multiple calls
  const profileLoadedRef = useRef(false);
  const preferencesLoadedRef = useRef(false);

  // Load profile data - called only once
  const loadProfile = useCallback(async () => {
    if (profileLoadedRef.current) return;

    try {
      profileLoadedRef.current = true;

      const response = await CompanyService.getProfile(
        tenantId || domainName
          ? {
            ...(tenantId && { tenantId }),
            ...(domainName && { domain: domainName }),
          }
          : undefined
      );

      // Handle nested response structure: response.data.data
      const apiData = (response as any)?.data?.data || (response as any)?.data || response;
      setProfileDatas(apiData);
      if (apiData) {
        // Extract phone number and remove country code prefixes
        const phoneNumber = apiData.phoneNumber || "";
        const cleanedPhone = phoneNumber
          .replace(/^\+91/, "")
          .replace(/^\+null/, "")
          .replace(/^null/, "")
          .trim();

        const data: Profile = {
          name: apiData.displayName || "",
          email: apiData.email || "",
          phone: cleanedPhone,
          altPhone: apiData.secondaryPhoneNumber || "",
          altEmail: apiData.secondaryEmail || "",
          avatar: apiData.avatar || null,
        };

        setProfile(data);
      } else {
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile data");
      profileLoadedRef.current = false; // Reset on error to allow retry
    }
  }, [tenantId, domainName]);

  // Load preferences data - called only once when userId is available
  const loadPreferences = useCallback(async () => {
    if (preferencesLoadedRef.current || !userId) {
      if (!userId) {
        setIsLoading(false);
      }
      return;
    }

    try {
      preferencesLoadedRef.current = true;

      // Get user preferences from service
      const response = await CompanyService.getUserPreference({
        userId: userId.toString(),
      });

      // Handle nested response structure: response.data.data
      const apiData = (response as any)?.data?.data || (response as any)?.data || response;

      if (apiData) {
        // Extract preferences from API response
        const preferencesData: UserPreferencesData = {
          timeZone: apiData[0]?.timeZone || "",
          dateFormat: apiData[0]?.dateFormat || "",
          timeFormat: apiData[0]?.timeFormat || "",
          id: apiData[0]?.id || "",
        };

        setPreferences(preferencesData);
      } else {
        toast.error("Failed to load preferences data");
      }

      // Load preference options from API (still needed for dropdowns)
      const optionsResponse = await fetch("/api/userpreferences");

      if (optionsResponse.ok) {
        const optionsData = await optionsResponse.json();

        const timeZoneOptions =
          optionsData.timeZoneOptions?.map(
            (tz: { value: string; key: string }) => ({
              value: tz.value,
              label: tz.key,
            })
          ) || [];

        const dateFormatOptions =
          optionsData.dateFormatOptions?.map(
            (df: { value: string; dateFormatName: string }) => ({
              value: df.value,
              label: df.dateFormatName,
            })
          ) || [];

        const timeFormatOptions =
          optionsData.timeFormatOptions?.map(
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
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
      toast.error("Failed to load preferences data");
      preferencesLoadedRef.current = false; // Reset on error to allow retry
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Save profile
  const saveProfile = async (profileData: Profile) => {
    try {
      setProfile(profileData);
      toast.success("Profile saved successfully!");

      return true;
    } catch (error) {
      console.error("Failed to save profile:", error);
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

      // Update state after successful API call
      setPreferences(saved);
      toast.success("Preferences saved successfully!");

      return true;
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
      return false;
    }
  };

  // Initialize data on mount - call services only once
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (userId) {
      loadPreferences();
    } else {
      setIsLoading(false);
    }
  }, [userId, loadPreferences]);

  return {
    profile,
    preferences,
    preferenceOptions,
    profileDatas,
    setProfileDatas,
    isLoading,
    setProfile,
    setPreferences,
    saveProfile,
    savePreferences,
    loadProfile,
    loadPreferences,
  };
}
