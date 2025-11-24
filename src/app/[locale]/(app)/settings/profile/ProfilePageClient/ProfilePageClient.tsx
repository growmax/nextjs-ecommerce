"use client";

import HeaderBar from "@/components/Global/HeaderBar/HeaderBar";
import { SaveCancelToolbar } from "@/components/custom/save-cancel-toolbar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// Import our new modular components
import { OTPDialog } from "@/components/SettingsProfile/OTPDialog/OTPDialog";
import { PasswordChangeDialog } from "@/components/SettingsProfile/PasswordChangeDialog/PasswordChangeDialog";
import { ProfileCard } from "@/components/SettingsProfile/ProfileCard/ProfileCard";
import { UserPreferencesCard } from "@/components/SettingsProfile/UserPreferencesCard/UserPreferencesCard";
import { Button } from "@/components/ui/button";
import { useTenantInfo } from "@/contexts/TenantContext";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import { useProfileData } from "@/hooks/Profile/useProfileData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AuthService, CompanyService } from "@/lib/api";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import parsePhoneNumberFromString from "libphonenumber-js";
import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";
export default function ProfilePageClient() {
  const t = useTranslations("profileSettings");
  const {
    profile,
    preferences,
    preferenceOptions,
    profileDatas,
    isLoading: dataLoading,
    setProfile,
    setPreferences,
    savePreferences,
    loadProfile,
    loadPreferences,
  } = useProfileData();
   const {user,sub1}=useCurrentUser();
   const defaultCountryCallingCode = user?.defaultCountryCallingCode || "";
   const userId = user?.userId;
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneNumber,setPhoneNumber] = useState<string | number>();
  const [otp, setOtp] = useState("");
  const defaultCountryCodeIso = user?.defaultCountryCodeIso || "";
  const tenantInfo = useTenantInfo();
  const tenantId = tenantInfo?.tenantCode;
  const { isAuthenticated } = useUserDetails();
  const [sub, setSub] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  useEffect(() => {
    if (isAuthenticated) {
      const token = AuthStorage.getAccessToken();
      if (token) {
        const jwtService = JWTService.getInstance();
        const payload = jwtService.decodeToken(token);
        setSub(payload?.sub || null);
        setCompanyId(payload?.companyId || null);
      }
    } else {
      setSub(null);
      setCompanyId(null);
    }
  }, [isAuthenticated]);
  // Unified change tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [changedSections, setChangedSections] = useState<
    Set<"profile" | "preferences">
  >(new Set());
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    phone?: string;
    altEmail?: string;
  }>({});

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
    if(field === "phone"){
      setPhoneNumber(`+${defaultCountryCallingCode}${value}`)
    }
    
    // Clear validation error for this field when user types
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof validationErrors];
        return newErrors;
      });
    }
    
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    updateChangedSections("profile");
  };
 
  // Store the uploaded image URL separately for the picture parameter
  const [uploadedPictureUrl, setUploadedPictureUrl] = useState<string | null>(null);

  const handleImageChange = (image: string) => {
    if (!profile) return;

    // Update both avatar and picture fields for immediate preview
    const updatedProfile = { ...profile, avatar: image, picture: image };
    setProfile(updatedProfile);
    
    // Store the merged URL if it's a full S3 URL (not a blob URL)
    if (image && !image.startsWith('blob:')) {
      setUploadedPictureUrl(image);
    }
    
    updateChangedSections("profile");
  };

  const handlePreferenceChange = (
    field: keyof typeof preferences,
    value: string
  ) => {
    const updatedPreferences = { ...preferences, [field]: value };
    setPreferences(updatedPreferences);
    // updateChangedSections("preferences");
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
    // Clear validation errors when canceling
    setValidationErrors({});
    setChangedSections(new Set());
    setHasChanges(false);
  };
 
  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    if (!email || email.trim() === "") return true; // Empty is allowed for optional fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Validation helper
  const validateProfile = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!profile) {
      return { isValid: false, errors: [t("profile") + " data is missing"] };
    }

    // Validate required fields
    if (!profile.name || profile.name.trim() === "") {
      errors.push(t("name") + " is required");
    }

    if (!profile.phone || profile.phone.trim() === "") {
      errors.push(t("mobileNumber") + " is required");
    }

    // Validate email format for alternate email
    if (profile.altEmail && profile.altEmail.trim() !== "") {
      if (!isValidEmail(profile.altEmail)) {
        errors.push(t("alternateEmail") + " must be a valid email address");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Unified save handler
  const handleSave = async () => {
    if (!hasChanges) return;
    if (!profile) return;
    if (!sub && !userId) {
      toast.error("User ID is required"); // TODO: Add translation key
      return;
    }
    if (!tenantId) {
      toast.error("Tenant ID is required"); // TODO: Add translation key
      return;
    }

    // Validate profile data
    const validation = validateProfile();
    if (!validation.isValid) {
      // Set validation errors for display (no toast notifications)
      const errors: typeof validationErrors = {};
      validation.errors.forEach((error) => {
        if (error.includes("Name")) errors.name = error;
        if (error.includes("Mobile Number")) errors.phone = error;
        if (error.includes("Alternate Email")) errors.altEmail = error;
      });
      setValidationErrors(errors);
      setIsSaving(false);
      return;
    }
    
    // Clear validation errors if validation passes
    setValidationErrors({});

    setIsSaving(true);
    const phoneWithCountryCode = profile?.phone 
      ? `+${defaultCountryCallingCode}${profile.phone}` 
      : (profileDatas as any)?.phoneNumber || "";

    try {
      // Build body in the exact order expected by the API
      const profileData = (profileDatas as any) || {};
      const countryCode = (defaultCountryCodeIso || "IN") as any;
      const parsedMobileNumber = parsePhoneNumberFromString(profile?.phone || "", countryCode);
      
      const body: any = {
        id: String(profileData?.id || ""),
        tenantId: String(tenantId),
        displayName: String(profile?.name || ""),
        email: String(profile?.email || profileData?.email || ""),
        secondaryEmail: String(profile?.altEmail || profileData?.secondaryEmail || ""),
        emailVerified: Boolean(profileData?.emailVerified ?? true),
        hasPassword: Boolean(profileData?.hasPassword ?? true),
        status: String(profileData?.status || "CONFIRMED"),
        isSeller: Boolean(profileData?.isSeller ?? false),
        callingCodes: String(parsedMobileNumber?.countryCallingCode || defaultCountryCallingCode || ""),
        callingCodesSecondary: String(defaultCountryCallingCode || ""),
        countryCallingCode: String(parsedMobileNumber?.countryCallingCode || defaultCountryCallingCode || ""),
        countryCallingCodeSecondary: String(defaultCountryCallingCode || ""),
        iso2: String(parsedMobileNumber?.country || defaultCountryCodeIso || ""),
        iso2Secondary: String(defaultCountryCodeIso || ""),
        phoneNumber: String(phoneWithCountryCode || ""),
        phoneNumberVerified: Boolean(profileData?.phoneNumberVerified ?? false),
        nationalMobileNum: String(parsedMobileNumber?.nationalNumber || profile?.phone || ""),
        nationalMobileNumSecondary: String(profile?.altPhone || ""),
        secondaryPhoneNumber: String(profile?.altPhone || ""),
      };

      // Add picture parameter if uploaded image URL is available
      if (uploadedPictureUrl) {
        body.picture = uploadedPictureUrl;
      }

      const promises: Promise<boolean>[] = [];
      
      // Save profile if changed
      if (changedSections.has("profile")) {
        const userIdToUse = sub;
        if (!userIdToUse) {
          toast.error("User ID is required"); // TODO: Add translation key
          setIsSaving(false);
          return;
        }
        promises.push(
          CompanyService.updateProfile(userIdToUse, body).then(() => true).catch((error) => {
            console.error("Failed to update profile:", error);
            return false;
          })
        );
      }

      // Save preferences if changed
      if (changedSections.has("preferences") && preferences) {
        promises.push(savePreferences(preferences));
      }

      // If no promises to execute, return early
      if (promises.length === 0) {
        toast.info(t("allChangesCancelled"));
        setIsSaving(false);
        return;
      }

      const results = await Promise.all(promises);
      const allSuccessful = results.every(Boolean);

      if (allSuccessful) {
        // Reload profile data after successful save
        if (changedSections.has("profile")) {
          await loadProfile(true); // Force reload
          // toast.success("Changes saved successfully!");
          setOriginalProfile(profile);
          // Clear uploaded picture URL after successful save
          setUploadedPictureUrl(null);
        }
        if (changedSections.has("preferences")) {
          await loadPreferences(true); // Force reload
          setOriginalPreferences(preferences);
        }

        // Clear change tracking
        setChangedSections(new Set());
        setHasChanges(false);
        toast.success(t("changesSavedSuccessfully"));
      } else {
        toast.error(t("someChangesFailedToSave"));
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(t("failedToSaveChanges"));
    } finally {
      setIsSaving(false);
    }
  };

  // Unified cancel handler
  const handleCancel = () => {
    resetAllChanges();
      toast.info(t("allChangesCancelled"));
  };

  const handleVerifyPhone = async(phone: string) => {
    if (!phone) {
      toast.error(t("mobileNumber") + " is required");
      return;
    }

    // Construct phone number with country code and store it
    const phoneWithCountryCode = `+${defaultCountryCallingCode}${phone}`;
    setPhoneNumber(phoneWithCountryCode);
    
    const body = {
      phoneNumber: phoneWithCountryCode,
    };
    
    try {
      const res = await CompanyService.verfiy({ body });
      if(res){
        setShowOTPDialog(true);
      }
    } catch (error) {
      console.error("Failed to send verification:", error);
      toast.error(t("failedToSaveChanges"));
    }
  };

  const handleOTPVerify = async (otpValue: string) => {
    if (!otpValue || otpValue.length !== 6) {
      toast.error(t("enter6DigitOtp"));
      return;
    }

    if (!phoneNumber) {
      toast.error(t("mobileNumber") + " is required");
      return;
    }

    if (!userId) {
      toast.error("User ID is required");
      return;
    }

    const body = {
      Otp: otpValue,
      UserName: phoneNumber,
      isEmail: false,
      userId: userId,
    };

    try {
      const res = await CompanyService.verfiyOTp({ body });
      if (res) {
        setPhoneVerified(true);
        setShowOTPDialog(false);
        toast.success(t("phoneNumberVerifiedSuccessfully"));
      }
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      toast.error(t("failedToSaveChanges"));
    }
  };

  const handlePasswordChange = async (data: {
    otp: string;
    newPassword: string;
  }) => {
    if (!profile?.email) {
      toast.error(t("email") + " is required for password change");
      return;
    }

    try {
      await AuthService.verifyReset({
        UserName: profile.email,
        Otp: data.otp,
        Password: data.newPassword,
      });
      toast.success(t("passwordChangedSuccessfully"));
      setShowPasswordDialog(false);
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(t("failedToSaveChanges"));
      throw error; // Re-throw so dialog can handle it
    }
  };

  const handleSendPasswordOtp = async () => {
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(t("otpSentSuccessfully"));
  };

  return (
    <div className="flex flex-col h-full">
      <div id="profile-header" className="h-[48px] md:h-[64px] flex-shrink-0">
        <HeaderBar title={t("profileSettings")} />
      </div>

      <main
        className={`flex-1 px-4  sm:px-4 md:px-8 lg:px-16 pt-4 pb-4 md:pt-6 overflow-x-hidden overflow-y-auto min-h-0 ${hasChanges ? "pb-32 md:pb-24" : "pb-16"}`}
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
            validationErrors={validationErrors}
            folderName={
              companyId && sub1
                ? `app_assets/company_images/${companyId}/profile/${sub1}`
                : undefined
            }
            headerActions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
                aria-label="Change Password"
              >
                <Shield className="h-4 w-4" />
                {t("changePassword")}
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
              onSaveSuccess={async () => {
                await loadPreferences(true);
              }}
              {...(userId && { userId })}
              {...(tenantId && { tenantId })}
              {...((preferences as any)?.id && { preferenceId: parseInt((preferences as any).id) })}
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
        saveText={t("saveChanges")}
        cancelText={t("cancel")}
        className="bottom-4 left-0 right-0 md:bottom-auto md:top-[69px] md:left-0 lg:left-64 z-50"
        anchorSelector="#profile-header"
      />

      {/* Phone Verification Dialog */}
      <OTPDialog
       otp={otp}
       setOtp={setOtp}
        open={showOTPDialog}
        onOpenChange={setShowOTPDialog}
        onVerify={handleOTPVerify}
        title={t("verifyPhoneNumber")}
        description={t("enterOtpSentToMobile")}
      />

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onPasswordChange={handlePasswordChange}
        onSendOtp={handleSendPasswordOtp}
        {...(profile?.email && { userName: profile.email })}
      />

    </div>
  );
}
