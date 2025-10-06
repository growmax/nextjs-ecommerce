"use client";

import HeaderBar from "@/components/Global/HeaderBar/HeaderBar";
import SectionCard from "@/components/custom/SectionCard";
import { SaveCancelToolbar } from "@/components/custom/save-cancel-toolbar";
import { AddAddressDialog } from "@/components/dialogs/company";
import { FullWidthLayout } from "@/components/layout/PageContent";
import { Badge } from "@/components/ui/badge";
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
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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

// Address search form schema
const addressSearchSchema = z.object({
  searchTerm: z.string().optional(),
  pageSize: z.number().min(5).max(100),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;
type AddressSearchData = z.infer<typeof addressSearchSchema>;

// Type for address dialog data
type AddressDialogData = {
  companyName?: string;
  branch: string;
  address: string;
  locality?: string;
  country: string;
  state: string;
  district?: string;
  postalCode: string;
  city?: string;
  latitude?: string;
  longitude?: string;
  isBilling?: boolean;
  isShipping?: boolean;
  taxId?: string;
  contactName?: string;
  contactNumber?: string;
};

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

interface BranchAddress {
  id: number;
  name: string;
  addressId: {
    id: number;
    addressLine: string;
    branchName: string;
    locality?: string;
    city: string;
    state: string;
    country: string;
    district?: string;
    pinCodeId: string;
    latitude?: string;
    longitude?: string;
    gst: string;
    primaryContact: string;
    phone: string;
    mobileNo: string;
    nationalMobileNum: string;
    email: string | null;
    isBilling: boolean;
    isShipping: boolean;
  };
  zoneId?: {
    zoneId?: {
      zoneName: string;
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
  const [, setSelectedSubIndustry] = useState<SubIndustryItem | null>(null);
  const [showAddAddressDialog, setShowAddAddressDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressDialogData | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  // Dynamic spacing state
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Map address data from API to dialog format
  const mapAddressDataToDialog = (
    branchData: BranchAddress
  ): AddressDialogData => {
    const addressData =
      branchData.addressId || ({} as BranchAddress["addressId"]);
    return {
      branch: branchData.name || addressData.branchName || "",
      address: addressData.addressLine || "",
      locality: addressData.locality || "",
      country: addressData.country || "",
      state: addressData.state || "",
      district: addressData.district || "",
      postalCode: addressData.pinCodeId || "",
      city: addressData.city || "",
      latitude: addressData.latitude || "",
      longitude: addressData.longitude || "",
      isBilling: addressData.isBilling || false,
      isShipping: addressData.isShipping || false,
      taxId: addressData.gst || "",
      contactName: addressData.primaryContact || "",
      contactNumber:
        addressData.mobileNo && addressData.nationalMobileNum
          ? `+${addressData.nationalMobileNum} ${addressData.mobileNo}`
          : addressData.phone || "",
    };
  };

  // Handle row click to edit address
  const handleEditAddress = (branchData: BranchAddress) => {
    const mappedData = mapAddressDataToDialog(branchData);
    const addressId = branchData.addressId?.id || null;
    const branchId = branchData.id || null;

    setSelectedAddress(mappedData);
    setSelectedAddressId(addressId);
    setSelectedBranchId(branchId);
    setDialogMode("edit");
    setShowAddAddressDialog(true);
  };

  // Handle add new address
  const handleAddAddress = () => {
    setSelectedAddress(null);
    setSelectedAddressId(null);
    setSelectedBranchId(null);
    setDialogMode("add");
    setShowAddAddressDialog(true);
  };

  // Handle delete address with loading states
  const handleDeleteAddress = async (addressId: number, branchName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${branchName}" address? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // 🔄 STEP 1: Start loading state
      setDeletingAddressId(addressId);
      setAddressError(null);

      // 🔄 STEP 2: API call to delete
      const accessToken = AuthStorage.getAccessToken();
      const jwtService = JWTService.getInstance();
      const payload = jwtService.decodeToken(accessToken!);

      if (!payload) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `/api/branches/delete-address/${addressId}`,
        {
          method: "DELETE",
          headers: {
            "x-tenant": payload.iss,
            "Content-Type": "application/json",
          },
          credentials: "include", // Include HttpOnly cookies
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete address: ${response.status}`);
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "Failed to delete address");
      }

      // 🎉 STEP 3: Success - Show success and refresh data
      toast.success("Address deleted successfully!");

      // 🔄 STEP 4: Fetch fresh data from server
      await fetchBranchAddresses(searchTerm, currentPage, false, pageSize);
    } catch (error) {
      // 🚨 STEP 5: Handle errors
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete address";
      setAddressError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // 🔄 STEP 6: Always clear loading state
      setDeletingAddressId(null);
    }
  };

  // Address section state
  const [addresses, setAddresses] = useState<BranchAddress[]>([]);
  const [totalAddresses, setTotalAddresses] = useState(0);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(
    null
  );
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Page size options
  const pageSizeOptions = [5, 10, 25, 50, 100];

  // Group sub-industries by parent industry
  const groupedOptions = useMemo(() => {
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

  // React Hook Form setup for company data
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      website: "",
      gst: "",
      subIndustry: "",
    },
  });

  // React Hook Form setup for address search
  const {
    control: controlSearch,
    watch: watchSearch,
    setValue: setValueSearch,
  } = useForm<AddressSearchData>({
    resolver: zodResolver(addressSearchSchema),
    defaultValues: {
      searchTerm: "",
      pageSize: 20,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  // Watch form values for real-time updates
  const searchTerm = watchSearch("searchTerm") || "";
  const pageSize = watchSearch("pageSize") || 20;

  // Watch the subIndustry field for real-time updates
  const watchedSubIndustry = watch("subIndustry");

  // Get current industry description based on selected value
  const getCurrentIndustryInfo = () => {
    if (watchedSubIndustry) {
      const selected = subIndustryOptions.find(
        opt => opt.value === watchedSubIndustry
      );
      if (selected && selected.fullData) {
        const industryData = selected.fullData as SubIndustryItem;
        return {
          industryName: industryData.industryId.name,
          description: industryData.description,
        };
      }
    }
    // Fallback to original data
    return {
      industryName: data?.subIndustryId?.industryId?.name || "Unknown Industry",
      description:
        data?.subIndustryId?.description || "No description available",
    };
  };

  // Fetch sub-industries from API
  const fetchSubIndustries = async (currentCompanyData?: CompanyData) => {
    try {
      const accessToken = AuthStorage.getAccessToken();
      const jwtService = JWTService.getInstance();
      const payload = jwtService.decodeToken(accessToken!);

      if (!accessToken || !payload) {
        return;
      }

      const response = await fetch("/api/subindustries", {
        headers: {
          "x-tenant": payload.iss,
          "Content-Type": "application/json",
        },
        credentials: "include", // Include HttpOnly cookies
      });

      if (response.ok) {
        const data = await response.json();

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
      }
    } catch {
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

  // Fetch branch addresses from API
  const fetchBranchAddresses = async (
    search: string = "",
    page: number = 0,
    clearDataFirst: boolean = false,
    pageSizeOverride?: number
  ) => {
    try {
      // Clear data immediately if requested (for new searches)
      if (clearDataFirst) {
        setAddresses([]);
        setTotalAddresses(0);
      }

      setLoadingAddresses(true);
      setAddressError(null);

      const accessToken = AuthStorage.getAccessToken();
      const jwtService = JWTService.getInstance();
      const payload = jwtService.decodeToken(accessToken!);

      if (!payload || !payload.companyId || !payload.userId) {
        throw new Error("Missing authentication data");
      }

      const currentPageSize = pageSizeOverride || pageSize;
      // API uses row-based offset, not page-based
      // For page 2 with 7 total records and pageSize=5:
      // We want records 6-7, so offset should be 5 (start from 6th record)
      const offset = page * currentPageSize;
      const url =
        `/api/branches/readBranchwithPagination/${payload.userId}?` +
        `companyId=${payload.companyId}&` +
        `offset=${offset}&` +
        `limit=${currentPageSize}&` +
        `searchString=${encodeURIComponent(search)}`;

      // Debug logging
      // eslint-disable-next-line no-console
      console.log("Fetching addresses with params:", {
        page,
        pageSize: currentPageSize,
        offset,
        limit: currentPageSize,
        searchString: search,
        url,
      });

      const response = await fetch(url, {
        headers: {
          "x-tenant": payload.iss,
          "Content-Type": "application/json",
        },
        credentials: "include", // Include HttpOnly cookies
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch addresses: ${response.status}`);
      }

      const result = await response.json();

      // Debug logging
      // eslint-disable-next-line no-console
      console.log("API Response:", {
        status: result.status,
        totalCount: result.data?.totalCount,
        branchResponseLength: result.data?.branchResponse?.length,
        branchResponse: result.data?.branchResponse,
        fullResult: result,
      });

      if (result.status === "success" && result.data) {
        const branchData = result.data.branchResponse || [];
        const totalCount = result.data.totalCount || 0;
        // eslint-disable-next-line no-console
        console.log("Setting state:", {
          branchDataLength: branchData.length,
          totalCount,
          page,
          offset,
          firstItem: branchData[0]?.name,
          lastItem: branchData[branchData.length - 1]?.name,
        });
        setAddresses(branchData);
        setTotalAddresses(totalCount);
      } else {
        throw new Error(result.message || "Failed to fetch addresses");
      }
    } catch (err) {
      setAddressError(
        err instanceof Error ? err.message : "Failed to load addresses"
      );
      setAddresses([]);
      setTotalAddresses(0);
    } finally {
      setLoadingAddresses(false);
      setIsSearching(false); // Reset searching state
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    // eslint-disable-next-line no-console
    console.log("handlePageChange called:", {
      currentPage,
      newPage,
      searchTerm,
      pageSize,
    });
    setCurrentPage(newPage);
    // Don't clear data when paginating
    fetchBranchAddresses(searchTerm, newPage, false, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setValueSearch("pageSize", newPageSize);
    setCurrentPage(0); // Reset to first page when changing page size

    // Clear existing data immediately when page size changes
    setAddresses([]); // Clear current data
    setTotalAddresses(0); // Reset count
    setLoadingAddresses(true); // Show loading state
    setAddressError(null); // Clear any errors

    fetchBranchAddresses(searchTerm, 0, false, newPageSize);
  };

  // Handle search term change
  const handleSearchChange = (newSearchTerm: string) => {
    setValueSearch("searchTerm", newSearchTerm);
    setCurrentPage(0); // Reset to first page when searching

    // Clear existing data immediately when search starts
    if (newSearchTerm !== searchTerm) {
      setAddresses([]); // Clear current data
      setTotalAddresses(0); // Reset count
      setLoadingAddresses(true); // Show loading state
      setAddressError(null); // Clear any errors
    }
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get basic auth info for tenant
        const accessToken = AuthStorage.getAccessToken();
        if (!accessToken) {
          setError("Authentication required. Please log in again.");
          return;
        }

        const jwtService = JWTService.getInstance();
        const payload = jwtService.decodeToken(accessToken);
        if (!payload || !payload.companyId || !payload.iss) {
          setError("Invalid session. Please log in again.");
          return;
        }

        // Fetch company data from API - backend handles authentication
        const response = await fetch(`/api/company/${payload.companyId}`, {
          headers: {
            "x-tenant": payload.iss,
            "Content-Type": "application/json",
          },
          credentials: "include", // Include HttpOnly cookies
        });

        if (!response.ok) {
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

  // Fetch addresses after company data is loaded
  useEffect(() => {
    if (companyData && companyData.data) {
      fetchBranchAddresses("", 0, false, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyData]); // Remove pageSize from dependencies to prevent duplicate calls

  // Handle search with debounce (only for search term changes)
  useEffect(() => {
    if (!companyData) return;

    // Clear data immediately when search term changes
    if (searchTerm !== "") {
      setAddresses([]);
      setTotalAddresses(0);
      setLoadingAddresses(true);
      setAddressError(null);
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      if (companyData) {
        setCurrentPage(0);
        fetchBranchAddresses(searchTerm, 0, false, pageSize);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Only watch searchTerm to prevent conflicts

  // Dynamic spacing calculation
  useEffect(() => {
    const calculateSpacing = () => {
      // Only run on client side
      if (typeof window === "undefined") return;

      // Get actual header height for future use if needed
      const header = document.querySelector("[data-header]") as HTMLElement;
      if (header) {
        // Header height available here if needed: header.offsetHeight
      }

      // Calculate toolbar height when visible
      const toolbar = document.querySelector(
        "[data-save-cancel-toolbar]"
      ) as HTMLElement;
      if (toolbar && isDirty) {
        setToolbarHeight(toolbar.offsetHeight);
      } else {
        setToolbarHeight(0);
      }
    };

    calculateSpacing();

    // Recalculate on resize (only on client side)
    if (typeof window !== "undefined") {
      window.addEventListener("resize", calculateSpacing);
      return () => window.removeEventListener("resize", calculateSpacing);
    }

    // Return undefined for server-side rendering
    return undefined;
  }, [isDirty]);

  // Calculate dynamic margin top for content
  const dynamicMarginTop = useMemo(() => {
    // Check if we're on the client side
    if (typeof window === "undefined") {
      return "-16px"; // Default for SSR
    }

    const isMobile = window.innerWidth < 768;
    const baseOffset = isMobile ? 8 : 16; // Less offset on mobile
    const toolbarOffset = isDirty ? Math.min(toolbarHeight, 24) : 0; // Cap toolbar offset
    return `-${baseOffset + toolbarOffset}px`;
  }, [toolbarHeight, isDirty]);

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

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // After successful save, update the form's default values
      reset(formData);

      toast.success("Company settings saved successfully!");
    } catch {
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
      <div data-header="true">
        <HeaderBar
          title="Company Settings"
          icon={<User className="w-5 h-5 sm:w-6 sm:h-6" />}
        />
      </div>

      {/* SaveCancelToolbar - Positioned at top below header */}
      <SaveCancelToolbar
        show={isDirty}
        onSave={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isLoading={isSaving}
        saveText="Save Changes"
        cancelText="Cancel"
        className="!top-[56px] !left-0 !fixed"
        data-save-cancel-toolbar="true"
      />
      <FullWidthLayout>
        {/* Mobile-First Responsive Layout */}
        <div
          className="min-h-screen bg-background"
          style={{ marginTop: dynamicMarginTop }}
          ref={contentRef}
        >
          <div className="flex flex-col gap-0 sm:gap-1 lg:gap-2 px-1 sm:px-3 lg:px-4 pt-2 sm:pt-3 lg:pt-4 pb-1 sm:pb-2 lg:pb-3 min-h-screen w-full max-w-full overflow-x-hidden">
            {/* Main Company Form Card - Mobile Responsive */}
            <SectionCard
              title={`Welcome ${data.name}`}
              className="
                w-full max-w-full sm:max-w-7xl mx-auto mt-0
                min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] max-h-none
                overflow-hidden flex flex-col
              "
              contentClassName="pt-1 sm:pt-2 pb-1 sm:pb-2 px-1 sm:px-4 lg:px-6"
            >
              <div className="flex-1 overflow-y-auto">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex-1 flex flex-col pb-0"
                >
                  {/* Mobile-First Responsive Layout Grid */}
                  <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-4 flex-1 w-full overflow-hidden">
                    {/* Company Logo Upload - Mobile Responsive */}
                    <div className="flex-shrink-0 self-center lg:self-start order-1 lg:order-none w-full sm:w-auto">
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
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto lg:mx-0 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center relative overflow-hidden bg-muted/5 hover:bg-muted/10 transition-colors">
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

                    {/* Form Fields - Mobile Responsive Grid */}
                    <div className="flex-1 flex flex-col order-2 lg:order-none w-full min-w-0">
                      <div className="flex-1 space-y-2 sm:space-y-3 lg:space-y-4 w-full">
                        {/* First Line - Company Name & Website */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 w-full">
                          <div className="space-y-1.5 sm:space-y-2 w-full min-w-0">
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
                              className="w-full border border-gray-300 focus:border-blue-500 h-10 sm:h-10 md:h-11 text-sm sm:text-base"
                            />
                            {errors.name && (
                              <p className="text-xs sm:text-sm text-red-600">
                                {errors.name.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1.5 sm:space-y-2 w-full min-w-0">
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
                              className="w-full border border-gray-300 focus:border-blue-500 h-10 sm:h-10 md:h-11 text-sm sm:text-base"
                            />
                            {errors.website && (
                              <p className="text-xs sm:text-sm text-red-600">
                                {errors.website.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Second Line - Tax ID/GST & Business Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                              className="border border-gray-300 focus:border-blue-500 h-10 sm:h-10 md:h-11 text-sm sm:text-base"
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
                              className="bg-muted border border-gray-300 h-10 sm:h-10 md:h-11 text-sm sm:text-base"
                            />
                          </div>
                        </div>

                        {/* Third Line - Account Type & Default Currency */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                              className="bg-muted border border-gray-300 h-10 sm:h-10 md:h-11 text-sm sm:text-base"
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
                              className="bg-muted border border-gray-300 h-10 sm:h-10 md:h-11 text-sm sm:text-base"
                            />
                          </div>
                        </div>

                        {/* Fourth Line - Sub Industry & Industry Description */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
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
                                    <SelectTrigger className="border border-gray-300 focus:border-blue-500 h-10 sm:h-10 md:h-11 text-sm sm:text-base">
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
                              {getCurrentIndustryInfo().industryName}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {getCurrentIndustryInfo().description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </SectionCard>

            {/* Address Information Card - Mobile Responsive */}
            <SectionCard
              title="Address Information"
              className="
                w-full max-w-full sm:max-w-7xl mx-auto
                min-h-[300px] sm:min-h-[400px] max-h-none
                overflow-hidden flex flex-col
              "
              contentClassName="pt-1 sm:pt-2 px-1 sm:px-3 lg:px-4"
              headerActions={
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Controller
                    name="searchTerm"
                    control={controlSearch}
                    render={({ field }) => (
                      <Input
                        placeholder="Search addresses..."
                        className="flex-1 sm:flex-none sm:w-48 md:w-56 lg:w-64 text-sm h-9"
                        value={field.value || ""}
                        onChange={e => {
                          field.onChange(e.target.value);
                          handleSearchChange(e.target.value);
                        }}
                      />
                    )}
                  />
                  <Button
                    size="sm"
                    className="h-9 px-3 flex items-center gap-2 flex-shrink-0 text-sm"
                    onClick={handleAddAddress}
                    disabled={isAddingAddress}
                  >
                    {isAddingAddress ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add Address</span>
                      </>
                    )}
                  </Button>
                </div>
              }
            >
              <div className="flex-1 overflow-hidden flex flex-col relative">
                {/* Loading state */}
                {(loadingAddresses || isAddingAddress) && (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>
                      {isAddingAddress
                        ? "Adding address and refreshing list..."
                        : isSearching
                          ? `Searching addresses${searchTerm ? ` for "${searchTerm}"` : ""}...`
                          : "Loading addresses..."}
                    </span>
                  </div>
                )}

                {/* Adding address overlay */}
                {isAddingAddress && addresses.length > 0 && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="bg-background border rounded-lg p-6 shadow-lg flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm font-medium">
                        Adding address and refreshing list...
                      </span>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {addressError && !loadingAddresses && (
                  <div className="text-center text-red-600 p-8">
                    <p>Error: {addressError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchBranchAddresses(
                          searchTerm,
                          currentPage,
                          false,
                          pageSize
                        )
                      }
                      className="mt-4"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* Empty state - Only show when truly no data exists */}
                {!loadingAddresses &&
                  !addressError &&
                  addresses.length === 0 &&
                  totalAddresses === 0 && (
                    <div className="text-center text-gray-600 p-8">
                      <p>No addresses found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddAddress}
                        className="mt-4"
                        disabled={isAddingAddress}
                      >
                        {isAddingAddress ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Address
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                {/* Data display - Show when we have total addresses even if current page is empty */}
                {!loadingAddresses && !addressError && totalAddresses > 0 && (
                  <>
                    {/* Show message if current page is empty but data exists */}
                    {addresses.length === 0 && (
                      <div className="text-center text-gray-600 p-8">
                        <p>No addresses on this page</p>
                        <p className="text-sm mt-2">
                          Try navigating to a different page or adjusting the
                          page size
                        </p>
                      </div>
                    )}

                    {/* Mobile: Card view */}
                    {addresses.length > 0 && (
                      <div className="block md:hidden flex-1 overflow-y-auto">
                        <div className="space-y-2 p-1">
                          {addresses.map(branch => (
                            <Card
                              key={branch.id}
                              className="p-3 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleEditAddress(branch)}
                            >
                              <div className="space-y-3">
                                <div className="space-y-0.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="font-semibold text-sm">
                                      {branch.name ||
                                        branch.addressId?.branchName ||
                                        "-"}
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      {branch.addressId?.isBilling && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs px-2 py-0.5"
                                        >
                                          Billing
                                        </Badge>
                                      )}
                                      {branch.addressId?.isShipping && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs px-2 py-0.5"
                                        >
                                          Shipping
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {branch.addressId?.addressLine || "-"}
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {[
                                      branch.addressId?.city,
                                      branch.addressId?.state,
                                      branch.addressId?.pinCodeId,
                                    ]
                                      .filter(Boolean)
                                      .join(", ") || "-"}
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {branch.addressId?.country || "-"}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Tax ID/GST
                                    </span>
                                    <div className="font-medium text-xs sm:text-sm">
                                      {branch.addressId?.gst || "-"}
                                    </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Contact
                                    </span>
                                    <div className="font-medium text-xs sm:text-sm">
                                      {branch.addressId?.primaryContact || "-"}
                                    </div>
                                  </div>
                                  <div className="col-span-2 space-y-0.5">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Phone
                                    </span>
                                    <div className="font-medium text-xs sm:text-sm">
                                      {branch.addressId?.mobileNo &&
                                      branch.addressId?.nationalMobileNum
                                        ? `+${branch.addressId.nationalMobileNum} ${branch.addressId.mobileNo}`
                                        : branch.addressId?.phone || "-"}
                                    </div>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex gap-3">
                                  <Button
                                    variant="outline"
                                    size="default"
                                    className="flex-1 h-10 text-sm font-medium"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleEditAddress(branch);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="default"
                                    className="flex-1 h-10 text-sm font-medium"
                                    disabled={
                                      deletingAddressId ===
                                      (branch.addressId?.id || branch.id)
                                    }
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDeleteAddress(
                                        branch.addressId?.id || branch.id,
                                        branch.name ||
                                          branch.addressId?.branchName ||
                                          "Unknown"
                                      );
                                    }}
                                  >
                                    {deletingAddressId ===
                                    (branch.addressId?.id || branch.id) ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Desktop: Table view */}
                    {addresses.length > 0 && (
                      <div className="hidden md:block flex-1 overflow-auto">
                        <Table>
                          <TableHeader className="bg-accent sticky top-0">
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-12 text-center text-xs sm:text-sm">
                                Action
                              </TableHead>
                              <TableHead className="min-w-[100px] text-xs sm:text-sm">
                                Branch
                              </TableHead>
                              <TableHead className="min-w-[250px] text-xs sm:text-sm">
                                Address
                              </TableHead>
                              <TableHead className="min-w-[120px] text-xs sm:text-sm">
                                Tax ID / GST
                              </TableHead>
                              <TableHead className="min-w-[120px] text-xs sm:text-sm">
                                Contact Person
                              </TableHead>
                              <TableHead className="min-w-[150px] text-xs sm:text-sm">
                                Phone
                              </TableHead>
                              <TableHead className="min-w-[100px] text-xs sm:text-sm">
                                Zone
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {addresses.map(branch => (
                              <TableRow
                                key={branch.id}
                                className="hover:bg-muted/50 cursor-pointer"
                                onClick={() => handleEditAddress(branch)}
                              >
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    disabled={
                                      deletingAddressId ===
                                      (branch.addressId?.id || branch.id)
                                    }
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDeleteAddress(
                                        branch.addressId?.id || branch.id,
                                        branch.name ||
                                          branch.addressId?.branchName ||
                                          "Unknown"
                                      );
                                    }}
                                  >
                                    {deletingAddressId ===
                                    (branch.addressId?.id || branch.id) ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell className="font-medium text-xs sm:text-sm">
                                  {branch.name ||
                                    branch.addressId?.branchName ||
                                    "-"}
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div className="space-y-1">
                                    <div className="text-xs sm:text-sm">
                                      {branch.addressId?.addressLine || "-"}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                      {[
                                        branch.addressId?.city,
                                        branch.addressId?.state,
                                        branch.addressId?.pinCodeId,
                                      ]
                                        .filter(Boolean)
                                        .join(", ") || "-"}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                      {branch.addressId?.country || "-"}
                                    </div>
                                    <div className="flex gap-1.5 mt-2">
                                      {branch.addressId?.isBilling && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs font-medium px-2.5 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                                        >
                                          Billing
                                        </Badge>
                                      )}
                                      {branch.addressId?.isShipping && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs font-medium px-2.5 py-0.5 hover:bg-accent/20"
                                        >
                                          Shipping
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">
                                  {branch.addressId?.gst || "-"}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">
                                  {branch.addressId?.primaryContact || "-"}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">
                                  {branch.addressId?.mobileNo &&
                                  branch.addressId?.nationalMobileNum
                                    ? `+${branch.addressId.nationalMobileNum} ${branch.addressId.mobileNo}`
                                    : branch.addressId?.phone || "-"}
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm">
                                  {branch.zoneId?.zoneId?.zoneName || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Enhanced Pagination Controls - Always show when totalAddresses > 0 */}
                    <div className="border-t bg-background">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-3 sm:p-4">
                        {/* Left side: Results info and page size selector */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="text-sm text-muted-foreground order-2 sm:order-1">
                            {addresses.length > 0 ? (
                              <>
                                Showing{" "}
                                <span className="font-semibold text-foreground">
                                  {currentPage * pageSize + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold text-foreground">
                                  {Math.min(
                                    (currentPage + 1) * pageSize,
                                    totalAddresses
                                  )}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-foreground">
                                  {totalAddresses}
                                </span>{" "}
                                addresses
                              </>
                            ) : (
                              <>
                                Total{" "}
                                <span className="font-semibold text-foreground">
                                  {totalAddresses}
                                </span>{" "}
                                addresses available
                              </>
                            )}
                          </div>

                          {/* Page Size Selector */}
                          <div className="flex items-center gap-2 order-1 sm:order-2">
                            <Label
                              htmlFor="page-size"
                              className="text-sm text-muted-foreground whitespace-nowrap"
                            >
                              Show:
                            </Label>
                            <Controller
                              name="pageSize"
                              control={controlSearch}
                              render={({ field }) => (
                                <Select
                                  value={field.value.toString()}
                                  onValueChange={value => {
                                    const newSize = parseInt(value);
                                    field.onChange(newSize);
                                    handlePageSizeChange(newSize);
                                  }}
                                >
                                  <SelectTrigger
                                    className="w-20 h-9 border-input"
                                    id="page-size"
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {pageSizeOptions.map(size => (
                                      <SelectItem
                                        key={size}
                                        value={size.toString()}
                                      >
                                        {size}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              per page
                            </span>
                          </div>
                        </div>

                        {/* Right side: Navigation controls */}
                        <div className="flex items-center justify-center lg:justify-end">
                          <nav
                            className="flex items-center gap-2"
                            aria-label="Pagination Navigation"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 0}
                              className="h-10 px-3 gap-1 min-w-[44px]"
                              aria-label="Go to previous page"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span className="hidden sm:inline">Previous</span>
                            </Button>

                            <div className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-muted/50 rounded-md mx-1">
                              <span className="text-muted-foreground">
                                Page
                              </span>
                              <span className="text-foreground">
                                {currentPage + 1}
                              </span>
                              <span className="text-muted-foreground">of</span>
                              <span className="text-foreground">
                                {Math.ceil(totalAddresses / pageSize)}
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={
                                (currentPage + 1) * pageSize >= totalAddresses
                              }
                              className="h-10 px-3 gap-1 min-w-[44px]"
                              aria-label="Go to next page"
                            >
                              <span className="hidden sm:inline">Next</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Add Address Dialog */}
        {showAddAddressDialog && (
          <AddAddressDialog
            open={showAddAddressDialog}
            onOpenChange={setShowAddAddressDialog}
            mode={dialogMode}
            {...(selectedAddress ? { initialData: selectedAddress } : {})}
            addressId={selectedAddressId || undefined}
            branchId={selectedBranchId || undefined}
            onSuccess={async () => {
              // 🔄 Show loading state
              setIsAddingAddress(true);

              try {
                // 🔄 Fetch fresh data from server
                await fetchBranchAddresses(
                  searchTerm,
                  currentPage,
                  false,
                  pageSize
                );
                toast.success(
                  `Address ${dialogMode === "edit" ? "updated" : "added"} successfully!`
                );
              } catch {
                toast.error("Failed to refresh address list");
              } finally {
                setIsAddingAddress(false);
              }
            }}
          />
        )}
      </FullWidthLayout>
    </>
  );
}
