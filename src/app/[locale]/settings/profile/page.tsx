"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { User, Check } from "lucide-react";
import HeaderBar from "@/app/Components/reusable/nameconversion/PageHeader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { SaveCancelToolbar } from "@/components/custom/save-cancel-toolbar";

// ----------------------
// Types
// ----------------------
interface Profile {
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  altEmail: string;
  avatar?: string | null;
}

interface UserPreferenceData {
  timeFormatOptions: { value: string; display: string }[];
  dateFormatOptions: { value: string; dateFormatName: string }[];
  timeZoneOptions: { key: string; value: string }[];
}

// ----------------------
// Custom ArrowDropDown Icon
// ----------------------
function ArrowDropDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="h-4 w-4 opacity-50"
      viewBox="0 0 24 24"
      focusable="false"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
}

// ----------------------
// Reusable AutoComplete Field
// ----------------------
interface AutoCompleteFieldProps {
  label: string;
  value: string;
  setValue: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange?: () => void;
}

function AutoCompleteField({
  label,
  value,
  setValue,
  options,
  placeholder,
  onChange,
}: AutoCompleteFieldProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>();

  useEffect(() => {
    if (triggerRef.current) setDropdownWidth(triggerRef.current.offsetWidth);
  }, [triggerRef.current?.offsetWidth]);

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between border rounded-lg px-2.5 py-1.5 text-sm text-left font-normal hover:border-gray-400 hover:ring-1 hover:ring-gray-400"
            ref={triggerRef}
          >
            <span className="truncate">{value || placeholder}</span>
            <ArrowDropDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 rounded-lg shadow-md"
          style={{ width: dropdownWidth }}
        >
          <Command>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    setValue(option.label);
                    setOpen(false);
                    onChange?.();
                  }}
                  className="flex justify-between px-2 py-1.5 text-sm cursor-pointer select-none rounded-md hover:bg-gray-100 hover:text-gray-700"
                >
                  {option.label}
                  {value === option.label && (
                    <Check className="h-4 w-4 text-gray-600" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ----------------------
// Profile Card
// ----------------------
function ProfileCard({
  profile,
  onFieldChange,
  name,
  setName,
  phoneNumber,
  setPhoneNumber,
  altPhone,
  setAltPhone,
  altEmail,
  setAltEmail,
}: {
  profile: Profile;
  onFieldChange: () => void;
  name: string;
  setName: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  altPhone: string;
  setAltPhone: (value: string) => void;
  altEmail: string;
  setAltEmail: (value: string) => void;
}) {
  const [logo, setLogo] = useState<string | null>(profile.avatar || null);

  // Validation states
  const [phoneError, setPhoneError] = useState("");
  const [altPhoneError, setAltPhoneError] = useState("");
  const [altEmailError, setAltEmailError] = useState("");

  // OTP verification states
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Validation functions
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (value && !validatePhone(value)) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError("");
    }
    onFieldChange();
  };

  const handleAltPhoneChange = (value: string) => {
    setAltPhone(value);
    if (value && !validatePhone(value)) {
      setAltPhoneError("Secondary phone must be exactly 10 digits");
    } else {
      setAltPhoneError("");
    }
    onFieldChange();
  };

  const handleAltEmailChange = (value: string) => {
    setAltEmail(value);
    if (value && !validateEmail(value)) {
      setAltEmailError("Please enter a valid email address");
    } else {
      setAltEmailError("");
    }
    onFieldChange();
  };

  const sendOtp = async () => {
    if (!phoneNumber || !validatePhone(phoneNumber)) {
      alert("Please enter a valid 10-digit phone number first");
      return;
    }
    setShowOtpDialog(true);
    // Implement OTP sending logic here
    // Sending OTP to phone number
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      // Implement OTP verification logic here
      // Verifying OTP

      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPhoneVerified(true);
      setShowOtpDialog(false);
      alert("Phone number verified successfully!");
    } catch {
      alert("OTP verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
      setOtp("");
    }
  };

  return (
    <div className="w-full rounded-xl shadow bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white rounded-t-xl">
        <span className="text-base font-semibold text-gray-800">
          Welcome Admin
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* Avatar */}
        <div className="flex justify-center sm:justify-start sm:flex-shrink-0">
          <label htmlFor="logo-upload" className="cursor-pointer block">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-white flex items-center justify-center relative overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors shadow-sm hover:shadow">
              {logo ? (
                <Image
                  src={logo}
                  alt="Profile"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex items-center justify-center">
                  <svg
                    className="w-8 h-8 sm:w-9 sm:h-9 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              )}
            </div>
          </label>
          <input
            id="logo-upload"
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        {/* Profile Fields */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Name */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                onFieldChange();
              }}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Mobile Number
            </label>
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    handlePhoneChange(value);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm pr-20 ${
                    phoneError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter 10-digit number"
                />
                {phoneNumber.length === 10 && !phoneVerified && (
                  <button
                    className="MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeSmall MuiButton-textSizeSmall MuiButton-colorPrimary MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeSmall MuiButton-textSizeSmall MuiButton-colorPrimary css-17xlhhi absolute right-1 top-1/2 -translate-y-1/2 text-xs h-5 px-2"
                    tabIndex={0}
                    type="button"
                    id="verify-phone"
                    onClick={sendOtp}
                  >
                    Verify
                    <span className="MuiTouchRipple-root css-w0pj6f"></span>
                  </button>
                )}
                {phoneVerified && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 text-xs">
                    ✓ Verified
                  </div>
                )}
              </div>
              {phoneError && (
                <p className="text-red-500 text-xs">{phoneError}</p>
              )}
            </div>
          </div>

          {/* Alt Phone */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Secondary Phone
            </label>
            <div className="space-y-1">
              <input
                type="text"
                value={altPhone}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  handleAltPhoneChange(value);
                }}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  altPhoneError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter 10-digit number"
              />
              {altPhoneError && (
                <p className="text-red-500 text-xs">{altPhoneError}</p>
              )}
            </div>
          </div>

          {/* Alt Email */}
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">
              Alternate Email
            </label>
            <div className="space-y-1">
              <input
                type="email"
                value={altEmail}
                onChange={e => handleAltEmailChange(e.target.value)}
                className={`w-full px-2 py-1.5 border rounded-lg text-sm bg-white ${
                  altEmailError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter valid email address"
              />
              {altEmailError && (
                <p className="text-red-500 text-xs">{altEmailError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent
          className="sm:max-w-md rounded-xl"
          showCloseButton={false}
        >
          <div className="flex items-center justify-between">
            <DialogTitle>Verify Phone Number</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={sendOtp}
              disabled={isVerifying}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Resend
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="otp-input"
                className="text-sm font-medium text-gray-700"
              >
                Enter OTP <span className="text-red-500">*</span>
              </Label>
              <input
                id="otp-input"
                type="text"
                value={otp}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowOtpDialog(false)}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button
                onClick={verifyOtp}
                disabled={isVerifying || otp.length !== 6}
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----------------------
// Main Profile Page
// ----------------------
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPrefData, setUserPrefData] = useState<UserPreferenceData | null>(
    null
  );

  const [selectedTimeZone, setSelectedTimeZone] = useState("");
  const [selectedDateFormat, setSelectedDateFormat] = useState("");
  const [selectedTimeFormat, setSelectedTimeFormat] = useState("");
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isPreferenceEditing, setIsPreferenceEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Profile form states
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [altEmail, setAltEmail] = useState("");

  // Original values for cancel functionality
  const [originalValues, setOriginalValues] = useState({
    name: "",
    phoneNumber: "",
    altPhone: "",
    altEmail: "",
  });

  const [originalPref, setOriginalPref] = useState({
    timeZone: "",
    dateFormat: "",
    timeFormat: "",
  });

  const handleProfileFieldChange = () => {
    setIsProfileEditing(true);
  };

  const handlePreferenceFieldChange = () => {
    setIsPreferenceEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would save the profile data
      // Saving profile data

      // Update original values
      setOriginalValues({
        name,
        phoneNumber,
        altPhone,
        altEmail,
      });

      setIsProfileEditing(false);
      toast.success("Profile saved successfully!");
    } catch {
      // Save failed
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setName(originalValues.name);
    setPhoneNumber(originalValues.phoneNumber);
    setAltPhone(originalValues.altPhone);
    setAltEmail(originalValues.altEmail);
    setIsProfileEditing(false);
    toast.info("Changes cancelled");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await fetch("/api/profile", {
          headers: {
            "x-tenant": "schwingstetterdemo",
          },
        });

        const profileJson = await profileRes.json();

        if (!profileRes.ok) {
          // Profile fetch failed
          alert(
            `Failed to load profile: ${profileJson.error || "Unknown error"}`
          );
          return;
        }

        // Profile data received
        const profileData = profileJson as Profile;
        setProfile(profileData);

        // Initialize form values
        const nameValue = profileData.name || "";
        const phoneValue =
          profileData.phone?.replace("+91", "").replace("+null", "") || "";
        const altPhoneValue = profileData.altPhone || "";
        const altEmailValue = profileData.altEmail || "";

        setName(nameValue);
        setPhoneNumber(phoneValue);
        setAltPhone(altPhoneValue);
        setAltEmail(altEmailValue);

        // Set original values
        setOriginalValues({
          name: nameValue,
          phoneNumber: phoneValue,
          altPhone: altPhoneValue,
          altEmail: altEmailValue,
        });

        const prefRes = await fetch("/api/userpreferences");
        const prefJson: UserPreferenceData = await prefRes.json();
        setUserPrefData(prefJson);

        const defaultTimeZone = prefJson?.timeZoneOptions?.[0]?.key ?? "";
        const defaultDateFormat = prefJson?.dateFormatOptions?.[0]?.value ?? "";
        const defaultTimeFormat = prefJson?.timeFormatOptions?.[0]?.value ?? "";

        setSelectedTimeZone(defaultTimeZone);
        setSelectedDateFormat(defaultDateFormat);
        setSelectedTimeFormat(defaultTimeFormat);

        setOriginalPref({
          timeZone: defaultTimeZone,
          dateFormat: defaultDateFormat,
          timeFormat: defaultTimeFormat,
        });
      } catch {}
    }
    fetchData();
  }, []);

  const handlePrefCancel = () => {
    setSelectedTimeZone(originalPref.timeZone);
    setSelectedDateFormat(originalPref.dateFormat);
    setSelectedTimeFormat(originalPref.timeFormat);
    setIsPreferenceEditing(false);
    toast.info("Changes cancelled");
  };

  const handlePrefSave = async () => {
    setIsLoading(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 2000));

      setOriginalPref({
        timeZone: selectedTimeZone,
        dateFormat: selectedDateFormat,
        timeFormat: selectedTimeFormat,
      });
      setIsPreferenceEditing(false);
      toast.success("Preferences saved successfully!");
    } catch {
      // Save failed
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile || !userPrefData) return <div className="p-6">Loading...</div>;

  return (
    <>
      <HeaderBar title="Profile Settings" icon={<User className="w-6 h-6" />} />
      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <ProfileCard
            profile={profile}
            onFieldChange={handleProfileFieldChange}
            name={name}
            setName={setName}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            altPhone={altPhone}
            setAltPhone={setAltPhone}
            altEmail={altEmail}
            setAltEmail={setAltEmail}
          />

          {/* User Preference */}
          <div className="w-full md:w-1/2 rounded-xl border border-gray-200 shadow bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b rounded-t-xl">
              <h2 className="text-sm font-semibold">User Preference</h2>
              {isPreferenceEditing && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrefCancel}
                    disabled={isLoading}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    onClick={handlePrefSave}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>

            <div className="p-3 space-y-2">
              <AutoCompleteField
                label="Time Zone"
                value={selectedTimeZone}
                setValue={setSelectedTimeZone}
                options={userPrefData.timeZoneOptions.map(t => ({
                  value: t.value,
                  label: t.key,
                }))}
                placeholder="Select Time Zone"
                onChange={() => handlePreferenceFieldChange()}
              />
              <AutoCompleteField
                label="Date Display Format"
                value={selectedDateFormat}
                setValue={setSelectedDateFormat}
                options={userPrefData.dateFormatOptions.map(d => ({
                  value: d.value,
                  label: d.dateFormatName,
                }))}
                placeholder="Select Date Format"
                onChange={() => handlePreferenceFieldChange()}
              />
              <AutoCompleteField
                label="Time Format"
                value={selectedTimeFormat}
                setValue={setSelectedTimeFormat}
                options={userPrefData.timeFormatOptions.map(t => ({
                  value: t.value,
                  label: t.display,
                }))}
                placeholder="Select Time Format"
                onChange={() => handlePreferenceFieldChange()}
              />
            </div>
          </div>
        </div>
      </main>

      {/* SaveCancel Toolbar for Profile Changes */}
      <SaveCancelToolbar
        show={isProfileEditing}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
        saveText="Save Profile"
        cancelText="Cancel"
      />
    </>
  );
}
