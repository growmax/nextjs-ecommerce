"use client";

import HeaderBar from "@/components/Global/HeaderBar/HeaderBar";
import { SaveCancelToolbar } from "@/components/custom/save-cancel-toolbar";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Import our new modular components
import { OTPDialog } from "@/components/profile/OTPDialog";
import { PasswordChangeDialog } from "@/components/profile/PasswordChangeDialog";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { UserPreferencesCard } from "@/components/profile/UserPreferencesCard";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/Profile/useProfileData";
import { Shield } from "lucide-react";

export default function ProfilePageClient() {
  const {
    profile,
    preferences,
    preferenceOptions,
    isLoading: dataLoading,
    setProfile,
    setPreferences,
    saveProfile,
    savePreferences,
  } = useProfileData();

  // Unified UI States
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Unified change tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [changedSections, setChangedSections] = useState<
    Set<"profile" | "preferences">
  >(new Set());

  // Original values for reset functionality
  const [originalProfile, setOriginalProfile] = useState(profile);
  const [originalPreferences, setOriginalPreferences] = useState(preferences);

  // Update originals when data loads - using useEffect to avoid render issues
  useEffect(() => {
    if (profile && !originalProfile) {
      setOriginalProfile(profile);
    }
  }, [profile, originalProfile]);

  useEffect(() => {
    if (
      preferences &&
      (!originalPreferences || !originalPreferences.timeZone)
    ) {
      setOriginalPreferences(preferences);
    }
  }, [preferences, originalPreferences]);

  // Unified change tracking helper
  const updateChangedSections = (section: "profile" | "preferences") => {
    setChangedSections(prev => {
      const newSet = new Set(prev);
      newSet.add(section);
      setHasChanges(newSet.size > 0);
      return newSet;
    });
  };

  const handleProfileChange = (field: string, value: string) => {
    if (!profile) return;

    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    updateChangedSections("profile");
  };

  const handleImageChange = (image: string) => {
    if (!profile) return;

    const updatedProfile = { ...profile, avatar: image };
    setProfile(updatedProfile);
    updateChangedSections("profile");
  };

  const handlePreferenceChange = (
    field: keyof typeof preferences,
    value: string
  ) => {
    const updatedPreferences = { ...preferences, [field]: value };
    setPreferences(updatedPreferences);
    updateChangedSections("preferences");
  };

  // Reset all changes helper - restore original values
  const resetAllChanges = () => {
    // Only reset sections that actually changed and have original values
    if (changedSections.has("profile") && originalProfile) {
      setProfile(originalProfile);
    }
    if (changedSections.has("preferences") && originalPreferences) {
      setPreferences(originalPreferences);
    }
    setChangedSections(new Set());
    setHasChanges(false);
  };

  // Unified save handler
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    const promises: Promise<boolean>[] = [];

    // Build array of save operations based on what changed
    if (changedSections.has("profile") && profile) {
      promises.push(saveProfile(profile));
    }
    if (changedSections.has("preferences") && preferences) {
      promises.push(savePreferences(preferences));
    }

    try {
      const results = await Promise.all(promises);
      const allSuccessful = results.every(Boolean);

      if (allSuccessful) {
        // Update original values for successful saves
        if (changedSections.has("profile")) {
          setOriginalProfile(profile);
        }
        if (changedSections.has("preferences")) {
          setOriginalPreferences(preferences);
        }

        // Clear change tracking only (don't reset values after successful save)
        setChangedSections(new Set());
        setHasChanges(false);
        toast.success("Changes saved successfully!");
      } else {
        toast.error("Some changes failed to save. Please try again.");
      }
    } catch (_error) {
      toast.error("Failed to save changes. Please try again.");
    }

    setIsSaving(false);
  };

  // Unified cancel handler
  const handleCancel = () => {
    resetAllChanges();
    toast.info("All changes cancelled");
  };

  const handleVerifyPhone = (_phone: string) => {
    setShowOTPDialog(true);
  };

  const handleOTPVerify = async (_otp: string) => {
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPhoneVerified(true);
    toast.success("Phone number verified successfully!");
  };

  const handlePasswordChange = async (_data: {
    otp: string;
    newPassword: string;
  }) => {
    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("Password changed successfully!");
  };

  const handleSendPasswordOtp = async () => {
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("OTP sent successfully!");
  };

  return (
    <>
      <div id="profile-header" className="h-[48px] md:h-[64px]">
        <HeaderBar title="Profile Settings" />
      </div>

      <main
        className={`flex-1 px-4 pb-4 overflow-x-hidden ${hasChanges ? "pb-32 md:pb-24" : "pb-16"}`}
      >
        <div className="max-w-6xl mx-auto space-y-6 w-full">
          {/* Profile Information */}
          <ProfileCard
            profile={profile}
            onChange={handleProfileChange}
            onImageChange={handleImageChange}
            onVerifyPhone={handleVerifyPhone}
            phoneVerified={phoneVerified}
            isLoading={isSaving}
            dataLoading={dataLoading}
            headerActions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
                aria-label="Change Password"
              >
                <Shield className="h-4 w-4" />
                Change Password
              </Button>
            }
          />

          {/* User Preferences */}
          <div className="w-full md:max-w-2xl">
            <UserPreferencesCard
              preferences={preferences}
              onChange={handlePreferenceChange}
              timeZoneOptions={preferenceOptions.timeZoneOptions}
              dateFormatOptions={preferenceOptions.dateFormatOptions}
              timeFormatOptions={preferenceOptions.timeFormatOptions}
              isLoading={isSaving}
              dataLoading={dataLoading}
            />
          </div>
        </div>
      </main>

      {/* Unified Save/Cancel Toolbar */}
      <SaveCancelToolbar
        show={hasChanges}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isSaving}
        saveText="Save Changes"
        cancelText="Cancel"
        className="bottom-4 left-0 right-0 md:bottom-auto md:top-[69px] md:left-0 lg:left-64 z-50"
        anchorSelector="#profile-header"
      />

      {/* Phone Verification Dialog */}
      <OTPDialog
        open={showOTPDialog}
        onOpenChange={setShowOTPDialog}
        onVerify={handleOTPVerify}
        title="Verify Phone Number"
        description="Enter the OTP sent to your mobile number"
      />

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onPasswordChange={handlePasswordChange}
        onSendOtp={handleSendPasswordOtp}
      />
    </>
  );
}
