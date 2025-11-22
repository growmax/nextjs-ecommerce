"use client";

import { FormField } from "@/components/forms/FormField/FormField";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { PhoneInput } from "@/components/forms/PhoneInput/PhoneInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { ReactNode } from "react";

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
  headerActions?: ReactNode;
}

export function ProfileCard({
  profile,
  onChange,
  onImageChange,
  onVerifyPhone,
  phoneVerified = false,
  isLoading = false,
  dataLoading = false,
  headerActions,
}: ProfileCardProps) {
  if (dataLoading || !profile) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Skeleton */}
          <div className="flex justify-center sm:justify-start">
            <Skeleton className="w-20 h-20 sm:w-28 sm:h-28 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        {headerActions ? (
          <div className="flex items-center gap-2">{headerActions}</div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Image */}
        <ImageUpload
          currentImage={profile.avatar || null}
          onImageChange={onImageChange}
          alt="Profile"
          size="md"
          shape="square"
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <FormField label="Email" hint="Email cannot be changed">
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
            onChange={(value: string) => onChange("phone", value)}
            {...(onVerifyPhone && { onVerify: onVerifyPhone })}
            verified={phoneVerified}
            required
            disabled={isLoading}
          />

          {/* Alt Phone */}
          <PhoneInput
            label="Secondary Phone"
            value={profile.altPhone || ""}
            onChange={(value: string) => onChange("altPhone", value)}
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
      </CardContent>
    </Card>
  );
}
