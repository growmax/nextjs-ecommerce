"use client";

import HeaderBar from "@/app/Components/reusable/nameconversion/PageHeader";
import SectionCard from "@/components/custom/SectionCard";
import { FullWidthLayout } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SaveCancelToolbar } from "@/components/custom/save-cancel-toolbar";
import { toast } from "sonner";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
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

interface SubIndustryItem {
  id: number;
  name: string;
  description: string;
  industryId: {
    name: string;
  };
}

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
      id?: number;
      description: string;
      industryId: {
        name: string;
      };
    };
  };
}

export default function CompanyPage() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [subIndustryOptions, setSubIndustryOptions] = useState<
    Array<{
      value: string;
      label: string;
      industryName?: string;
      description?: string;
      fullData?: unknown;
    }>
  >([]);
  const [selectedSubIndustry, setSelectedSubIndustry] =
    useState<SubIndustryItem | null>(null);

  // Group sub-industries by parent industry
  const groupedOptions = useMemo(() => {
    // console.log('Creating grouped options...');
    // console.log('subIndustryOptions length:', subIndustryOptions.length);

    if (subIndustryOptions.length === 0) {
      return {};
    }

    const groups: Record<string, typeof subIndustryOptions> = {};
    subIndustryOptions.forEach(option => {
      const industryName = option.industryName || "Other";
      if (!groups[industryName]) {
        groups[industryName] = [];
      }
      groups[industryName].push(option);
    });

    return groups;
  }, [subIndustryOptions]);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
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

  const [isSaving, setIsSaving] = useState(false);

  // Fetch sub-industries from API
  const fetchSubIndustries = async (currentCompanyData?: CompanyData) => {
    try {
      const accessToken = AuthStorage.getAccessToken();
      const jwtService = JWTService.getInstance();
      const payload = jwtService.decodeToken(accessToken!);

      if (!accessToken || !payload) {
        // console.error("No valid token for fetching sub-industries");
        return;
      }

      const response = await fetch("/api/subindustries", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-tenant": payload.iss,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('Fetched sub-industries:', data);

        // Format the data for select options with full information
        if (Array.isArray(data)) {
          const options = data.map((item: SubIndustryItem) => ({
            value: item.id?.toString() || "",
            label: item.name || "",
            industryName: item.industryId?.name || "",
            description: item.description || "",
            fullData: item,
          }));
          setSubIndustryOptions(options);

          // Set initial selected sub-industry if matches current company
          const currentId = currentCompanyData?.data?.subIndustryId?.id;
          if (currentId) {
            const current = options.find(
              (opt: {
                value: string;
                label: string;
                industryName?: string;
                description?: string;
                fullData?: unknown;
              }) => opt.value === currentId.toString()
            );
            if (current) {
              setSelectedSubIndustry(current.fullData as SubIndustryItem);
            }
          }
        } else if (data.data && Array.isArray(data.data)) {
          const options = data.data.map((item: SubIndustryItem) => ({
            value: item.id?.toString() || "",
            label: item.name || "",
            industryName: item.industryId?.name || "",
            description: item.description || "",
            fullData: item,
          }));
          setSubIndustryOptions(options);

          // Set initial selected sub-industry
          const currentId = currentCompanyData?.data?.subIndustryId?.id;
          if (currentId) {
            const current = options.find(
              (opt: {
                value: string;
                label: string;
                industryName?: string;
                description?: string;
                fullData?: unknown;
              }) => opt.value === currentId.toString()
            );
            if (current) {
              setSelectedSubIndustry(current.fullData as SubIndustryItem);
            }
          }
        }
      } else {
        // console.error('Failed to fetch sub-industries:', response.status);
      }
    } catch {
      // console.error('Error fetching sub-industries:', err);
      // Set default options as fallback
      setSubIndustryOptions([
        { value: "software-development", label: "Software Development" },
        { value: "e-commerce", label: "E-commerce Platform" },
      ]);
    }
  };

  // Handle sub-industry selection change for dynamic description
  const handleSubIndustryChange = (value: string) => {
    const selected = subIndustryOptions.find(opt => opt.value === value);
    if (selected && selected.fullData) {
      setSelectedSubIndustry(selected.fullData as SubIndustryItem);
    }
  };

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

        // Fetch sub-industries after company data
        await fetchSubIndustries(data);

        // Initialize form with API response data
        reset({
          name: data.data.name || "",
          website: data.data.website || "",
          gst: data.data.addressId.gst || "",
          subIndustry:
            data.data.subIndustryId?.id?.toString() || "software-development",
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
        <FullWidthLayout>
          <div className="max-w-6xl mx-auto space-y-6 p-6">
            <SectionCard title="Loading Company Data">
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading company data...</span>
              </div>
            </SectionCard>
          </div>
        </FullWidthLayout>
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
        <FullWidthLayout>
          <div className="max-w-6xl mx-auto space-y-6 p-6">
            <SectionCard title="Error">
              <div className="text-center text-red-600 p-8">
                <p>Error: {error}</p>
              </div>
            </SectionCard>
          </div>
        </FullWidthLayout>
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
        <FullWidthLayout>
          <div className="max-w-6xl mx-auto space-y-6 p-6">
            <SectionCard title="No Data">
              <div className="text-center text-gray-600 p-8">
                <p>No company data available</p>
              </div>
            </SectionCard>
          </div>
        </FullWidthLayout>
      </>
    );
  }

  const data = companyData.data;

  // Image upload handler
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Create preview URL immediately
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Get authentication data
      const accessToken = AuthStorage.getAccessToken();
      const jwtService = JWTService.getInstance();
      const payload = jwtService.decodeToken(accessToken!);

      if (!payload || !payload.companyId || !payload.iss) {
        throw new Error("Invalid authentication token");
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("companyId", payload.companyId.toString());

      // Upload to API (you'll need to create this endpoint)
      const response = await fetch("/api/company/upload-logo", {
        method: "POST",
        headers: {
          "x-tenant": payload.iss,
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();

      // Update with actual uploaded URL
      setProfileImage(result.logoUrl);
      setUploadProgress(100);

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setProfileImage(null);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Form submit handler
  const onSubmit = async (formData: CompanyFormData) => {
    try {
      setIsSaving(true);

      // Log the updated form data
      // eslint-disable-next-line no-console
      console.log("=== UPDATED FORM DATA ===");
      // eslint-disable-next-line no-console
      console.log("Name:", formData.name);
      // eslint-disable-next-line no-console
      console.log("Website:", formData.website);
      // eslint-disable-next-line no-console
      console.log("GST:", formData.gst);
      // eslint-disable-next-line no-console
      console.log("Sub Industry ID:", formData.subIndustry);
      // eslint-disable-next-line no-console
      console.log("Full Data:", JSON.stringify(formData, null, 2));
      // eslint-disable-next-line no-console
      console.log("=========================");

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // After successful save, update the form's default values
      reset(formData);

      toast.success("Company settings saved successfully!");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error saving form:", err);
      toast.error("Failed to save company settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel - reset to original values
  const handleCancel = () => {
    reset();
    toast.info("Changes cancelled");
  };

  return (
    <>
      <HeaderBar title="Company Settings" icon={<User className="w-2 h-2" />} />

      {/* SaveCancelToolbar - Positioned at top below header */}
      <SaveCancelToolbar
        show={isDirty}
        onSave={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isLoading={isSaving}
        saveText="Save Changes"
        cancelText="Cancel"
        className="!top-[64px] !left-0 !fixed"
      />
      <FullWidthLayout>
        {/* Flexible Layout with Natural Heights */}
        <div className="min-h-screen bg-background">
          <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 min-h-screen">
            {/* Main Company Form Card - Flexible Sizing */}
            <SectionCard
              title={`Welcome ${data.name}`}
              className="
                w-full max-w-7xl mx-auto
                min-h-[600px] max-h-none
                overflow-hidden flex flex-col
              "
              contentClassName="pt-2"
            >
              <div className="flex-1 overflow-y-auto">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex-1 flex flex-col"
                >
                  {/* Flexible Layout Grid */}
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
                    {/* Company Logo Upload - Flexible positioning */}
                    <div className="flex-shrink-0 self-center lg:self-start">
                      <Label
                        htmlFor="profile-image"
                        className="block text-sm font-medium mb-2"
                      >
                        Company Logo
                      </Label>
                      <div className="relative">
                        <input
                          type="file"
                          id="profile-image"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={isUploading}
                        />
                        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-36 xl:h-36 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center relative overflow-hidden bg-muted/5 hover:bg-muted/10 transition-colors">
                          {profileImage ? (
                            <div className="relative w-full h-full">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={profileImage}
                                alt="Company Logo"
                                className="w-full h-full object-contain rounded-lg"
                                onError={() => setProfileImage(null)}
                              />
                              {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                  <div className="text-white text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-1" />
                                    <div className="text-xs">
                                      {uploadProgress}%
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <User className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                              <span className="text-xs text-muted-foreground font-medium">
                                {isUploading
                                  ? "Uploading..."
                                  : "Click to Upload"}
                              </span>
                              <span className="text-xs text-muted-foreground/70 block mt-1">
                                PNG, JPG up to 5MB
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Upload Progress Bar */}
                        {isUploading && uploadProgress > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Upload Error */}
                        {uploadError && (
                          <div className="mt-2 text-xs text-red-600 text-center">
                            {uploadError}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form Fields - Flexible Grid */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 space-y-4 sm:space-y-6">
                        {/* First Line - Company Name & Website */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label
                              htmlFor="company-name"
                              className="text-sm font-medium"
                            >
                              Company Name
                            </Label>
                            <Input
                              id="company-name"
                              {...register("name")}
                              placeholder={data.name}
                              className="border border-gray-300 focus:border-blue-500 h-9 sm:h-10"
                            />
                            {errors.name && (
                              <p className="text-xs sm:text-sm text-red-600">
                                {errors.name.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label
                              htmlFor="website"
                              className="text-sm font-medium"
                            >
                              Website Link
                            </Label>
                            <Input
                              id="website"
                              {...register("website")}
                              type="url"
                              placeholder={
                                data.website || "No website available"
                              }
                              className="border border-gray-300 focus:border-blue-500 h-9 sm:h-10"
                            />
                            {errors.website && (
                              <p className="text-xs sm:text-sm text-red-600">
                                {errors.website.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Second Line - Tax ID/GST & Business Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label
                              htmlFor="tax-id"
                              className="text-sm font-medium"
                            >
                              Tax ID/GST
                            </Label>
                            <Input
                              id="tax-id"
                              {...register("gst")}
                              placeholder={data.addressId.gst}
                              className="border border-gray-300 focus:border-blue-500 h-9 sm:h-10"
                            />
                            {errors.gst && (
                              <p className="text-xs sm:text-sm text-red-600">
                                {errors.gst.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label
                              htmlFor="business-type"
                              className="text-sm font-medium"
                            >
                              Business Type
                            </Label>
                            <Input
                              id="business-type"
                              value={data.businessTypeId.name}
                              readOnly
                              className="bg-muted border border-gray-300 h-9 sm:h-10"
                            />
                          </div>
                        </div>

                        {/* Third Line - Account Type & Default Currency */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label
                              htmlFor="account-type"
                              className="text-sm font-medium"
                            >
                              Account Type
                            </Label>
                            <Input
                              id="account-type"
                              value={data.accountTypeId.name}
                              readOnly
                              className="bg-muted border border-gray-300 h-9 sm:h-10"
                            />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label
                              htmlFor="default-currency"
                              className="text-sm font-medium"
                            >
                              Default Currency
                            </Label>
                            <Input
                              id="default-currency"
                              value={data.currencyId.currencyCode}
                              readOnly
                              className="bg-muted border border-gray-300 h-9 sm:h-10"
                            />
                          </div>
                        </div>

                        {/* Fourth Line - Sub Industry & Industry Description */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label
                              htmlFor="sub-industry"
                              className="text-sm font-medium"
                            >
                              Sub Industry
                            </Label>
                            {subIndustryOptions.length > 0 ? (
                              <Controller
                                name="subIndustry"
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    value={field.value}
                                    onValueChange={value => {
                                      field.onChange(value);
                                      handleSubIndustryChange(value);
                                    }}
                                  >
                                    <SelectTrigger className="border border-gray-300 focus:border-blue-500 h-9 sm:h-10">
                                      <SelectValue placeholder="Select sub industry" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-48 sm:max-h-60">
                                      {Object.keys(groupedOptions).length > 0
                                        ? Object.entries(groupedOptions).map(
                                            (
                                              [industryName, items],
                                              groupIndex
                                            ) => (
                                              <SelectGroup key={industryName}>
                                                {/* Non-clickable Industry Header using SelectLabel */}
                                                <SelectLabel className="text-xs font-semibold text-muted-foreground">
                                                  {industryName.toUpperCase()}
                                                </SelectLabel>

                                                {/* Clickable Sub-industry Items */}
                                                {items.map(option => (
                                                  <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                    className="pl-6"
                                                  >
                                                    {option.label}
                                                  </SelectItem>
                                                ))}

                                                {/* Add separator between groups (except last) */}
                                                {groupIndex <
                                                  Object.keys(groupedOptions)
                                                    .length -
                                                    1 && <SelectSeparator />}
                                              </SelectGroup>
                                            )
                                          )
                                        : /* Fallback: Show ungrouped options if grouping fails */
                                          subIndustryOptions.map(option => (
                                            <SelectItem
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            ) : (
                              <Input
                                id="sub-industry"
                                {...register("subIndustry")}
                                placeholder="Loading sub-industries..."
                                disabled
                                className="border border-gray-300 h-9 sm:h-10"
                              />
                            )}
                            {errors.subIndustry && (
                              <p className="text-xs sm:text-sm text-red-600">
                                {errors.subIndustry.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="text-sm font-bold text-foreground">
                              {selectedSubIndustry
                                ? selectedSubIndustry.industryId.name
                                : data.subIndustryId.industryId.name}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {selectedSubIndustry
                                ? selectedSubIndustry.description
                                : data.subIndustryId.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </SectionCard>

            {/* Address Information Card - Flexible Sizing */}
            <SectionCard
              title="Address Information"
              className="
                w-full max-w-7xl mx-auto
                 min-h-[400px] max-h-none
                overflow-hidden flex flex-col
              "
              contentClassName="pt-2"
              headerActions={
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Search..."
                    className="flex-1 sm:flex-none sm:w-32 md:w-40 text-sm h-8 sm:h-9"
                  />
                  <Button
                    size="sm"
                    className="h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1 flex-shrink-0 text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>
              }
            >
              <div className="flex-1 overflow-hidden">
                {/* Mobile: Card view with flexible height */}
                <div className="block md:hidden flex-1 overflow-y-auto">
                  <div className="space-y-3 p-2">
                    {[
                      {
                        id: 1,
                        address: [
                          "123 Business Street",
                          "Suite 100",
                          "New York, NY 10001",
                        ],
                        taxId: "TAX123456789",
                        contact: "John Doe",
                        phone: "+1 (555) 123-4567",
                      },
                      {
                        id: 2,
                        address: [
                          "456 Corporate Avenue",
                          "Building B, Floor 3",
                          "Los Angeles, CA 90210",
                        ],
                        taxId: "TAX987654321",
                        contact: "Jane Smith",
                        phone: "+1 (555) 987-6543",
                      },
                      {
                        id: 3,
                        address: [
                          "789 Industrial Park",
                          "Warehouse District",
                          "Chicago, IL 60601",
                        ],
                        taxId: "TAX456789123",
                        contact: "Michael Johnson",
                        phone: "+1 (555) 456-7890",
                      },
                      {
                        id: 4,
                        address: [
                          "321 Tech Boulevard",
                          "Innovation Center",
                          "San Francisco, CA 94105",
                        ],
                        taxId: "TAX654321789",
                        contact: "Sarah Williams",
                        phone: "+1 (555) 321-9876",
                      },
                    ].map(item => (
                      <Card key={item.id} className="p-3 sm:p-4 flex-shrink-0">
                        <div className="space-y-3">
                          <div className="space-y-0.5">
                            {item.address.map((line, idx) => (
                              <div
                                key={`${item.id}-address-${idx}`}
                                className={
                                  idx === 0
                                    ? "font-semibold text-xs sm:text-sm"
                                    : "text-xs sm:text-sm text-muted-foreground"
                                }
                              >
                                {line}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div className="space-y-0.5">
                              <span className="text-xs font-medium text-muted-foreground">
                                Tax ID
                              </span>
                              <div className="font-medium text-xs sm:text-sm">
                                {item.taxId}
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-xs font-medium text-muted-foreground">
                                Contact
                              </span>
                              <div className="font-medium text-xs sm:text-sm">
                                {item.contact}
                              </div>
                            </div>
                            <div className="col-span-2 space-y-0.5">
                              <span className="text-xs font-medium text-muted-foreground">
                                Phone
                              </span>
                              <div className="font-medium text-xs sm:text-sm">
                                {item.phone}
                              </div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Desktop: Table view with flexible height */}
                <div className="hidden md:block flex-1 overflow-auto">
                  <Table>
                    <TableHeader className="bg-accent sticky top-0">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs sm:text-sm">
                          Action
                        </TableHead>
                        <TableHead className="min-w-[200px] text-xs sm:text-sm">
                          Address
                        </TableHead>
                        <TableHead className="min-w-[120px] text-xs sm:text-sm">
                          Tax ID
                        </TableHead>
                        <TableHead className="min-w-[120px] text-xs sm:text-sm">
                          Contact Person
                        </TableHead>
                        <TableHead className="min-w-[120px] text-xs sm:text-sm">
                          Phone
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              // Handle delete action for first address
                              // console.log("Delete address entry 1");
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="space-y-0.5">
                            <div className="text-xs sm:text-sm">
                              123 Business Street
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Suite 100
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              New York, NY 10001
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          TAX123456789
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          John Doe
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          +1 (555) 123-4567
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              // Handle delete action
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="space-y-0.5">
                            <div className="text-xs sm:text-sm">
                              456 Corporate Avenue
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Building B, Floor 3
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Los Angeles, CA 90210
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          TAX987654321
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          Jane Smith
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          +1 (555) 987-6543
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              // Handle delete action
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="space-y-0.5">
                            <div className="text-xs sm:text-sm">
                              789 Industrial Park
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Warehouse District
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Chicago, IL 60601
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          TAX456789123
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          Michael Johnson
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          +1 (555) 456-7890
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-muted/50">
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              // Handle delete action
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="space-y-0.5">
                            <div className="text-xs sm:text-sm">
                              321 Tech Boulevard
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Innovation Center
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              San Francisco, CA 94105
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          TAX654321789
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          Sarah Williams
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          +1 (555) 321-9876
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </FullWidthLayout>
    </>
  );
}
