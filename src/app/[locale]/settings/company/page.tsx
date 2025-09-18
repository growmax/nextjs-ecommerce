"use client";

import HeaderBar from "@/app/Components/reusable/nameconversion/PageHeader";
import SectionCard from "@/components/custom/SectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

// Form validation schema
const companyFormSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  gst: z
    .string()
    .min(1, "GST number is required")
    .max(20, "GST number must be less than 20 characters"),
  subIndustry: z
    .string()
    .min(1, "Sub industry is required")
    .max(50, "Sub industry must be less than 50 characters"),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

interface CompanyData {
  data: {
    id: number;
    name: string;
    website?: string;
    logo?: string;
    addressId: {
      gst: string;
    };
    businessTypeId: {
      name: string;
    };
    accountTypeId: {
      name: string;
    };
    currencyId: {
      currencyCode: string;
    };
    subIndustryId: {
      description: string;
      industryId: {
        name: string;
      };
    };
  };
}

// Sample industry options - in a real app, this would come from an API
const industryOptions = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "construction", label: "Construction" },
  { value: "transportation", label: "Transportation" },
  { value: "food-beverage", label: "Food & Beverage" },
  { value: "entertainment", label: "Entertainment" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

export default function CompanyPage() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      website: "",
      gst: "",
      subIndustry: "",
    },
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated first
        if (!AuthStorage.isAuthenticated()) {
          setError("Authentication required. Please log in again.");
          return;
        }

        // Get token from storage
        const accessToken = AuthStorage.getAccessToken();
        if (!accessToken) {
          setError("No access token found");
          return;
        }

        // Check if token is expired using JWT service
        const jwtService = JWTService.getInstance();
        if (jwtService.isTokenExpired(accessToken)) {
          setError("Session expired. Please log in again.");
          // Clear expired token from storage
          AuthStorage.clearAuth();
          return;
        }

        // Decode JWT to get company ID and tenant
        const payload = jwtService.decodeToken(accessToken);
        if (!payload || !payload.companyId || !payload.iss) {
          setError("Invalid token or missing company data");
          return;
        }

        // Fetch company data from API
        const response = await fetch(`/api/company/${payload.companyId}`, {
          headers: {
            "x-tenant": payload.iss,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // Log error response
          // eslint-disable-next-line no-console
          console.error(
            "API Error Response:",
            response.status,
            response.statusText
          );

          // Handle token expiration specifically
          if (response.status === 401) {
            const errorData = await response.json().catch(() => null);
            if (errorData?.tokenExpired) {
              setError("Session expired. Please log in again.");
              AuthStorage.clearAuth();
              return;
            }
          }

          throw new Error(`Failed to fetch company data: ${response.status}`);
        }

        const data = await response.json();

        // Log successful API response
        // eslint-disable-next-line no-console
        console.log("=== API Response Success ===");
        // eslint-disable-next-line no-console
        console.log("Status:", response.status);
        // eslint-disable-next-line no-console
        console.log("Response Data:", JSON.stringify(data, null, 2));
        // eslint-disable-next-line no-console
        console.log("============================");

        setCompanyData(data);
        setProfileImage(data.data.logo || null);

        // Initialize form with API response data
        // Try to match the industry name with our predefined options
        const currentIndustryName =
          data.data.subIndustryId.industryId.name?.toLowerCase();
        const matchingOption = industryOptions.find(
          option =>
            currentIndustryName?.includes(option.value.toLowerCase()) ||
            option.label.toLowerCase().includes(currentIndustryName)
        );

        reset({
          name: data.data.name || "",
          website: data.data.website || "",
          gst: data.data.addressId.gst || "",
          subIndustry: matchingOption?.value || "other",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch company data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [reset]);

  if (loading) {
    return (
      <>
        <HeaderBar
          title="Company Settings"
          icon={<User className="w-6 h-6" />}
        />
        <div className="space-y-6 p-6">
          <SectionCard title="Loading Company Data">
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading company data...</span>
            </div>
          </SectionCard>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderBar
          title="Company Settings"
          icon={<User className="w-6 h-6" />}
        />
        <div className="space-y-6 p-6">
          <SectionCard title="Error">
            <div className="text-center text-red-600 p-8">
              <p>Error: {error}</p>
            </div>
          </SectionCard>
        </div>
      </>
    );
  }

  if (!companyData) {
    return (
      <>
        <HeaderBar
          title="Company Settings"
          icon={<User className="w-6 h-6" />}
        />
        <div className="space-y-6 p-6">
          <SectionCard title="No Data">
            <div className="text-center text-gray-600 p-8">
              <p>No company data available</p>
            </div>
          </SectionCard>
        </div>
      </>
    );
  }

  const data = companyData.data;

  // Form submit handler
  const onSubmit = async (formData: CompanyFormData) => {
    try {
      // Here you would typically send the data to your API
      // eslint-disable-next-line no-console
      console.log("Form submitted:", formData);
      // Add API call to save the form data
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error saving form:", err);
    }
  };

  return (
    <>
      <HeaderBar title="Company Settings" icon={<User className="w-6 h-6" />} />
      <div className="space-y-6 p-6">
        <SectionCard title={`Welcome ${data.name}`}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Mobile-first responsive grid */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Image Upload - Top on mobile, left on desktop */}
              <div className="flex-shrink-0">
                <Label
                  htmlFor="profile-image"
                  className="block text-sm font-medium mb-2"
                >
                  Company Logo
                </Label>
                <div className="relative">
                  <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                    {profileImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={profileImage}
                          alt="Company Logo"
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
                        {profileImage ? "Image Error" : "No Logo"}
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
                      {...register("name")}
                      placeholder={data.name}
                      className="border border-gray-300 focus:border-blue-500"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website Link</Label>
                    <Input
                      id="website"
                      {...register("website")}
                      type="url"
                      placeholder={data.website || "No website available"}
                      className="border border-gray-300 focus:border-blue-500"
                    />
                    {errors.website && (
                      <p className="text-sm text-red-600">
                        {errors.website.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Second Line - Tax ID/GST & Business Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-id">Tax ID/GST</Label>
                    <Input
                      id="tax-id"
                      {...register("gst")}
                      placeholder={data.addressId.gst}
                      className="border border-gray-300 focus:border-blue-500"
                    />
                    {errors.gst && (
                      <p className="text-sm text-red-600">
                        {errors.gst.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-type">Business Type</Label>
                    <Input
                      id="business-type"
                      value={data.businessTypeId.name}
                      readOnly
                      className="bg-muted border border-gray-300"
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
                      className="bg-muted border border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Input
                      id="default-currency"
                      value={data.currencyId.currencyCode}
                      readOnly
                      className="bg-muted border border-gray-300"
                    />
                  </div>
                </div>

                {/* Fourth Line - Sub Industry & Industry Description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub-industry">Sub Industry</Label>
                    <Controller
                      name="subIndustry"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full h-10 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-background">
                            <SelectValue
                              placeholder="Select an industry"
                              className="text-sm"
                            />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="w-full min-w-[var(--radix-select-trigger-width)] max-h-60 overflow-auto bg-white border border-gray-200 shadow-lg rounded-md"
                            sideOffset={4}
                          >
                            <SelectItem
                              value="current"
                              className="text-muted-foreground italic"
                              disabled
                            >
                              Current: {data.subIndustryId.industryId.name}
                            </SelectItem>
                            {industryOptions.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 px-3 py-2"
                              >
                                <span className="flex items-center">
                                  {option.label}
                                  {field.value === option.value && (
                                    <span className="ml-2 text-blue-600"></span>
                                  )}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.subIndustry && (
                      <p className="text-sm text-red-600">
                        {errors.subIndustry.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">
                      Industry Description: {data.subIndustryId.industryId.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      {data.subIndustryId.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </SectionCard>
      </div>
    </>
  );
}
