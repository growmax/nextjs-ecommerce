import { SaveCancelToolbar } from "@/components/custom/save-cancel-toolbar";
import SectionCard from "@/components/custom/SectionCard";
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
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CompanyFormInput from "./FormInput";

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
  // new: track dropdown open + sub-fetch state to lazy-load options on click
  const [subLoading, setSubLoading] = useState(false);
  const isFetchingSubRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  // Add a new state to track if the form is ready
  const [isFormReady, setIsFormReady] = useState(false);

  // Store initial values in a ref to preserve them
  const defaultValuesRef = useRef<CompanyFormValues | null>(null);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const {
    formState: { isDirty, dirtyFields },
    reset,
  } = form;

  // Simple form watcher for dirty fields
  useEffect(() => {
    const subscription = form.watch((_value, { type }) => {
      if (type === "change") {
        // Form change tracked
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [form]);

  // Unified cancel handler
  const handleCancel = () => {
    // Reset to initial values
    if (defaultValuesRef.current) {
      form.reset(defaultValuesRef.current);
    } else {
      form.reset(defaultFormValues);
    }
    // Reset image if needed
    setProfileImage(null);
    toast.info("All changes cancelled");
  };

  // Unified save handler
  const handleSave = async () => {
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

      const updatePayload = {
        ...(formData.data as Record<string, unknown>),
        subIndustryId: {
          ...(formData.data.subIndustryId as Record<string, unknown>),
          id:
            parsedSubIndustryId !== undefined
              ? parsedSubIndustryId
              : formData.data.subIndustryId.id,
        },
      } as Partial<CompanyApiResponse["data"]>;

      const response = await CompanyService.updateCompanyProfile(
        Number(companyId),
        updatePayload
      );

      const normalizedData = normalizeCompanyData(response?.data);

      // Update original values after successful save
      defaultValuesRef.current = normalizedData;

      // Reset form state after successful save
      reset(normalizedData);

      toast.success("Changes saved successfully!");
    } catch {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <SectionCard title="Company Detail">
        <Form {...form}>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Image Upload Section */}
            <div className="p-6 md:p-8 flex flex-col items-stretch gap-6">
              <div className="relative w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center overflow-hidden bg-muted/5 hover:bg-muted/10 transition-colors">
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Company Logo"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground font-medium">
                    Click to Upload
                  </span>
                )}
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <CompanyFormInput
                control={form.control}
                name="data.name"
                label="Company Name"
                placeholder="Company Name"
                loading={loading}
              />

              <CompanyFormInput
                control={form.control}
                name="data.website"
                label="Website"
                placeholder="Website URL"
                loading={loading}
              />

              <CompanyFormInput
                control={form.control}
                name="data.addressId.gst"
                label="Tax ID / GST#"
                placeholder="Tax ID or GST#"
                loading={loading}
              />

              <CompanyFormInput
                control={form.control}
                name="data.businessTypeId.name"
                label="Business Type"
                placeholder="Business Type"
                disabled
                loading={loading}
              />

              <CompanyFormInput
                control={form.control}
                name="data.accountTypeId.name"
                label="Account Type"
                placeholder="Account Type"
                disabled
                loading={loading}
              />

              <CompanyFormInput
                control={form.control}
                name="data.currencyId.currencyCode"
                label="Default Currency"
                placeholder="Default Currency"
                disabled
                loading={loading}
              />

              {/* SubIndustry */}
              <FormField
                control={form.control}
                name="subIndustry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SubIndustry</FormLabel>
                    <FormControl>
                      <DropdownMenu onOpenChange={handleSubOpenChange}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            disabled={subLoading || loading}
                          >
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
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuContent
                            className="max-h-80 overflow-y-auto z-50"
                            style={{
                              width: "var(--radix-dropdown-menu-trigger-width)",
                            }}
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
              {/* Industry Description */}
              <div>
                {/* prefer option data when loaded; otherwise fallback to prefilled form values */}
                <FormLabel>
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
                <p className="text-sm text-muted-foreground">
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

      {isDirty && isFormReady && !loading && (
        <SaveCancelToolbar
          show={isDirty}
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
