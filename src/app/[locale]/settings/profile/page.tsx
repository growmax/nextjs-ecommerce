"use client";

import { useState, useEffect, useRef } from "react";
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
import { FullWidthLayout } from "@/components/layout/PageContent";

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
            className="w-full justify-between border rounded-md px-3 py-1.5 text-sm text-left font-normal"
            ref={triggerRef}
          >
            <span className="truncate">{value || placeholder}</span>
            <ArrowDropDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" style={{ width: dropdownWidth }}>
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
                  className="flex justify-between px-2 py-1.5 text-sm cursor-pointer select-none rounded-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {option.label}
                  {value === option.label && (
                    <Check className="h-4 w-4 text-primary" />
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
// Profile Card (Editable Welcome Name)
// ----------------------
function ProfileCard({ profile }: { profile: Profile }) {
  const [logo, setLogo] = useState<string | null>(profile.avatar || null);
  const [name, setName] = useState(profile.name);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 shadow-sm bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-base font-semibold">Welcome</span>
        <Button variant="outline" size="sm">
          Change Password
        </Button>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center border rounded-md p-4">
          <label htmlFor="logo-upload" className="cursor-pointer">
            {logo ? (
              <Image
                src={logo}
                alt="Logo"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </div>
            )}
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <span className="text-xs text-gray-500 mt-2">Upload Logo</span>
        </div>

        {/* Profile Fields */}
        <div className="md:col-span-2 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <input
                type="email"
                value={profile.email}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
                readOnly
              />
            </div>

            <div className="space-y-1">
              <Label>Phone Number</Label>
              <input
                type="text"
                value={profile.phone}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
                readOnly
              />
            </div>

            <div className="space-y-1">
              <Label>Alternative Phone Number</Label>
              <input
                type="text"
                value={profile.altPhone || ""}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
                readOnly
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Alternate Email</Label>
              <input
                type="email"
                value={profile.altEmail}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
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

  const [isEditing, setIsEditing] = useState(false);

  // Store original values to allow cancel
  const [originalPref, setOriginalPref] = useState({
    timeZone: "",
    dateFormat: "",
    timeFormat: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await fetch("/api/profile");
        const profileJson: Profile = await profileRes.json();
        setProfile(profileJson);

        const prefRes = await fetch("/api/userpreferences");
        const prefJson: UserPreferenceData = await prefRes.json();
        setUserPrefData(prefJson);

        // Set defaults with optional chaining
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
      } catch {
        // safely ignore error or add proper handling
      }
    }
    fetchData();
  }, []);

  const handleCancel = () => {
    setSelectedTimeZone(originalPref.timeZone);
    setSelectedDateFormat(originalPref.dateFormat);
    setSelectedTimeFormat(originalPref.timeFormat);
    setIsEditing(false);
  };

  const handleSave = () => {
    setOriginalPref({
      timeZone: selectedTimeZone,
      dateFormat: selectedDateFormat,
      timeFormat: selectedTimeFormat,
    });
    setIsEditing(false);
  };

  if (!profile || !userPrefData) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      <HeaderBar title="Profile Settings" icon={<User className="w-6 h-6" />} />
      <FullWidthLayout>
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <ProfileCard profile={profile} />

            {/* User Preference Card */}
            <div className="w-full md:w-1/2 rounded-lg border border-gray-200 shadow-sm bg-white">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <h2 className="text-base font-semibold">User Preference</h2>
                {isEditing && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSave}>
                      Save
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2.5">
                <AutoCompleteField
                  label="Time Zone"
                  value={selectedTimeZone}
                  setValue={setSelectedTimeZone}
                  options={userPrefData.timeZoneOptions.map(t => ({
                    value: t.value,
                    label: t.key,
                  }))}
                  placeholder="Select Time Zone"
                  onChange={() => setIsEditing(true)}
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
                  onChange={() => setIsEditing(true)}
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
                  onChange={() => setIsEditing(true)}
                />
              </div>
            </div>
          </div>
        </main>
      </FullWidthLayout>
    </>
  );
}
