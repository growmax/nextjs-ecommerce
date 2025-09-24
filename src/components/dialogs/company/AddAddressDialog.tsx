"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { Country, State, District } from "@/types/address";

// Enhanced validation with security, business logic, and format validation
const addressFormSchema = z
  .object({
    // Company Information
    companyName: z.string().optional(),

    // Core Address Fields - Required with business logic
    branch: z
      .string()
      .min(1, "Branch name is required")
      .min(2, "Branch name must be at least 2 characters")
      .max(100, "Branch name cannot exceed 100 characters")
      .regex(
        /^[a-zA-Z0-9\s\-&'.()]+$/,
        "Branch name contains invalid characters"
      )
      .transform(str => str.trim())
      .refine(str => str.length > 0, "Branch name cannot be only spaces"),

    address: z
      .string()
      .min(1, "Address is required")
      .min(5, "Address must be at least 5 characters")
      .max(200, "Address cannot exceed 200 characters")
      .regex(/^[a-zA-Z0-9\s\-,.#/()]+$/, "Address contains invalid characters")
      .transform(str => str.trim())
      .refine(str => str.length > 0, "Address cannot be only spaces"),

    locality: z
      .string()
      .optional()
      .refine(
        val => !val || (val.length >= 2 && val.length <= 50),
        "Locality must be 2-50 characters if provided"
      )
      .transform(str => str?.trim() || undefined),

    // Geographic Fields - Required with validation
    country: z
      .string()
      .min(1, "Country is required")
      .max(50, "Country name too long")
      .regex(/^[a-zA-Z\s\-'.()]+$/, "Country name contains invalid characters"),

    state: z
      .string()
      .min(1, "State/Province is required")
      .max(50, "State name too long")
      .regex(/^[a-zA-Z\s\-'.()]+$/, "State name contains invalid characters"),

    district: z
      .string()
      .optional()
      .refine(
        val => !val || (val.length >= 2 && val.length <= 50),
        "District must be 2-50 characters if provided"
      )
      .transform(str => str?.trim() || undefined),

    // Postal Code with format validation
    postalCode: z
      .string()
      .min(1, "Postal/Pin code is required")
      .min(3, "Postal code must be at least 3 characters")
      .max(10, "Postal code cannot exceed 10 characters")
      .regex(/^[a-zA-Z0-9\s\-]+$/, "Invalid postal code format"),

    city: z
      .string()
      .optional()
      .refine(
        val => !val || (val.length >= 2 && val.length <= 50),
        "City must be 2-50 characters if provided"
      )
      .transform(str => str?.trim() || undefined),

    // Coordinates with precise validation
    latitude: z
      .string()
      .optional()
      .refine(val => {
        if (!val || val.trim() === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
      }, "Latitude must be between -90 and 90 degrees"),

    longitude: z
      .string()
      .optional()
      .refine(val => {
        if (!val || val.trim() === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
      }, "Longitude must be between -180 and 180 degrees"),

    // Business Configuration
    isBilling: z.boolean().optional(),
    isShipping: z.boolean().optional(),

    // Business Compliance
    taxId: z
      .string()
      .optional()
      .refine(val => {
        if (!val || val.trim() === "") return true;
        // GST format for India: 2 digits state code + 10 digits PAN + 1 digit entity + 1 check digit + 1 default
        return (
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(
            val
          ) || val.length >= 8
        ); // Allow other tax ID formats
      }, "Invalid tax ID format")
      .transform(str => str?.trim().toUpperCase() || undefined),

    // Contact Information with international phone validation
    contactName: z
      .string()
      .optional()
      .refine(val => {
        if (!val || val.trim() === "") return true;
        return (
          val.length >= 2 && val.length <= 50 && /^[a-zA-Z\s\-'.]+$/.test(val)
        );
      }, "Contact name must be 2-50 characters with valid name characters")
      .transform(str => str?.trim() || undefined),

    contactNumber: z
      .string()
      .optional()
      .refine(val => {
        if (!val || val.trim() === "") return true;
        // International phone number format validation
        const cleaned = val.replace(/[\s\-\(\)]/g, "");
        return /^[0-9]{7,15}$/.test(cleaned);
      }, "Phone number must be 7-15 digits")
      .transform(str => str?.replace(/[\s\-\(\)]/g, "") || undefined),
  })
  .refine(data => data.isBilling || data.isShipping, {
    message: "Address must be marked as either billing or shipping (or both)",
    path: ["isBilling"],
  });

type AddressFormData = z.infer<typeof addressFormSchema>;

export interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: AddressFormData) => void;
  mode?: "add" | "edit";
  initialData?: Partial<AddressFormData>;
  addressId?: number | undefined; // Added for edit functionality
  branchId?: number | undefined; // Added for branch identification
}

export function AddAddressDialog({
  open,
  onOpenChange,
  onSuccess,
  mode = "add",
  initialData,
  addressId,
  branchId,
}: AddressDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [dataLoading, setDataLoading] = React.useState(true);

  // Store all data
  const [allData, setAllData] = React.useState({
    countries: [] as Country[],
    states: [] as State[],
    districts: [] as District[],
  });

  // Selected values
  const [selectedCountryId, setSelectedCountryId] = React.useState<string>("");
  const [selectedStateId, setSelectedStateId] = React.useState<string>("");

  // Load all data in parallel
  const loadAllData = React.useCallback(async () => {
    const cached = sessionStorage.getItem("address_data");
    if (cached) {
      setAllData(JSON.parse(cached));
      setDataLoading(false);
      return;
    }

    try {
      const accessToken = AuthStorage.getAccessToken();
      const jwtService = JWTService.getInstance();
      const payload = jwtService.decodeToken(accessToken!);
      if (!payload) throw new Error("Authentication required");

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "x-tenant": payload.iss,
        "Content-Type": "application/json",
      };

      const [countriesRes, statesRes, districtsRes] = await Promise.all([
        fetch("/api/countries", {
          headers,
          credentials: "include",
        }),
        fetch("/api/states", {
          headers,
          credentials: "include",
        }),
        fetch("/api/districts", {
          headers,
          credentials: "include",
        }),
      ]);

      if (!countriesRes.ok || !statesRes.ok || !districtsRes.ok) {
        throw new Error("API request failed");
      }

      const [countries, states, districts] = await Promise.all([
        countriesRes.json(),
        statesRes.json(),
        districtsRes.json(),
      ]);

      const data = {
        countries: countries.data || [],
        states: states.data || [],
        districts: districts.data || [],
      };

      setAllData(data);
      sessionStorage.setItem("address_data", JSON.stringify(data));
    } catch {
      toast.error("Failed to load location data");
    } finally {
      setDataLoading(false);
    }
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(addressFormSchema) as any,
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      companyName: initialData?.companyName || "",
      branch: initialData?.branch || "",
      address: initialData?.address || "",
      locality: initialData?.locality || "",
      country: initialData?.country || "",
      state: initialData?.state || "",
      district: initialData?.district || "",
      postalCode: initialData?.postalCode || "",
      city: initialData?.city || "",
      latitude: initialData?.latitude || "",
      longitude: initialData?.longitude || "",
      isBilling: initialData?.isBilling || false,
      isShipping: initialData?.isShipping || false,
      taxId: initialData?.taxId || "",
      contactName: initialData?.contactName || "",
      contactNumber: initialData?.contactNumber || "",
    },
  });

  // Load data when dialog opens
  React.useEffect(() => {
    if (open && allData.countries.length === 0) {
      loadAllData();
    }
  }, [open, allData.countries.length, loadAllData]);

  // Handle country selection
  const handleCountryChange = React.useCallback(
    (countryId: string) => {
      setSelectedCountryId(countryId);

      // Find country name and set form value
      const country = allData.countries.find(
        c => c.id.toString() === countryId
      );
      if (country) {
        setValue("country", country.name);
      }

      // Reset dependent fields
      setValue("state", "");
      setValue("district", "");
      setSelectedStateId("");
    },
    [setValue, allData.countries]
  );

  // Handle state selection
  const handleStateChange = React.useCallback(
    (stateId: string) => {
      setSelectedStateId(stateId);

      // Find state name and set form value
      const state = allData.states.find(s => s.id.toString() === stateId);
      if (state) {
        setValue("state", state.name);
      }

      // Reset dependent fields
      setValue("district", "");
    },
    [setValue, allData.states]
  );

  // Handle district selection
  const handleDistrictChange = React.useCallback(
    (districtValue: string) => {
      // District can be either ID or name depending on the option selected
      const district = allData.districts.find(
        d => d.id.toString() === districtValue || d.name === districtValue
      );
      if (district) {
        setValue("district", district.name); // Store name for consistency with API expectations
      } else {
        setValue("district", districtValue); // Fallback for manual entry
      }
    },
    [setValue, allData.districts]
  );

  // Memoized options with instant filtering
  const countryOptions = React.useMemo(
    () =>
      allData.countries.map(c => ({
        value: c.id.toString(),
        label: c.name,
      })),
    [allData.countries]
  );

  const stateOptions = React.useMemo(() => {
    if (!selectedCountryId) return [];
    return allData.states
      .filter(s => s.countryId === parseInt(selectedCountryId))
      .map(s => ({ value: s.id.toString(), label: s.name }));
  }, [allData.states, selectedCountryId]);

  const districtOptions = React.useMemo(() => {
    if (!selectedStateId) return [];
    return allData.districts
      .filter(d => d.stateId === parseInt(selectedStateId))
      .map(d => ({ value: d.id.toString(), label: d.name }));
  }, [allData.districts, selectedStateId]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset(initialData || {});

      setTimeout(() => {
        document.getElementById("branch")?.focus();
      }, 100);
    }
  }, [open, initialData, reset]);

  // Initialize dropdowns when data is loaded
  React.useEffect(() => {
    if (
      open &&
      initialData &&
      allData.countries.length > 0 &&
      allData.states.length > 0
    ) {
      // 🔧 Initialize selected country ID from initial data
      if (initialData.country) {
        const country = allData.countries.find(
          c => c.name === initialData.country
        );
        if (country) {
          setSelectedCountryId(country.id.toString());
          // Set form value to ensure consistency
          setValue("country", country.name);
        }
      }

      // 🔧 Initialize selected state ID from initial data
      if (initialData.state) {
        const state = allData.states.find(s => s.name === initialData.state);
        if (state) {
          setSelectedStateId(state.id.toString());
          // Set form value to ensure consistency
          setValue("state", state.name);
        }
      }

      // 🔧 Initialize district value with proper ID resolution
      if (initialData.district && allData.districts.length > 0) {
        // Try to find district by name first (for edit mode)
        const district = allData.districts.find(
          d => d.name === initialData.district
        );
        if (district) {
          setValue("district", district.name); // Set name for form consistency
        } else {
          // Fallback: set the initial value as-is
          setValue("district", initialData.district);
        }
      }
    }
  }, [
    open,
    initialData,
    allData.countries,
    allData.states,
    allData.districts,
    setValue,
  ]);

  // Get country info for phone field
  const selectedCountryInfo = React.useMemo(() => {
    const defaultInfo = {
      callingCode: "+1 ",
      iso2: "us",
      flag: "https://flagcdn.com/16x12/us.png",
    };
    if (!selectedCountryId) return defaultInfo;

    const country = allData.countries.find(
      c => c.id.toString() === selectedCountryId
    );
    if (!country?.callingCodes) return defaultInfo;

    const callingCode = Array.isArray(country.callingCodes)
      ? country.callingCodes[0]
      : country.callingCodes.toString();
    const iso2 = country.iso2?.toLowerCase() || "us";

    if (!callingCode) return defaultInfo;

    return {
      callingCode: `${callingCode.startsWith("+") ? callingCode : `+${callingCode}`} `,
      iso2,
      flag: `https://flagcdn.com/16x12/${iso2}.png`,
    };
  }, [selectedCountryId, allData.countries]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      setIsLoading(true);

      // Check for authentication and prepare API payload
      const accessToken = AuthStorage.getAccessToken();
      const jwtService = JWTService.getInstance();
      const payload = jwtService.decodeToken(accessToken!);

      if (!payload || !payload.companyId || !payload.userId) {
        throw new Error("Authentication required");
      }

      if (mode === "edit") {
        // For edit mode, use the PUT endpoint with simplified payload
        if (!addressId) {
          toast.error(
            "Cannot update: Address ID is missing. Please try again."
          );
          return;
        }

        // Build the address data object
        const addressData = {
          id: addressId, // Address ID for existing record identification (Fix #2)
          gst: data.taxId || "",
          branchName: data.branch,
          addressLine: data.address,
          locality: data.locality || "",
          city: data.city || "",
          district: data.district || "", // District ID (already numeric from form)
          lattitude: data.latitude || "", // Note: API uses 'lattitude' (misspelled)
          longitude: data.longitude || "",
          pinCodeId: data.postalCode,
          state: selectedStateId || "", // State ID (Fix #4)
          country: selectedCountryId || "", // Country ID (Fix #4)
          isShipping: data.isShipping || false,
          isBilling: data.isBilling || false,
          wareHouse: false,
          primaryContact: data.contactName || "",
          mobileNo: data.contactNumber || "",
          phone: data.contactNumber || "",
          iso2: selectedCountryInfo.iso2?.toUpperCase() || "IN",
          callingCodes:
            selectedCountryInfo.callingCode.replace(/[\s+]/g, "") || "91",
          nationalMobileNum:
            selectedCountryInfo.callingCode.replace(/[\s+]/g, "") || "91",
          countryData: {
            callingCodes:
              parseInt(selectedCountryInfo.callingCode.replace(/[\s+]/g, "")) ||
              91,
            // Remove flag URL to avoid security violation - API only accepts S3 URLs
            id: parseInt(selectedCountryId) || 1,
            iso2: selectedCountryInfo.iso2?.toUpperCase() || "IN",
            iso3: "IND",
            name: data.country,
            numericCode: 356,
            region: "Asia",
            subregion: "Southern Asia",
            countryCode: selectedCountryInfo.iso2?.toUpperCase() || "IN",
          },
          countryCode: selectedCountryInfo.iso2?.toUpperCase() || "IN",
          countryCodeIso: selectedCountryInfo.iso2?.toUpperCase() || "IN",
          countryCallingCode:
            selectedCountryInfo.callingCode.replace(/[\s+]/g, "") || "91",
          stateData: {
            countryCode: selectedCountryInfo.iso2?.toUpperCase() || "IN",
            countryId: parseInt(selectedCountryId) || 1,
            id: parseInt(selectedStateId) || 1,
            latitude: parseFloat(data.latitude || "0"),
            longitude: parseFloat(data.longitude || "0"),
            name: data.state,
            stateCode: "TN",
          },
          districtData: {
            name: data.district || "",
          },
        };

        // Build the complete payload with the same structure as create
        const updatePayload = {
          id: branchId, // Branch ID at root level (Fix #1)
          name: data.branch, // Branch name at root level (Fix #3)
          addressId: addressData,
          // Branch metadata fields (Fix #5)
          branchSequenceNumber: null,
          code: null,
          inSequenceNumber: null,
          poSequenceNumber: null,
          salesBranchCode: null,
          salesOrgId: null,
          soSequenceNumber: null,
          toSequenceNumber: null,
          // Existing fields
          removeBranchWareHouseId: null, // Changed from [] to null to match Postman
          removeBusinessUnits: [],
          wareHouses: [],
          businessUnits: [],
          zoneId: null,
          branch: {
            addressId: addressData,
          },
          removeWareHouse: [],
          companyId: payload.companyId,
          userId: payload.userId,
          isUpdate: true, // Mark as update
        };

        const endpoint = `/api/branches/updateBrnAddress/${payload.userId}?companyId=${payload.companyId}&addressId=${addressId}`;

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "x-tenant": payload.iss,
            "Content-Type": "application/json",
          },
          credentials: "include", // Include HttpOnly cookies
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
          const responseClone = response.clone();
          let errorMessage = "";

          try {
            const errorData = (await response.json()) as {
              message?: string;
              error?: string;
            };
            errorMessage =
              errorData.message || errorData.error || `HTTP ${response.status}`;
          } catch {
            try {
              const textError = await responseClone.text();
              errorMessage = textError || `HTTP ${response.status}`;
            } catch {
              errorMessage = `Failed to update address (${response.status})`;
            }
          }

          throw new Error(errorMessage);
        }

        // Handle successful response with proper TypeScript typing
        interface UpdateResponse {
          data: Record<string, unknown>;
          message: string;
          status: string;
        }

        let result: UpdateResponse;

        try {
          result = (await response.json()) as UpdateResponse;

          // Validate response structure
          if (!result || typeof result !== "object") {
            throw new Error("Invalid response format");
          }

          // Check for API-level errors in successful HTTP response
          if (result.status !== "success") {
            throw new Error(result.message || "Update failed");
          }

          // eslint-disable-next-line no-console
          console.log("Address update successful:", result);
        } catch (parseError) {
          // eslint-disable-next-line no-console
          console.error("Response parsing error:", parseError);

          if (parseError instanceof Error) {
            throw new Error(parseError.message);
          } else {
            throw new Error("Failed to process server response");
          }
        }

        toast.success(result.message || "Address updated successfully!");
        onSuccess?.(data);
        onOpenChange(false);
        reset();
      } else {
        // For add mode, use the existing POST endpoint
        const addressData = {
          gst: data.taxId || "",
          branchName: data.branch,
          addressLine: data.address,
          locality: data.locality || "",
          city: data.city || "",
          district: data.district || "",
          lattitude: data.latitude || "",
          longitude: data.longitude || "",
          pinCodeId: data.postalCode,
          state: selectedStateId || "", // Use state ID for consistency
          country: selectedCountryId || "", // Use country ID for consistency
          isShipping: data.isShipping || false,
          isBilling: data.isBilling || false,
          wareHouse: false,
          primaryContact: data.contactName || "",
          mobileNo: data.contactNumber || "",
          phone: data.contactNumber || "",
          iso2: selectedCountryInfo.iso2?.toUpperCase() || "US",
          callingCodes:
            selectedCountryInfo.callingCode.replace(/[\s+]/g, "") || "1",
          nationalMobileNum:
            selectedCountryInfo.callingCode.replace(/[\s+]/g, "") || "1",
          countryData: {
            callingCodes:
              parseInt(selectedCountryInfo.callingCode.replace(/[\s+]/g, "")) ||
              1,
            // Remove flag URL to avoid security violation - API only accepts S3 URLs
            id: parseInt(selectedCountryId) || 1,
            iso2: selectedCountryInfo.iso2?.toUpperCase() || "US",
            iso3: "USA",
            name: data.country,
            numericCode: 840,
            region: "Americas",
            subregion: "North America",
            countryCode: selectedCountryInfo.iso2?.toUpperCase() || "US",
          },
          countryCode: selectedCountryInfo.iso2?.toUpperCase() || "US",
          countryCodeIso: selectedCountryInfo.iso2?.toUpperCase() || "US",
          countryCallingCode:
            selectedCountryInfo.callingCode.replace(/[\s+]/g, "") || "1",
          stateData: {
            countryCode: selectedCountryInfo.iso2?.toUpperCase() || "US",
            countryId: parseInt(selectedCountryId) || 1,
            id: parseInt(selectedStateId) || 1,
            latitude: parseFloat(data.latitude || "0"),
            longitude: parseFloat(data.longitude || "0"),
            name: data.state,
            stateCode: "ST",
          },
          districtData: {
            name: data.district || "",
          },
        };

        const apiPayload = {
          addressId: addressData,
          removeBranchWareHouseId: [],
          removeBusinessUnits: [],
          wareHouses: [],
          businessUnits: [],
          zoneId: null,
          branch: {
            addressId: addressData,
          },
          removeWareHouse: [],
          companyId: payload.companyId,
          userId: payload.userId,
          isUpdate: false,
        };

        const endpoint = `/api/branches/create/${payload.userId}?companyId=${payload.companyId}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "x-tenant": payload.iss,
            "Content-Type": "application/json",
          },
          credentials: "include", // Include HttpOnly cookies
          body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
          throw new Error(`Failed to add address`);
        }

        await response.json();
        toast.success("Address added successfully!");
        onSuccess?.(data);
        onOpenChange(false);
        reset();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error submitting address:", error);
      toast.error(`Failed to ${mode} address. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl h-[90vh] sm:h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-3 sm:px-4 py-2 sm:py-2.5 border-b shrink-0">
          <DialogTitle className="text-base sm:text-lg">
            {mode === "edit" ? "Edit Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-1.5 sm:py-2 min-h-0 overscroll-contain pb-14">
          <Card className="border-0 shadow-none h-full">
            <CardContent className="p-0 space-y-2 h-full">
              {/* Company Search */}
              <div className="pb-0.5">
                <Label
                  htmlFor="company-search"
                  className="text-xs font-normal mb-0 block"
                >
                  Company Name
                </Label>
                <div className="relative">
                  <Input
                    id="company-search"
                    placeholder="Search company name"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pr-10 h-8 text-sm px-3"
                  />
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <Separator className="my-1.5" />

              <form
                id="address-form"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onSubmit={handleSubmit(onSubmit as any)}
                className="space-y-1"
              >
                {/* Address Details Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <Label
                        htmlFor="branch"
                        className="text-xs font-normal mb-0 block"
                      >
                        Branch{" "}
                        <span
                          className="text-red-500 text-xs"
                          aria-label="required"
                        >
                          *
                        </span>
                      </Label>
                      <Input
                        id="branch"
                        {...register("branch")}
                        className="h-8 text-sm px-3"
                        aria-invalid={!!errors.branch}
                        aria-describedby={
                          errors.branch ? "branch-error" : undefined
                        }
                      />
                      {errors.branch && (
                        <p
                          id="branch-error"
                          className="text-xs text-red-500 mt-0.5"
                        >
                          {errors.branch.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="address"
                        className="text-xs font-normal mb-0 block"
                      >
                        Street Address{" "}
                        <span
                          className="text-red-500 text-xs"
                          aria-label="required"
                        >
                          *
                        </span>
                      </Label>
                      <Textarea
                        id="address"
                        {...register("address")}
                        className="min-h-[70px] text-sm px-3 resize-none"
                        aria-invalid={!!errors.address}
                        aria-describedby={
                          errors.address ? "address-error" : undefined
                        }
                        placeholder="Enter street address"
                      />
                      {errors.address && (
                        <p
                          id="address-error"
                          className="text-xs text-red-500 mt-0.5"
                        >
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="locality"
                        className="text-xs font-normal mb-0 block"
                      >
                        Locality
                      </Label>
                      <Input
                        id="locality"
                        {...register("locality")}
                        className="h-8 text-sm px-3"
                        placeholder="Area, neighborhood"
                        aria-invalid={!!errors.locality}
                        aria-describedby={
                          errors.locality ? "locality-error" : undefined
                        }
                      />
                      {errors.locality && (
                        <p
                          id="locality-error"
                          className="text-xs text-red-500 mt-0.5"
                        >
                          {errors.locality.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-1">
                  {/* Country and State - 50% each */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-normal mb-0 block">
                        Country{" "}
                        <span
                          className="text-red-500 text-xs"
                          aria-label="required"
                        >
                          *
                        </span>
                      </Label>
                      <Controller
                        name="country"
                        control={control}
                        render={() => (
                          <Select
                            value={selectedCountryId}
                            onValueChange={value => {
                              handleCountryChange(value);
                            }}
                            disabled={dataLoading}
                          >
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue
                                placeholder={
                                  dataLoading ? "Loading..." : "Select country"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {countryOptions.length > 0 ? (
                                countryOptions.map(country => (
                                  <SelectItem
                                    key={country.value}
                                    value={country.value}
                                  >
                                    {country.label}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-countries" disabled>
                                  {dataLoading
                                    ? "Loading..."
                                    : "No countries available"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.country && (
                        <p className="text-xs text-red-500 mt-0">
                          {errors.country.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs font-normal mb-0 block">
                        State/Province{" "}
                        <span
                          className="text-red-500 text-xs"
                          aria-label="required"
                        >
                          *
                        </span>
                      </Label>
                      <Controller
                        name="state"
                        control={control}
                        render={() => (
                          <Select
                            value={selectedStateId}
                            onValueChange={value => {
                              handleStateChange(value);
                            }}
                            disabled={dataLoading || !selectedCountryId}
                          >
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue
                                placeholder={
                                  !selectedCountryId
                                    ? "Select country first"
                                    : dataLoading
                                      ? "Loading..."
                                      : "Select state"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {stateOptions.length > 0 ? (
                                stateOptions.map(state => (
                                  <SelectItem
                                    key={state.value}
                                    value={state.value}
                                  >
                                    {state.label}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-states" disabled>
                                  {!selectedCountryId
                                    ? "Select a country first"
                                    : dataLoading
                                      ? "Loading..."
                                      : "No states available"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.state && (
                        <p className="text-xs text-red-500 mt-0">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* District and Postal Code - 50% each */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-normal mb-0 block">
                        District
                      </Label>
                      <Controller
                        name="district"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={
                              // Find the district ID for the current form value (name)
                              field.value
                                ? allData.districts
                                    .find(d => d.name === field.value)
                                    ?.id.toString() || field.value
                                : ""
                            }
                            onValueChange={handleDistrictChange}
                            disabled={dataLoading || !selectedStateId}
                          >
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue
                                placeholder={
                                  !selectedStateId
                                    ? "Select state first"
                                    : dataLoading
                                      ? "Loading..."
                                      : "Select district"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {districtOptions.length > 0 ? (
                                districtOptions.map(district => (
                                  <SelectItem
                                    key={district.value}
                                    value={district.value}
                                  >
                                    {district.label}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-districts" disabled>
                                  {!selectedStateId
                                    ? "Select a state first"
                                    : dataLoading
                                      ? "Loading..."
                                      : "No districts available"}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="postalCode"
                        className="text-xs font-normal mb-0 block"
                      >
                        Postal/Pin Code{" "}
                        <span
                          className="text-red-500 text-xs"
                          aria-label="required"
                        >
                          *
                        </span>
                      </Label>
                      <Input
                        id="postalCode"
                        {...register("postalCode")}
                        type="tel"
                        inputMode="numeric"
                        className="h-8 text-sm px-3"
                      />
                      {errors.postalCode && (
                        <p className="text-xs text-red-500 mt-0">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* City 50%, Latitude 25%, Longitude 25% */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <Label
                        htmlFor="city"
                        className="text-xs font-normal mb-0 block"
                      >
                        City
                      </Label>
                      <Input
                        id="city"
                        {...register("city")}
                        className="h-8 text-sm px-3"
                        placeholder="City name"
                        aria-invalid={!!errors.city}
                        aria-describedby={
                          errors.city ? "city-error" : undefined
                        }
                      />
                      {errors.city && (
                        <p
                          id="city-error"
                          className="text-xs text-red-500 mt-0.5"
                        >
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <Label
                        htmlFor="latitude"
                        className="text-xs font-normal mb-0 block"
                      >
                        Latitude
                      </Label>
                      <Input
                        id="latitude"
                        {...register("latitude")}
                        type="number"
                        step="any"
                        min="-90"
                        max="90"
                        inputMode="decimal"
                        className="h-8 text-sm px-3"
                        placeholder="0.00"
                        aria-invalid={!!errors.latitude}
                        aria-describedby={
                          errors.latitude ? "latitude-error" : undefined
                        }
                      />
                      {errors.latitude && (
                        <p
                          id="latitude-error"
                          className="text-xs text-red-500 mt-0.5"
                        >
                          {errors.latitude.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <Label
                        htmlFor="longitude"
                        className="text-xs font-normal mb-0 block"
                      >
                        Longitude
                      </Label>
                      <Input
                        id="longitude"
                        {...register("longitude")}
                        type="number"
                        step="any"
                        min="-180"
                        max="180"
                        inputMode="decimal"
                        className="h-8 text-sm px-3"
                        placeholder="0.00"
                        aria-invalid={!!errors.longitude}
                        aria-describedby={
                          errors.longitude ? "longitude-error" : undefined
                        }
                      />
                      {errors.longitude && (
                        <p
                          id="longitude-error"
                          className="text-xs text-red-500 mt-0.5"
                        >
                          {errors.longitude.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Address Type <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Controller
                        name="isBilling"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors">
                            <Checkbox
                              id="billing"
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              className="h-5 w-5 mt-0.5"
                              aria-describedby="billing-description"
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor="billing"
                                className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Billing Address
                              </Label>
                              <p
                                id="billing-description"
                                className="text-xs text-muted-foreground mt-1"
                              >
                                Use this address for invoicing and payments
                              </p>
                            </div>
                          </div>
                        )}
                      />
                      <Controller
                        name="isShipping"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors">
                            <Checkbox
                              id="shipping"
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                              className="h-5 w-5 mt-0.5"
                              aria-describedby="shipping-description"
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor="shipping"
                                className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Shipping Address
                              </Label>
                              <p
                                id="shipping-description"
                                className="text-xs text-muted-foreground mt-1"
                              >
                                Use this address for product deliveries
                              </p>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                    {errors.isBilling && (
                      <p className="text-xs text-red-500 mt-2">
                        {errors.isBilling.message}
                      </p>
                    )}
                  </div>

                  {/* Tax ID */}
                  <div>
                    <Label
                      htmlFor="taxId"
                      className="text-xs font-normal mb-0 block"
                    >
                      Tax ID / GST Number
                    </Label>
                    <Input
                      id="taxId"
                      {...register("taxId")}
                      className="h-8 text-sm px-3"
                      placeholder="Enter tax identification number"
                      aria-invalid={!!errors.taxId}
                      aria-describedby={
                        errors.taxId ? "taxId-error" : undefined
                      }
                    />
                    {errors.taxId && (
                      <p
                        id="taxId-error"
                        className="text-xs text-red-500 mt-0.5"
                      >
                        {errors.taxId.message}
                      </p>
                    )}
                  </div>

                  <Separator className="my-1.5" />

                  {/* Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label
                        htmlFor="contactName"
                        className="text-xs font-normal mb-0 block"
                      >
                        Contact Person
                      </Label>
                      <Input
                        id="contactName"
                        {...register("contactName")}
                        className="h-8 text-sm px-3"
                        placeholder="Enter contact person name"
                        aria-invalid={!!errors.contactName}
                        aria-describedby={
                          errors.contactName ? "contactName-error" : undefined
                        }
                      />
                      {errors.contactName && (
                        <p
                          id="contactName-error"
                          className="text-xs text-red-500 mt-0.5"
                        >
                          {errors.contactName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="contactNumber"
                        className="text-xs font-normal mb-0 block"
                      >
                        Phone Number
                      </Label>
                      <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none z-10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedCountryInfo.flag}
                            alt={selectedCountryInfo.iso2}
                            className="w-4 h-3 object-cover"
                          />
                          <span className="text-sm text-gray-600">
                            {selectedCountryInfo.callingCode}
                          </span>
                        </div>
                        <Input
                          id="contactNumber"
                          {...register("contactNumber")}
                          type="tel"
                          inputMode="tel"
                          className="h-8 text-sm pl-20 pr-3"
                          placeholder=""
                          value={(watch("contactNumber") || "").replace(
                            /^\+\d+\s*/,
                            ""
                          )}
                          onChange={e => {
                            // Save only the local number (without country code)
                            setValue("contactNumber", e.target.value);
                          }}
                        />
                        {/* Custom placeholder that doesn't overlap */}
                        {!watch("contactNumber") && (
                          <div className="absolute left-20 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                            123456789
                          </div>
                        )}
                      </div>
                      {errors.contactNumber && (
                        <p className="text-xs text-red-500 mt-0.5">
                          {errors.contactNumber.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Action Buttons at Bottom */}
        <div className="border-t bg-background px-3 sm:px-4 py-2 shrink-0">
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full sm:w-auto min-h-[32px] px-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              form="address-form"
              type="submit"
              disabled={isLoading}
              variant="default"
              className="w-full sm:w-auto min-h-[32px] px-4 text-sm order-first sm:order-last"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === "edit" ? "Updating..." : "Adding..."}
                </>
              ) : mode === "edit" ? (
                "Update Address"
              ) : (
                "Add Address"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddAddressDialog;
