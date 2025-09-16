"use client";

import { useState } from "react";
import SectionCard from "@/components/SectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { ProfileData } from "../../../../../dummyData";

export default function ProfilePage() {
  const data = ProfileData.data;
  const [profileImage] = useState<string | null>(data.logo || null);

  return (
    <div className="space-y-6">
      <SectionCard title={`Welcome User`}>
        {/* Mobile-first responsive grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Image Upload - Top on mobile, left on desktop */}
          <div className="flex-shrink-0">
            <Label
              htmlFor="profile-image"
              className="block text-sm font-medium mb-2"
            >
              Profile Image
            </Label>
            <div className="relative">
              <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                {profileImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profileImage}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover rounded-lg"
                      onError={e => {
                        e.currentTarget.style.display = "none";
                        const sibling = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (sibling) {
                          sibling.style.setProperty("display", "flex");
                        }
                      }}
                    />
                  </>
                ) : null}
                <div
                  className="text-center"
                  style={{
                    display: profileImage ? "none" : "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">
                    {profileImage ? "Image Error" : "Upload Image"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields - Mobile-first stacked, then responsive */}
          <div className="flex-1 space-y-4">
            {/* First Line - Company Name & Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={data.name}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website Link</Label>
                <Input
                  id="website"
                  value={data.website || ""}
                  type="url"
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Second Line - Tax ID/GST & Business Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax-id">Tax ID/GST</Label>
                <Input
                  id="tax-id"
                  value={data.addressId.gst}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Input
                  id="business-type"
                  value={data.businessTypeId.name}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Third Line - Account Type & Default Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account-type">Account Type</Label>
                <Input
                  id="account-type"
                  value={data.accountTypeId.name}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-currency">Default Currency</Label>
                <Input
                  id="default-currency"
                  value={data.currencyId.currencyCode}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Fourth Line - Sub Industry & Industry Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sub-industry">Sub Industry</Label>
                <Input
                  id="sub-industry"
                  value={data.subIndustryId.industryId.name}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Industry Description: {data.subIndustryId.industryId.name}
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  {data.subIndustryId.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* User Preferences Card */}
      <SectionCard title="User Preferences">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preference-1">Preference 1</Label>
              <Input
                id="preference-1"
                placeholder="Enter preference"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preference-2">Preference 2</Label>
              <Input
                id="preference-2"
                placeholder="Enter preference"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preference-3">Preference 3</Label>
              <Input
                id="preference-3"
                placeholder="Enter preference"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
