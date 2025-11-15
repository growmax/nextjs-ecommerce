"use client";

// removed unused User icon import (design now uses SectionCard header)
import SectionCard from "@/components/custom/SectionCard";
import { FormField } from "@/components/forms/FormField/FormField";
import { ImageUpload } from "@/components/forms/ImageUpload/ImageUpload";
import { PhoneInput } from "@/components/forms/PhoneInput/PhoneInput";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface Profile {
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  altEmail: string;
  avatar?: string | null;
}

interface ProfileCardProps {
  profile: Profile | null;
  onChange: (field: string, value: string) => void;
  onImageChange: (image: string) => void;
  onVerifyPhone?: (phone: string) => void;
  phoneVerified?: boolean;
  isLoading?: boolean;
  dataLoading?: boolean;
  countryCode?: string;
  profileImage?: string | null;
  originalPhone?: string | null;
  originalAltPhone?: string | null;
  headerActions?: React.ReactNode;
}

export function ProfileCard({
  profile,
  onChange,
  onImageChange,
  onVerifyPhone,
  phoneVerified = false,
  isLoading = false,
  dataLoading = false,
  countryCode,
  profileImage = null,
  originalPhone = null,
  originalAltPhone = null,
  headerActions = null,
}: ProfileCardProps) {
  if (dataLoading || !profile) {
    return (
      <SectionCard
        title="Personal Information"
        className="w-full"
        headerActions={headerActions}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Left: Image skeleton */}
            <div className="p-6 md:p-8 flex flex-col items-stretch gap-2">
              <Skeleton className="w-40 h-40 rounded-xl" />
            </div>

            {/* Right: field skeletons */}
            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Personal Information"
      className="w-full"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Left: Profile Image Column */}
          <div className="p-6 md:p-8 flex flex-col items-stretch gap-2">
            <ImageUpload
              currentImage={profileImage || profile.avatar || null}
              onImageChange={onImageChange}
              alt="Profile"
              size="lg"
              shape="square"
              disabled={isLoading}
            />
          </div>

          {/* Right: Fields take remaining 3 columns */}
          <div className="col-span-3 grid grid-cols-1 sm:grid-cols-1 gap-y-0.1 gap-x-6">
            {/* Name */}
            <FormField label="Name" required>
              <Input
                type="text"
                value={profile.name}
                onChange={e => onChange("name", e.target.value)}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </FormField>

            {/* Email (Read-only) */}
            <FormField label="Email">
              <Input
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </FormField>

            {/* Phone */}
            <PhoneInput
              label="Mobile Number"
              value={profile.phone}
              onChange={value => onChange("phone", value)}
              {...(onVerifyPhone && { onVerify: onVerifyPhone })}
              {...(countryCode ? { countryCode } : {})}
              {...(originalPhone ? { originalValue: originalPhone } : {})}
              verified={phoneVerified}
              required
              disabled={isLoading}
            />

            {/* Alt Phone */}
            <PhoneInput
              label="Secondary Phone"
              value={profile.altPhone || ""}
              onChange={value => onChange("altPhone", value)}
              {...(onVerifyPhone && { onVerify: onVerifyPhone })}
              {...(countryCode ? { countryCode } : {})}
              {...(originalAltPhone ? { originalValue: originalAltPhone } : {})}
              disabled={isLoading}
            />

            {/* Alt Email */}
            <div className="sm:col-span-2">
              <FormField label="Alternate Email">
                <Input
                  type="email"
                  value={profile.altEmail}
                  onChange={e => onChange("altEmail", e.target.value)}
                  placeholder="Enter alternate email address"
                  disabled={isLoading}
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
