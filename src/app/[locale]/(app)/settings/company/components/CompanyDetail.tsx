/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import CompanyFormInput from "./FormInput";

const CompanyDetail = () => {
  const form = useForm({
    defaultValues: {
      data: {
        subIndustryId: {
          name: "",
          id: "",
          description: "",
        },
      },
      subIndustry: "", // This will store the ID
      subIndustryOptions: [],
    },
  });
  // watch options from react-hook-form (keeps data in RHF only)
  const subIndustryOptions = form.watch("subIndustryOptions");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  // new: track dropdown open + sub-fetch state to lazy-load options on click
  const [subLoading, setSubLoading] = useState(false);
  const isFetchingSubRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  // Add a new state to track if the form is ready
  const [isFormReady, setIsFormReady] = useState(false);

  // Store initial values in a ref to preserve them
  const defaultValuesRef = useRef<any>(null);

  // Update the fetchBranch function to store initial values
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response = await CompanyService.getBranch();

        const initialData = {
          data: {
            ...response?.data,
            subIndustryId: {
              name: response?.data?.subIndustryId?.name || "",
              id: response?.data?.subIndustryId?.id || "",
              description: response?.data?.subIndustryId?.description || "",
            },
          },
          // Set subIndustry to the ID for proper form handling
          subIndustry: response?.data?.subIndustryId?.id || "",
          subIndustryOptions: [],
        };

        // Store initial values for reset
        defaultValuesRef.current = initialData;

        // Set form values
        // @ts-expect-error - initialData structure is complex
        form.reset(initialData);
        // Set form ready after initial data is loaded
        setIsFormReady(true);
      } catch (_error) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, []); // run once on mount

  // lazy fetch sub-industry options when dropdown is opened (only once)
  const handleSubOpenChange = async (open: boolean) => {
    // prevent opening / fetching while initial page load is still in progress
    if (loading) return;
    if (!open) return;
    const currentOptions = form.getValues("subIndustryOptions") as any[];
    if ((currentOptions?.length ?? 0) > 0) return; // already loaded
    if (isFetchingSubRef.current) return; // already fetching
    isFetchingSubRef.current = true;
    setSubLoading(true);
    try {
      const subIndustryResp = await SubIndustryService.getData();
      // @ts-expect-error - subIndustryResp type is complex
      form.setValue("subIndustryOptions", subIndustryResp);
    } catch (_err) {
      // Error handled silently
    } finally {
      setSubLoading(false);
      isFetchingSubRef.current = false;
    }
  };

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      // @ts-expect-error - FileReader result type
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const {
    formState: { isDirty, dirtyFields },
    handleSubmit,
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
  }, []);

  // Simplified cancel handler
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to discard changes?")) {
      // Reset to initial values
      form.reset(defaultValuesRef.current);
      // Reset image if needed
      setProfileImage(null);
    }
  };

  const onSubmit = async (formData: any) => {
    // Define changedFields outside try block so it's available in catch block
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
          return;
        }
      }

      // API call with full formData (backend might need all fields)
      // @ts-expect-error - updateBranch method exists but not in type definition
      await CompanyService.updateBranch(formData);

      // Reset form state after successful save
      reset(formData);
    } catch (_error) {
      // Error handled silently
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <SectionCard title="Company Detail">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
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
                    ? // @ts-expect-error - subIndustryOptions type issue
                      (subIndustryOptions ?? []).find(
                        (o: any) =>
                          String(o.id) === String(form.watch("subIndustry"))
                      )?.name ||
                      form.getValues("data.subIndustryId.name") ||
                      ""
                    : ""}
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  {form.watch("data.subIndustryId.id")
                    ? // @ts-expect-error - subIndustryOptions type issue
                      (subIndustryOptions ?? []).find(
                        (o: any) =>
                          String(o.id) === String(form.watch("subIndustry"))
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
          show={true}
          onSave={handleSubmit(onSubmit)}
          onCancel={handleCancel}
          isLoading={isSaving}
          saveText="Save Changes"
          cancelText="Cancel"
          className="fixed top-4 right-4 left-0 z-50"
          data-save-cancel-toolbar="true"
        />
      )}
    </div>
  );
};

export default CompanyDetail;
