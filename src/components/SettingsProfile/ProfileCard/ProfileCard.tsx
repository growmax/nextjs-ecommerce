"use client";

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
        className="w-full py-2.5"
        headerActions={headerActions}
      >
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
            <div className="flex flex-col items-center md:items-start justify-center p-2 md:p-3 lg:p-4 mb-3 md:mb-0 w-full md:w-auto md:self-start">
              <Skeleton className="w-full max-w-[120px] sm:max-w-[100px] md:max-w-[110px] lg:max-w-[120px] aspect-square rounded-xl mx-auto md:mx-0" />
            </div>

            <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-3 md:gap-x-4 gap-y-3 md:gap-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
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
      className="w-full py-2.5"
      headerActions={headerActions}
    >
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5">

          {/* Profile Image */}
          <div className="flex flex-col items-center md:items-start justify-center p-2 md:p-3 lg:p-4 mb-3 md:mb-0 w-full md:w-auto md:self-start">
            <div className="w-full max-w-[120px] sm:max-w-[100px] md:max-w-[110px] lg:max-w-[120px] mx-auto md:mx-0">
              <ImageUpload
                currentImage={profileImage || profile.avatar || null}
                onImageChange={onImageChange}
                alt="Profile"
                size="lg"
                shape="square"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-3 md:gap-x-4 gap-y-3 md:gap-y-4">

            {/* Name */}
            <div className="min-w-0">
              <FormField label="Name" required>
                <Input
                  type="text"
                  value={profile.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  className="h-9"
                />
              </FormField>
            </div>

            {/* Email */}
            <div className="min-w-0">
              <FormField label="Email">
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted h-9"
                />
              </FormField>
            </div>

            {/* Phone */}
            <div className="min-w-0">
              <PhoneInput
                label="Mobile Number"
                value={profile.phone}
                onChange={(value) => onChange("phone", value)}
                {...(onVerifyPhone && { onVerify: onVerifyPhone })}
                {...(countryCode ? { countryCode } : {})}
                {...(originalPhone ? { originalValue: originalPhone } : {})}
                verified={phoneVerified}
                required
                disabled={isLoading}
              />
            </div>

            {/* Secondary Phone */}
            <div className="min-w-0">
              <PhoneInput
                label="Secondary Phone"
                value={profile.altPhone || ""}
                onChange={(value) => onChange("altPhone", value)}
                // {...(onVerifyPhone && { onVerify: onVerifyPhone })}
                {...(countryCode ? { countryCode } : {})}
                {...(originalAltPhone ? { originalValue: originalAltPhone } : {})}
                disabled={isLoading}
              />
            </div>

            {/* Alternate Email */}
            <div className="min-w-0 sm:col-span-2">
              <FormField label="Alternate Email">
                <Input
                  type="email"
                  value={profile.altEmail}
                  onChange={(e) => onChange("altEmail", e.target.value)}
                  placeholder="Enter alternate email address"
                  disabled={isLoading}
                  className="h-9"
                />
              </FormField>
            </div>

          </div>
        </div>
      </div>
    </SectionCard>
  );
}
