"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { ProfileData } from "../../../../../dummyData";
import HeaderBar from "@/app/Components/reusable/nameconversion/PageHeader";

export default function CompanyPage() {
  const data = ProfileData.data;

  return (
    <>
      {/* ✅ Fixed Header */}
      <HeaderBar
        title="Company Settings"
        icon={<Building2 className="w-5 h-5" />}
      />

      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Company Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Company Page (English)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Welcome to our company! Here you can add company information,
                team members, or any content you like.
              </p>

              {/* Form Fields - Mobile-first stacked, responsive */}
              <div className="flex-1 space-y-4">
                {/* Company Name & Website */}
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

                {/* Tax ID/GST & Business Type */}
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

                {/* Account Type & Default Currency */}
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

                {/* Sub Industry & Industry Description */}
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
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
