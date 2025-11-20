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
        className="w-full"
        headerActions={headerActions}
      >
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 lg:gap-6">
            <div className="flex flex-col items-center md:items-start justify-center p-4 md:p-4 lg:p-6 xl:p-8 mb-4 md:mb-0 w-full md:w-auto md:self-start">
              <Skeleton className="w-full max-w-[160px] md:max-w-[140px] lg:max-w-[160px] aspect-square rounded-xl mx-auto md:mx-0" />
            </div>

            <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Skeleton className="h-4 w-28" />
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
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 lg:gap-6">

          {/* Profile Image */}
          <div className="flex flex-col items-center md:items-start justify-center p-4 md:p-4 lg:p-6 xl:p-8 mb-4 md:mb-0 w-full md:w-auto md:self-start">
            <div className="w-full max-w-[160px] md:max-w-[140px] lg:max-w-[160px] mx-auto md:mx-0">
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

          {/* Form Fields - No vertical space */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0">

            {/* Name */}
            <div className="min-w-0">
              <FormField label="Name" required>
                <Input
                  type="text"
                  value={profile.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
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
                  className="bg-muted"
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
                />
              </FormField>
            </div>

          </div>
        </div>
      </div>
    </SectionCard>
  );
}
