"use client";

import SectionCard from "@/components/custom/SectionCard";
import { FormField } from "@/components/forms/FormField/FormField";
import { ImageUpload } from "@/components/forms/ImageUpload/ImageUpload";
import { PhoneInput } from "@/components/forms/PhoneInput/PhoneInput";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React from "react";
import { toast } from "sonner";

interface Profile {
  name: string;
  email: string;
  phone: string;
  altPhone?: string;
  altEmail: string;
  avatar?: string | null;
  picture?: string | null;
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
  folderName?: string | undefined; // S3 folder path for image uploads
  validationErrors?: {
    name?: string;
    phone?: string;
    altEmail?: string;
    altPhone?: string;
  };
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
  folderName,
  validationErrors = {},
}: ProfileCardProps) {
  const t = useTranslations("profileSettings");
  if (dataLoading || !profile) {
    return (
      <SectionCard
        title={t("profile") + " Information"}
        className="w-full py-2.5"
        headerActions={headerActions}
        headerContainerClassName="flex-row justify-between items-center"
      >
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 lg:gap-8 items-start">
            <div className="flex flex-col items-center md:items-start justify-start md:col-span-3 w-full mb-6 sm:mb-8 md:mb-0">
              <Skeleton className="w-full max-w-[140px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px] aspect-square rounded-xl mx-auto md:mx-0" />
            </div>

            <div className="col-span-1 md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7 w-full">
              <div className="w-full space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="w-full space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="w-full space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="w-full space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="w-full space-y-1.5 sm:col-span-2">
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
      title={t("profile") + " Information"}
      className="w-full py-2.5"
      headerActions={headerActions}
      headerContainerClassName="flex-row justify-between items-center"
    >
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 lg:gap-8 items-start">
          {/* Profile Image */}
          <div className="flex flex-col items-center justify-center md:col-span-3 w-full mb-6 sm:mb-8 md:mb-0">
            <div className="w-full max-w-[140px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px] mx-auto">
              <ImageUpload
                currentImage={profile.picture || profile.avatar || profileImage || null}
                onImageChange={onImageChange}
                onUploadSuccess={() => {
                  toast.success(t("imageUploadedSuccessfully"), {
                    description: t("profile") + " updated.",
                    duration: 3000,
                  });
                }}
                alt={t("profile")}
                size="lg"
                shape="square"
                disabled={isLoading}
                folderName={folderName}
                className="w-full"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="col-span-1 md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7 w-full">

            {/* Name */}
            <div className="w-full min-w-0">
              <FormField 
                label={t("name")} 
                required 
                {...(validationErrors.name && { error: validationErrors.name })}
              >
                <Input
                  type="text"
                  value={profile.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder={t("enterFullName")}
                  disabled={isLoading}
                  className={cn(
                    "h-9 w-full",
                    validationErrors.name && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </FormField>
            </div>

            {/* Email */}
            <div className="w-full min-w-0">
              <FormField label={t("email")}>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted h-9 w-full"
                />
              </FormField>
            </div>

            {/* Phone */}
            <div className="w-full min-w-0">
              <PhoneInput
                label={t("mobileNumber")}
                value={profile.phone}
                onChange={(value) => onChange("phone", value)}
                {...(onVerifyPhone && { onVerify: onVerifyPhone })}
                {...(countryCode ? { countryCode } : {})}
                {...(originalPhone ? { originalValue: originalPhone } : {})}
                verified={phoneVerified}
                required
                disabled={isLoading}
                {...(validationErrors.phone && { error: validationErrors.phone })}
              />
            </div>

            {/* Secondary Phone */}
            <div className="w-full min-w-0">
              <PhoneInput
                label={t("secondaryPhone")}
                value={profile.altPhone || ""}
                onChange={(value) => onChange("altPhone", value)}
                // {...(onVerifyPhone && { onVerify: onVerifyPhone })}
                {...(countryCode ? { countryCode } : {})}
                {...(originalAltPhone ? { originalValue: originalAltPhone } : {})}
                disabled={isLoading}
                {...(validationErrors.altPhone && { error: validationErrors.altPhone })}
              />
            </div>

            {/* Alternate Email */}
            <div className="w-full min-w-0 mt-0 mb-6">
              <FormField 
                label={t("alternateEmail")}
                {...(validationErrors.altEmail && { error: validationErrors.altEmail })}
              >
                <Input
                  type="email"
                  value={profile.altEmail}
                  onChange={(e) => onChange("altEmail", e.target.value)}
                  placeholder={t("enterAlternateEmail")}
                  disabled={isLoading}
                  className={cn(
                    "h-9 w-full",
                    validationErrors.altEmail && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
              </FormField>
            </div>

          </div>
        </div>
      </div>
    </SectionCard>
  );
}
