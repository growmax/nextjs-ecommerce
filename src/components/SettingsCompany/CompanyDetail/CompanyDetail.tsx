import { SaveCancelToolbar } from "@/components/custom/save-cancel-toolbar";
import SectionCard from "@/components/custom/SectionCard";
import { ImageUpload } from "@/components/forms/ImageUpload/ImageUpload";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { CompanyService, SubIndustryService } from "@/lib/api";
import type { CompanyApiResponse } from "@/lib/api/services/CompanyService";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CompanyFormInput from "../../forms/FormInput/FormInput";
import { LabelWithAsterisk } from "../DialogBox/AddressDialogBox";

type SubIndustryOption = {
  id: string | number;
  name?: string;
  description?: string;
  industryId?: { name?: string };
  [key: string]: unknown;
};

type SubIndustryFormValue = {
  name: string;
  id: string | number;
  description: string;
  [key: string]: unknown;
};

interface CompanyFormValues {
  data: {
    subIndustryId: SubIndustryFormValue;
    [key: string]: unknown;
  };
  subIndustry: string;
  subIndustryOptions: SubIndustryOption[];
}

const normalizeCompanyData = (
  response?: CompanyApiResponse["data"]
): CompanyFormValues => {
  const subIndustry = response?.subIndustryId;

  const data: CompanyFormValues["data"] = {
    ...(response ? { ...response, subIndustryId: undefined } : {}),
    subIndustryId: {
      ...(subIndustry ?? {}),
      name: subIndustry?.name ?? "",
      id:
        subIndustry?.id !== undefined && subIndustry?.id !== null
          ? subIndustry.id
          : "",
      description: subIndustry?.description ?? "",
    },
  };

  return {
    data,
    subIndustry:
      subIndustry?.id !== undefined && subIndustry?.id !== null
        ? String(subIndustry.id)
        : "",
    subIndustryOptions: [],
  };
};

