"use client";

import { useState } from "react";
import SectionCard from "@/app/Components/SectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const [username] = useState("John Doe"); // Replace with actual user data
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <SectionCard title={`Welcome ${username}`}>
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
            <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">
                    Upload Image
                  </span>
                </div>
              )}
            </div>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Form Fields - Mobile-first stacked, then responsive */}
        <div className="flex-1 space-y-4">
          {/* First Line - Company Name & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Enter company name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website Link</Label>
              <Input
                id="website"
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>

          {/* Second Line - Tax ID/GST & Business Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax ID/GST</Label>
              <Input id="tax-id" placeholder="Enter tax ID or GST number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-type">Business Type</Label>
              <Input
                id="business-type"
                value="End User"
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
                value="Buyer"
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-currency">Default Currency</Label>
              <Input
                id="default-currency"
                value="INR"
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Fourth Line - Sub Industry & Industry Description */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sub-industry">Sub Industry</Label>
              <Input id="sub-industry" placeholder="Aerospace & Defence" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Industry Description: Aerospace & Defence
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                Manufacturers of civil or military aerospace & defence
                equipment, parts or products including electronics and space
                equipments
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