const CompanyDetail = () => {
  const defaultFormValues: CompanyFormValues = {
    data: {
      subIndustryId: {
        name: "",
        id: "",
        description: "",
      },
    },
    subIndustry: "",
    subIndustryOptions: [],
  };

  const form = useForm<CompanyFormValues>({
    defaultValues: defaultFormValues,
  });
  // watch options from react-hook-form (keeps data in RHF only)
  const subIndustryOptions = form.watch("subIndustryOptions");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // Store the uploaded logo URL separately for the logo parameter
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  // new: track dropdown open + sub-fetch state to lazy-load options on click
  const [subLoading, setSubLoading] = useState(false);
  const isFetchingSubRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  // Add a new state to track if the form is ready
  const [isFormReady, setIsFormReady] = useState(false);
  
  // Get company info for folderName
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [sub1, setSub1] = useState<string | null>(null);
  
  useEffect(() => {
    const token = AuthStorage.getAccessToken();
    if (token) {
      const jwtService = JWTService.getInstance();
      const payload = jwtService.decodeToken(token);
      setCompanyId(payload?.companyId || null);
      setSub1(payload?.sub || payload?.userId?.toString() || null);
    }
  }, []);
  
  // Validation errors type
  type ValidationErrors = {
    name?: string;
    taxId?: string;
    businessType?: string;
    accountType?: string;
    currency?: string;
    subIndustry?: string;
  };

  // Validation errors state
  const [, setValidationErrors] = useState<ValidationErrors>({});

  // Store initial values in a ref to preserve them
  const defaultValuesRef = useRef<CompanyFormValues | null>(null);
  // Store initial logo URL to track changes
  const initialLogoRef = useRef<string | null>(null);

  // Update the fetchBranch function to store initial values
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response = await CompanyService.getBranch();

        const normalizedData = normalizeCompanyData(response?.data);

        // Store initial values for reset
        defaultValuesRef.current = normalizedData;

        // Set form values
        form.reset(normalizedData);
        
        // Set initial logo image if available
        if (response?.data?.logo) {
          const logoUrl = response.data.logo;
          setProfileImage(logoUrl);
          initialLogoRef.current = logoUrl;
        } else {
          initialLogoRef.current = null;
        }
        
        // Set form ready after initial data is loaded
        setIsFormReady(true);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [form]); // run once on mount, depends on form

  // lazy fetch sub-industry options when dropdown is opened (only once)
  const handleSubOpenChange = async (open: boolean) => {
    // prevent opening / fetching while initial page load is still in progress
    if (loading) return;
    if (!open) return;
    const currentOptions = form.getValues("subIndustryOptions");
    if ((currentOptions?.length ?? 0) > 0) return; // already loaded
    if (isFetchingSubRef.current) return; // already fetching
    isFetchingSubRef.current = true;
    setSubLoading(true);
    try {
      const subIndustryResp = await SubIndustryService.getData();
      form.setValue(
        "subIndustryOptions",
        subIndustryResp as SubIndustryOption[]
      );
    } catch {
      // Error handled silently
    } finally {
      setSubLoading(false);
      isFetchingSubRef.current = false;
    }
  };

  // Handle image upload - store both preview and S3 URL
  const handleImageChange = (image: string) => {
    setProfileImage(image);
    
    // Store the merged URL if it's a full S3 URL (not a blob URL)
    if (image && !image.startsWith('blob:')) {
      setUploadedLogoUrl(image);
    }
  };

  // Check if image has changed from initial value
  const hasImageChanged = profileImage !== initialLogoRef.current;

  const {
    formState: { isDirty, dirtyFields },
    reset,
  } = form;

  // Simple form watcher for dirty fields - clear validation errors when fields change
  useEffect(() => {
    const subscription = form.watch((_value, { name, type }) => {
      if (type === "change" && name) {
        // Clear validation error for the changed field
        if (name === "data.name") {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.name;
            return newErrors;
          });
          form.clearErrors("data.name");
        } else if (name === "data.taxDetailsId.pan") {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.taxId;
            return newErrors;
          });
          form.clearErrors("data.taxDetailsId.pan");
        } else if (name === "data.businessTypeId.name") {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.businessType;
            return newErrors;
          });
          form.clearErrors("data.businessTypeId.name");
        } else if (name === "data.accountTypeId.name") {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.accountType;
            return newErrors;
          });
          form.clearErrors("data.accountTypeId.name");
        } else if (name === "data.currencyId.currencyCode") {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.currency;
            return newErrors;
          });
          form.clearErrors("data.currencyId.currencyCode");
        } else if (name === "subIndustry") {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.subIndustry;
            return newErrors;
          });
          form.clearErrors("subIndustry");
        }
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [form]);

  // Validation helper
  const validateCompany = (): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {};
    const formData = form.getValues();

    // Clear previous errors
    form.clearErrors();

    // Validate Company Name (required)
    if (!formData.data?.name || (formData.data.name as string).trim() === "") {
      errors.name = "Company Name is required";
      form.setError("data.name", {
        type: "validate",
        message: "Company Name is required",
      });
    }

    // Validate Tax ID / GST# (required)
    const taxDetailsId = formData.data?.taxDetailsId as { pan?: string } | undefined;
    if (!taxDetailsId?.pan || taxDetailsId.pan.trim() === "") {
      errors.taxId = "Tax ID / GST# is required";
      form.setError("data.taxDetailsId.pan", {
        type: "validate",
        message: "Tax ID / GST# is required",
      });
    }

    // Validate Business Type (required)
    const businessTypeId = formData.data?.businessTypeId as { name?: string } | undefined;
    if (!businessTypeId?.name || businessTypeId.name.trim() === "") {
      errors.businessType = "Business Type is required";
      form.setError("data.businessTypeId.name", {
        type: "validate",
        message: "Business Type is required",
      });
    }

    // Validate Account Type (required)
    const accountTypeId = formData.data?.accountTypeId as { name?: string } | undefined;
    if (!accountTypeId?.name || accountTypeId.name.trim() === "") {
      errors.accountType = "Account Type is required";
      form.setError("data.accountTypeId.name", {
        type: "validate",
        message: "Account Type is required",
      });
    }

    // Validate Default Currency (required)
    const currencyId = formData.data?.currencyId as { currencyCode?: string } | undefined;
    if (!currencyId?.currencyCode || currencyId.currencyCode.trim() === "") {
      errors.currency = "Default Currency is required";
      form.setError("data.currencyId.currencyCode", {
        type: "validate",
        message: "Default Currency is required",
      });
    }

    // Validate SubIndustry (required)
    if (!formData.subIndustry || formData.subIndustry.trim() === "") {
      errors.subIndustry = "SubIndustry is required";
      form.setError("subIndustry", {
        type: "validate",
        message: "SubIndustry is required",
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  // Unified cancel handler
  const handleCancel = () => {
    // Reset to initial values
    if (defaultValuesRef.current) {
      form.reset(defaultValuesRef.current);
      // Reset image to original logo if available
      const originalLogo = initialLogoRef.current;
      if (originalLogo) {
        setProfileImage(originalLogo);
      } else {
        setProfileImage(null);
      }
    } else {
      form.reset(defaultFormValues);
      setProfileImage(null);
    }
    // Clear uploaded logo URL
    setUploadedLogoUrl(null);
    // Clear validation errors
    setValidationErrors({});
    toast.info("All changes cancelled", {
      position: "top-right",
    });
  };

  // Unified save handler
  const handleSave = async () => {
    // Validate company data first
    const validation = validateCompany();
    if (!validation.isValid) {
      // Set validation errors for display
      setValidationErrors(validation.errors);
      setIsSaving(false);
      return;
    }
    
    // Clear validation errors if validation passes
    setValidationErrors({});

    // Define changedFields outside try block so it's available in catch block
    const formData = form.getValues();
    const changedFields = Object.keys(dirtyFields).reduce((acc: any, key) => {
      const value = key
        .split(".")
        .reduce((obj: any, k: any) => obj?.[k], formData);
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    try {
      setIsSaving(true);

      // Validate selected subIndustry if it was changed
      let selectedSubIndustry: any = null;
      if (changedFields["subIndustry"]) {
        const options = form.getValues("subIndustryOptions") as Array<any>;
        const found = options.find(
          (o: any) => String(o.id) === String(changedFields["subIndustry"])
        );

        if (!found) {
          form.setError("subIndustry", {
            type: "validate",
            message: "Please select a valid sub-industry.",
          });
          toast.error("Please select a valid sub-industry.");
          return;
        }
        selectedSubIndustry = found;
      } else {
        // If not changed, find the current selected option
        const options = form.getValues("subIndustryOptions") as Array<any>;
        const currentSubIndustryId = formData.subIndustry || formData.data.subIndustryId.id;
        if (currentSubIndustryId) {
          selectedSubIndustry = options.find(
            (o: any) => String(o.id) === String(currentSubIndustryId)
          );
        }
      }

      // API call with full formData (backend might need all fields)
      const companyId = (formData.data?.id ?? formData.data?.companyId) as
        | number
        | undefined;

      if (!companyId) {
        throw new Error("Missing company identifier");
      }

      const subIndustryIdValue =
        formData.subIndustry || formData.data.subIndustryId.id;
      const parsedSubIndustryId =
        subIndustryIdValue !== "" && subIndustryIdValue !== undefined
          ? Number(subIndustryIdValue)
          : undefined;

      // Build subIndustryId payload with complete structure from selected option
      let subIndustryPayload: any = {};

      // If we have a selected subIndustry option, use its complete structure
      if (selectedSubIndustry) {
        subIndustryPayload = {
          description: selectedSubIndustry.description || "",
          id: selectedSubIndustry.id,
          industryId: selectedSubIndustry.industryId
            ? {
                id: selectedSubIndustry.industryId.id,
                name: selectedSubIndustry.industryId.name,
                ...(selectedSubIndustry.industryId.tenantId !== undefined && {
                  tenantId: selectedSubIndustry.industryId.tenantId,
                }),
              }
            : undefined,
          name: selectedSubIndustry.name || "",
          ...(selectedSubIndustry.tenantId !== undefined && {
            tenantId: selectedSubIndustry.tenantId,
          }),
        };
      } else {
        // Fallback to existing form data if no option found
        subIndustryPayload = {
          ...(formData.data.subIndustryId as Record<string, unknown>),
          id:
            parsedSubIndustryId !== undefined
              ? parsedSubIndustryId
              : formData.data.subIndustryId.id,
        };
      }

      const updatePayload = {
        ...(formData.data as Record<string, unknown>),
        subIndustryId: subIndustryPayload,
      } as Partial<CompanyApiResponse["data"]>;

      // Add logo parameter if uploaded logo URL is available
      if (uploadedLogoUrl) {
        updatePayload.logo = uploadedLogoUrl;
      }

      const response = await CompanyService.updateCompanyProfile(
        Number(companyId),
        updatePayload
      );

      const normalizedData = normalizeCompanyData(response?.data);

      // Update original values after successful save
      defaultValuesRef.current = normalizedData;

      // Reset form state after successful save
      reset(normalizedData);
      
      // Update profileImage with the saved logo from response
      const logo = (normalizedData.data as any)?.logo;
      if (logo && typeof logo === 'string') {
        setProfileImage(logo);
        initialLogoRef.current = logo; // Update initial logo reference
      }
      
      // Clear uploaded logo URL after successful save
      setUploadedLogoUrl(null);
      
      // Clear validation errors on successful save
      setValidationErrors({});
      form.clearErrors();

      toast.success("Changes saved successfully!");
    } catch {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <SectionCard title="Company Detail" className="py-2.5">
        <Form {...form}>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-6 lg:gap-8 items-start">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center md:items-start justify-start w-full mb-6 sm:mb-8 md:mb-0">
              <div className="w-full max-w-[140px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px] mx-auto md:mx-0">
                <ImageUpload
                  currentImage={profileImage || null}
                  onImageChange={handleImageChange}
                  alt="Company Logo"
                  size="lg"
                  shape="square"
                  className="w-full"
                  disabled={loading}
                  folderName={
                    companyId && sub1
                      ? `app_assets/company_images/${companyId}/logo/${sub1}`
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7 w-full">
              {/* Company Name */}
              <div className="w-full min-w-0">
                <CompanyFormInput
                  control={form.control}
                  name="data.name"
                  label={<LabelWithAsterisk label="Company Name" required />}
                  placeholder="Company Name"
                  loading={loading}
                />
              </div>

              {/* Website */}
              <div className="w-full min-w-0">
                <CompanyFormInput
                  control={form.control}
                  name="data.website"
                  label={<LabelWithAsterisk label="Website" />}
                  placeholder="Website URL"
                  loading={loading}
                />
              </div>

              {/* Tax ID / GST# */}
              <div className="w-full min-w-0">
                <CompanyFormInput
                  control={form.control}
                  name="data.taxDetailsId.pan"
                  label={<LabelWithAsterisk label="Tax ID / GST#" />}
                  placeholder="Tax ID or GST#"
                  loading={loading}
                />
              </div>

              {/* Business Type */}
              <div className="w-full min-w-0">
                <CompanyFormInput
                  control={form.control}
                  name="data.businessTypeId.name"
                  label={<LabelWithAsterisk label="Business Type" />}
                  placeholder="Business Type"
                  loading={loading}
                />
              </div>

              {/* Account Type */}
              <div className="w-full min-w-0">
                <CompanyFormInput
                  control={form.control}
                  name="data.accountTypeId.name"
                  label={<LabelWithAsterisk label="Account Type" />}
                  placeholder="Account Type"
                  loading={loading}
                />
              </div>

              {/* Default Currency */}
              <div className="w-full min-w-0">
                <CompanyFormInput
                  control={form.control}
                  name="data.currencyId.currencyCode"
                  label={<LabelWithAsterisk label="Default Currency" />}
                  placeholder="Default Currency"
                  loading={loading}
                />
              </div>

              {/* SubIndustry */}
              <div className="w-full min-w-0">
                <FormField
                control={form.control}
                name="subIndustry"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium">
                      <LabelWithAsterisk label="SubIndustry" required />
                    </FormLabel>
                    <FormControl>
                      <DropdownMenu onOpenChange={handleSubOpenChange}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal h-9"
                            disabled={subLoading || loading}
                          >
                            <span className="truncate">
                              {loading
                                ? "Loading company..."
                                : subLoading
                                  ? "Loading..."
                                  : field.value
                                    ? // First try to find from loaded options
                                      ((subIndustryOptions as any) ?? []).find(
                                        (o: any) =>
                                          String(o.id) === String(field.value)
                                      )?.name ||
                                      // Fall back to initial value if options not loaded
                                      form.getValues("data.subIndustryId.name")
                                    : form.getValues("data.subIndustryId.name") ||
                                      "Select SubIndustry"}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuContent
                            className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-80 overflow-y-auto z-50"
                            align="start"
                          >
                            {subLoading ? (
                              <div className="p-3 text-sm">
                                Loading sub-industries...
                              </div>
                            ) : (subIndustryOptions ?? []).length === 0 ? (
                              <div className="p-3 text-sm text-muted-foreground">
                                No sub-industry options
                              </div>
                            ) : (
                              Object.entries(
                                (subIndustryOptions ?? []).reduce(
                                  (acc: any, opt: any) => {
                                    const group =
                                      opt.industryId?.name || "Other";
                                    if (!acc[group]) acc[group] = [];
                                    acc[group].push(opt);
                                    return acc;
                                  },
                                  {}
                                )
                              ).map(([groupName, items]: [string, any]) => (
                                <React.Fragment key={groupName}>
                                  <DropdownMenuLabel className="font-semibold">
                                    {groupName}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuRadioGroup
                                    value={String(field.value ?? "")}
                                    onValueChange={field.onChange}
                                  >
                                    {items.map((opt: any) => (
                                      <DropdownMenuRadioItem
                                        key={opt.id}
                                        value={String(opt.id)}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-light text-sm">
                                            {opt.name}
                                          </span>
                                        </div>
                                      </DropdownMenuRadioItem>
                                    ))}
                                  </DropdownMenuRadioGroup>
                                </React.Fragment>
                              ))
                            )}
                          </DropdownMenuContent>
                        </DropdownMenuPortal>
                      </DropdownMenu>
                    </FormControl>
                  </FormItem>
                )}
              />
              </div>

              {/* Industry Description */}
              <div className="w-full min-w-0">
                {/* prefer option data when loaded; otherwise fallback to prefilled form values */}
                <FormLabel className="text-xs font-medium">
                  Industry Description :{" "}
                  {form.watch("data.subIndustryId.id")
                    ? (
                        (subIndustryOptions ?? []).find(
                          (o: any) =>
                            String(o.id) === String(form.watch("subIndustry"))
                        ) as any
                      )?.name ||
                      form.getValues("data.subIndustryId.name") ||
                      ""
                    : ""}
                </FormLabel>
                <p className="text-xs text-muted-foreground mt-1">
                  {form.watch("data.subIndustryId.id")
                    ? (
                        (subIndustryOptions ?? []).find(
                          (o: any) =>
                            String(o.id) === String(form.watch("subIndustry"))
                        ) as any
                      )?.description ||
                      form.getValues("data.subIndustryId.description") ||
                      "No description available"
                    : "Select a sub-industry to view description"}
                </p>
              </div>
            </div>
          </form>
        </Form>
      </SectionCard>

      {(isDirty || hasImageChanged) && isFormReady && !loading && (
        <SaveCancelToolbar
          show={isDirty || hasImageChanged}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isSaving}
          saveText="Save Changes"
          cancelText="Cancel"
          className="bottom-4 left-0 right-0 md:bottom-auto md:top-[69px] md:left-0 lg:left-64 z-50"
        />
      )}
    </div>
  );
};

export default CompanyDetail;
