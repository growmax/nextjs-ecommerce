"use client";

import FormTextarea from "@/components/forms/FormTextarea/FormTextarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/use-media-query";
import CompanyService, {
  AddressData,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "@/lib/api/services/CompanyService";
import LocationService from "@/lib/api/services/LocationService/LocationService";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import type { BaseDialogProps } from "@/types/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormDropdown } from "../../forms/FormDropdown/FormDropdown";
import FormInput from "../../forms/FormInput/FormInput";

export interface CompanyDialogBoxProps
  extends Omit<BaseDialogProps, "title" | "description"> {
  mode?: "create" | "edit";
  initialData?: AddressFormData | null;
  branchId?: string | number | null;
  onSuccess?: () => void;
}

// Zod validation schema factory function with security sanitization
const createAddressFormSchema = (t: (key: string) => string) =>
  z.object({
    id: z.number().optional(),
    companyName: z.string().trim().max(100).optional(),
    branchName: z
      .string()
      .trim()
      .min(1, { message: t("branchNameRequired") || "Branch name is required" })
      .max(100, { message: t("branchNameTooLong") || "Branch name is too long" })
      .regex(/^[a-zA-Z0-9\s\-_.,&()]+$/, { message: t("invalidBranchName") || "Invalid characters in branch name" }),
    addressLine: z
      .string()
      .trim()
      .min(1, { message: t("addressLineRequired") || "Address is required" })
      .max(500, { message: t("addressLineTooLong") || "Address is too long" }),
    locality: z.string().trim().max(100).optional(),
    country: z
      .string()
      .trim()
      .min(1, { message: t("countryRequired") || "Country is required" }),
    state: z
      .string()
      .trim()
      .min(1, { message: t("stateRequired") || "State is required" }),
    district: z.string().trim().max(100).optional(),
    pinCode: z
      .string()
      .trim()
      .min(1, { message: t("pinCodeRequired") || "Postal code is required" })
      .max(10, { message: t("pinCodeTooLong") || "Postal code is too long" })
      .regex(/^[a-zA-Z0-9\s\-]+$/, { message: t("invalidPinCode") || "Invalid postal code format" }),
    city: z.string().trim().max(100).optional(),
    lattitude: z
      .string()
      .trim()
      .regex(/^-?\d*\.?\d*$/, { message: t("invalidLatitude") || "Invalid latitude" })
      .optional()
      .or(z.literal("")),
    longitude: z
      .string()
      .trim()
      .regex(/^-?\d*\.?\d*$/, { message: t("invalidLongitude") || "Invalid longitude" })
      .optional()
      .or(z.literal("")),
    isBilling: z.boolean(),
    isShipping: z.boolean(),
    gst: z
      .string()
      .trim()
      .max(20)
      .regex(/^[a-zA-Z0-9]*$/, { message: t("invalidGst") || "Invalid GST format" })
      .optional()
      .or(z.literal("")),
    contactName: z
      .string()
      .trim()
      .max(100)
      .regex(/^[a-zA-Z\s\-.]*$/, { message: t("invalidContactName") || "Invalid contact name" })
      .optional()
      .or(z.literal("")),
    contactNumber: z
      .string()
      .trim()
      .regex(/^[\d+\-\s()]*$/, { message: t("invalidContactNumber") || "Invalid phone number" })
      .max(20)
      .optional()
      .or(z.literal("")),
  });

type AddressFormData = z.infer<ReturnType<typeof createAddressFormSchema>>;

export const LabelWithAsterisk = ({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) => (
  <span>
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </span>
);

const CompanyDialogBox = ({
  open,
  onOpenChange,
  mode = "create",
  initialData = null,
  branchId = null,
  onSuccess,
}: CompanyDialogBoxProps) => {
  const t = useTranslations("companySettings");
  const tValidation = useTranslations("validation");
  const addressFormSchema = useMemo(
    () => createAddressFormSchema(tValidation),
    [tValidation]
  );
  const emptyDefaults = useMemo<AddressFormData>(
    () => ({
      // Address Information
      branchName: "",
      addressLine: "",
      locality: "",
      country: "",
      state: "",
      district: "",
      pinCode: "",
      city: "",
      lattitude: "",
      longitude: "",

      // Address Type
      isBilling: true,
      isShipping: true,

      // Tax & Contact
      gst: "",
      contactName: "",
      contactNumber: "",
    }),
    []
  );

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues:
      mode === "create"
        ? emptyDefaults
        : (initialData as AddressFormData) || emptyDefaults,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [states, setStates] = useState<Array<{ value: string; label: string }>>(
    []
  );
  const [statesLoading, setStatesLoading] = useState(false);
  const [districts, setDistricts] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  // Track if initial data has been loaded to prevent duplicate API calls
  const hasLoadedInitialData = useRef(false);
  const isLoadingRef = useRef({
    countries: false,
    states: false,
    districts: false,
  });

  // Helper to normalize API response data to dropdown options
  const toDropdownOption = useCallback((item: any) => {
    if (item && typeof item === "object") {
      return {
        value: String(item.id ?? ""),
        label: String(item.name ?? ""),
      };
    }
    return { value: "", label: "" };
  }, []);

  const loadCountries = useCallback(async () => {
    if (isLoadingRef.current.countries) return; // Prevent duplicate calls

    try {
      isLoadingRef.current.countries = true;
      setCountriesLoading(true);
      const resp = await LocationService.getAllCountries();
      const list = Array.isArray(resp?.data)
        ? resp.data.map(toDropdownOption).filter(o => o.value)
        : [];
      setCountries(list);
    } catch {
      setCountries([]);
    } finally {
      setCountriesLoading(false);
      isLoadingRef.current.countries = false;
    }
  }, [toDropdownOption]);

  const loadStates = useCallback(
    async (countryValue?: string) => {
      if (isLoadingRef.current.states) return; // Prevent duplicate calls

      try {
        isLoadingRef.current.states = true;
        setStatesLoading(true);

        // Get country ID (handles both numeric IDs and names)
        let countryId: number | undefined;
        if (countryValue) {
          if (/^\d+$/.test(countryValue)) {
            countryId = Number(countryValue);
          } else {
            // Use functional update to access current countries without dependency
            await new Promise<void>(resolve => {
              setCountries(current => {
                const found = current.find(c => c.label === countryValue);
                if (found) countryId = Number(found.value);
                resolve();
                return current;
              });
            });
          }
        }

        // Load states
        const resp = countryId
          ? await LocationService.getStatesByCountry(countryId)
          : await LocationService.getAllStates();

        const raw = Array.isArray(resp?.data) ? resp.data : [];
        const filtered = countryId
          ? raw.filter((state: any) => state.countryId === countryId)
          : raw;
        const list = filtered.map(toDropdownOption).filter(o => o.value);
        setStates(list);
      } catch {
        setStates([]);
      } finally {
        setStatesLoading(false);
        isLoadingRef.current.states = false;
      }
    },
    [toDropdownOption]
  );

  const loadDistricts = useCallback(
    async (stateValue?: string) => {
      if (isLoadingRef.current.districts) return; // Prevent duplicate calls

      try {
        isLoadingRef.current.districts = true;
        setDistrictsLoading(true);

        // Get state ID (handles both numeric IDs and names)
        let stateId: number | undefined;
        if (stateValue) {
          // Check if it's already a numeric string (ID)
          if (/^\d+$/.test(String(stateValue).trim())) {
            stateId = Number(stateValue);
          } else {
            // It might be a state name, try to find it in the states list
            // Use functional update to access current states without dependency
            await new Promise<void>(resolve => {
              setStates(current => {
                const found = current.find(
                  s => s.label === stateValue || s.value === String(stateValue)
                );
                if (found) {
                  stateId = Number(found.value);
                }
                resolve();
                return current;
              });
            });
          }
        }

        // If we don't have a valid stateId, clear districts and return
        if (!stateId || isNaN(stateId)) {
          console.warn(
            "Invalid stateId for loading districts:",
            stateValue,
            stateId
          );
          setDistricts([]);
          return;
        }

        // Load districts - getDistrictsByState already filters by stateId
        const resp = await LocationService.getDistrictsByState(stateId);

        // Ensure we have valid response data
        if (!resp || !Array.isArray(resp.data)) {
          console.warn("Invalid districts response:", resp);
          setDistricts([]);
          return;
        }

        // Map to dropdown options - getDistrictsByState already filtered by stateId
        const list = resp.data
          .map(toDropdownOption)
          .filter(o => o.value && o.label);

        console.log(
          `Loaded ${list.length} districts for stateId ${stateId}`,
          list
        );
        setDistricts(list);
      } catch (error) {
        console.error("Error loading districts:", error, { stateValue });
        setDistricts([]);
      } finally {
        setDistrictsLoading(false);
        isLoadingRef.current.districts = false;
      }
    },
    [toDropdownOption]
  );

  // Helper to get label from value (ID to name conversion)
  const getLabelFromValue = useCallback(
    (
      value: string,
      options: Array<{ value: string; label: string }>
    ): string => {
      return options.find(opt => opt.value === value)?.label || value;
    },
    []
  );

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      // Convert IDs to names for API
      const countryName = getLabelFromValue(data.country, countries);
      const stateName = getLabelFromValue(data.state, states);
      const districtName = getLabelFromValue(data.district || "", districts);

      // map form data to AddressData shape expected by API
      const mapToAddressData = (d: AddressFormData): AddressData => {
        // preserve id when present (edit mode)
        const maybeId = (d as AddressFormData).id;
        // parse numeric lat/long if provided as string
        const lattitude =
          d.lattitude === undefined || d.lattitude === ""
            ? undefined
            : Number(d.lattitude as unknown);
        const longitude =
          d.longitude === undefined || d.longitude === ""
            ? undefined
            : Number(d.longitude as unknown);

        const result: AddressData = {
          gst: d.gst || "",
          branchName: d.branchName || "",
          addressLine: d.addressLine || "",
          locality: d.locality || "",
          city: d.city || "",
          district: districtName || "",
          latitude: lattitude ?? 0,
          longitude: longitude ?? 0,
          lattitude: String(lattitude ?? 0),
          pinCodeId: d.pinCode || "",
          state: stateName || "",
          country: countryName || "",
          countryCode: "",
          isShipping: Boolean(d.isShipping),
          isBilling: Boolean(d.isBilling),
          wareHouse: false,
          primaryContact: d.contactName || "",
          mobileNo: d.contactNumber || "",
          phone: "",
          nationalMobileNum: "",
          email: null,
          billToCode: null,
          shipToCode: null,
          soldToCode: null,
          isCustAddress: false,
          regAddress: false,
          locationUrl: null,
        };

        if (maybeId !== undefined) {
          result.id = maybeId;
        }

        return result;
      };
      const addressPayload: AddressData = mapToAddressData(data);

      // Try to resolve userId/companyId from a valid token before sending payload
      let resolvedUserId: number | undefined;
      let resolvedCompanyId: number | undefined;
      try {
        const token = await AuthStorage.getValidAccessToken();
        if (token) {
          const payload: any = JWTService.getInstance().decodeToken(token);
          resolvedUserId = payload?.userId ?? payload?.id ?? payload?.sub;
          resolvedCompanyId =
            payload?.companyId ?? payload?.company?.id ?? payload?.companyId;
          if (resolvedUserId !== undefined)
            resolvedUserId = Number(resolvedUserId);
          if (resolvedCompanyId !== undefined)
            resolvedCompanyId = Number(resolvedCompanyId);
        }
      } catch {
        // ignore - we'll rely on server-side resolution if available
      }

      if (mode === "create") {
        const payload: CreateBranchRequest = {
          addressId: addressPayload,
          removeBranchWareHouseId: [],
          removeBusinessUnits: [],
          wareHouses: [],
          businessUnits: [],
          zoneId: null,
          branch: { addressId: addressPayload },
          removeWareHouse: [],
          companyId: resolvedCompanyId as number,
          userId: resolvedUserId as number,
          isUpdate: false,
        };

        // If we couldn't resolve user/company ids locally, stop early to avoid sending a bad request
        if (resolvedUserId === undefined || resolvedCompanyId === undefined) {
          throw new Error(t("missingAuthCannotCreateBranch"));
        }

        // attach resolved ids to the payload explicitly
        payload.companyId = resolvedCompanyId as number;
        payload.userId = resolvedUserId as number;

        await CompanyService.createBranchAddress(payload);
      } else {
        // update
        const addrWithId: AddressData & { id?: number } = { ...addressPayload };
        if (!addrWithId.id) {
          const maybeInit = initialData as unknown as {
            addressId?: { id?: number };
          } | null;
          const fallbackId = maybeInit?.addressId?.id;
          if (fallbackId !== undefined && fallbackId !== null) {
            addrWithId.id = Number(fallbackId);
          }
        }

        if (!addrWithId.id && branchId) {
          addrWithId.id = Number(branchId);
        }

        if (!addrWithId.id) {
          setIsSubmitting(false);
          throw new Error(t("missingAddressIdForUpdate"));
        }

        const payload: UpdateBranchRequest = {
          addressId: addrWithId,
          removeBranchWareHouseId: [],
          removeBusinessUnits: [],
          wareHouses: [],
          businessUnits: [],
          zoneId: null,
          branch: { addressId: addrWithId },
          removeWareHouse: [],
          companyId: undefined as unknown as number,
          userId: undefined as unknown as number,
          isUpdate: true,
          id: Number(branchId || 0),
          branchSequenceNumber: null,
          code: null,
          inSequenceNumber: null,
          name: addrWithId.branchName || "",
          poSequenceNumber: null,
          salesBranchCode: null,
          salesOrgId: null,
          soSequenceNumber: null,
          toSequenceNumber: null,
        };

        if (resolvedUserId === undefined || resolvedCompanyId === undefined) {
          throw new Error(t("missingAuthCannotUpdateBranch"));
        }

        // attach resolved ids to the payload explicitly
        payload.companyId = resolvedCompanyId as number;
        payload.userId = resolvedUserId as number;
        await CompanyService.updateBranchAddress(payload);
      }

      // Call onSuccess callback to refresh parent data only on success
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (!open) {
      // Reset the flag when dialog closes
      hasLoadedInitialData.current = false;
      return;
    }

    if (open && !hasLoadedInitialData.current) {
      // Load countries only once when dialog opens
      void loadCountries();

      if (mode === "edit" && initialData) {
        // Reset form with initial data for edit mode
        form.reset(initialData as AddressFormData);
        // Load states and districts if we have country/state in initial data
        if (initialData.country) {
          void loadStates(initialData.country as string);
        }
        if (initialData.state) {
          void loadDistricts(initialData.state as string);
        }
      } else if (mode === "create") {
        // create mode - reset to defaults
        form.reset(emptyDefaults);
        setStates([]);
        setDistricts([]);
      }

      // Mark as loaded to prevent duplicate calls
      hasLoadedInitialData.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, open, initialData]);

  // Helper to set form value from name to ID when options load
  const setFormValueFromName = useCallback(
    (
      fieldName: "country" | "state" | "district",
      namingValue: string | undefined,
      options: Array<{ value: string; label: string }>
    ) => {
      if (!namingValue || options.length === 0) return;

      const id = options.find(opt => opt.label === namingValue)?.value;
      if (id && id !== form.getValues(fieldName)) {
        form.setValue(fieldName, id);
      }
    },
    [form]
  );

  // Single effect to match names to IDs when dropdown options load (edit mode only)
  useEffect(() => {
    if (mode !== "edit" || !initialData || !open) return;

    if (countries.length > 0) {
      setFormValueFromName("country", initialData.country, countries);
    }
    if (states.length > 0) {
      setFormValueFromName("state", initialData.state, states);
    }
    if (districts.length > 0) {
      setFormValueFromName("district", initialData.district, districts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, countries.length, states.length, districts.length, open]);

  // targeted watchers: watch country and state separately to load children and reset dependents
  const watchedCountry = form.watch("country");
  useEffect(() => {
    if (!watchedCountry) {
      // no country selected -> clear child lists/values
      setStates([]);
      setDistricts([]);
      form.setValue("state", "");
      form.setValue("district", "");
      return;
    }

    // Debounce to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      form.setValue("state", "");
      form.setValue("district", "");
      void loadStates(watchedCountry);
      setDistricts([]);
    }, 100);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCountry]);

  const watchedState = form.watch("state");
  useEffect(() => {
    if (!watchedState) {
      setDistricts([]);
      form.setValue("district", "");
      return;
    }

    // Debounce to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      form.setValue("district", "");
      void loadDistricts(watchedState);
    }, 100);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedState]);

  const handleCancel = () => {
    form.reset(emptyDefaults);
    setStates([]);
    setDistricts([]);
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Clear all state when closing
      form.reset(emptyDefaults);
      setStates([]);
      setDistricts([]);
    }
    onOpenChange(isOpen);
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full h-full sm:max-w-2xl sm:max-h-[90vh] sm:rounded-lg p-0 flex flex-col border border-black/10 overflow-hidden">
          {/* Fixed Header */}
          <div className="px-4 sm:px-6 pt-6 pb-4 border-b shrink-0">
            <DialogHeader>
              <DialogTitle>
                {mode === "create" ? t("createAddress") : t("editAddress")}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
            <Form {...form}>
              <form
                id="address-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Branch & Address Fields */}
                <FormInput
                  control={form.control}
                  name="branchName"
                  label={<LabelWithAsterisk label={t("branchName")} required />}
                  placeholder={t("enterBranchName")}
                  required
                />
                <FormTextarea
                  control={form.control}
                  name="addressLine"
                  label={<LabelWithAsterisk label={t("address")} required />}
                  placeholder={t("enterAddress")}
                  required
                />
                <FormInput
                  control={form.control}
                  name="locality"
                  label={t("locality")}
                  placeholder={t("enterLocality")}
                />

                <Separator />

                {/* Location Section */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold">{t("location")}</p>

                {/* Country & State Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormDropdown
                    control={form.control}
                    name="country"
                    label={<LabelWithAsterisk label={t("country")} required />}
                    placeholder={
                      countriesLoading
                        ? t("loadingCountries")
                        : t("selectCountry")
                    }
                    options={countries.length > 0 ? countries : []}
                  />

                  <FormDropdown
                    control={form.control}
                    name="state"
                    label={<LabelWithAsterisk label={t("state")} required />}
                    placeholder={
                      statesLoading
                        ? t("loadingStates")
                        : t("selectState")
                    }
                    options={states.length > 0 ? states : []}
                  />
                </div>

                  {/* District, PostalCode Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormDropdown
                      control={form.control}
                      name="district"
                      label={t("district")}
                      placeholder={
                        districtsLoading
                          ? t("loadingDistricts")
                          : t("selectDistrict")
                      }
                      options={districts.length > 0 ? districts : []}
                    />

                  <FormInput
                    control={form.control}
                    name="pinCode"
                    label={<LabelWithAsterisk label={t("enterPostalCode")} required />}
                    placeholder={t("enterPostalCode")}
                  />
                </div>

                  {/* City, Latitude & Longitude Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormInput
                      control={form.control}
                      name="city"
                      label={t("city")}
                      placeholder={t("enterCity")}
                    />
                    <FormInput
                      control={form.control}
                      name="lattitude"
                      label={t("latitude")}
                      placeholder={t("enterLatitude")}
                    />

                    <FormInput
                      control={form.control}
                      name="longitude"
                      label={t("longitude")}
                      placeholder={t("enterLongitude")}
                    />
                  </div>
                </div>

                <Separator />

                {/* Contact Details Section */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold">{t("contactDetails")}</p>

                  {/* Contact Name & Number Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      control={form.control}
                      name="contactName"
                      label={<LabelWithAsterisk label={t("contactName")} />}
                      placeholder={t("enterContactName")}
                    />

                    <FormInput
                      control={form.control}
                      name="contactNumber"
                      label={<LabelWithAsterisk label={t("contactNumber")} />}
                      placeholder={t("enterContactNumber")}
                    />
                  </div>
                </div>

                <Separator />

                {/* Address Type Checkboxes */}
                <div className="space-y-3 py-2">
                  <p className="text-sm font-medium">{t("addressFor")}</p>
                  <div className="flex gap-6">
                    <FormField
                      control={form.control}
                      name="isBilling"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0 cursor-pointer">
                            {t("billing")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isShipping"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0 cursor-pointer">
                            {t("shipping")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Tax ID */}
                <FormInput
                  control={form.control}
                  name="gst"
                  label={<LabelWithAsterisk label={t("taxIdGst")} />}
                  placeholder={t("enterGstNumber")}
                />
              </form>
            </Form>
          </div>

          {/* Fixed Footer */}
          <div className="px-4 sm:px-6 pt-.5 pb-4 border-t shrink-0">
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCancel} type="button">
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                form="address-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[95vh] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="px-4 pt-6 pb-4 border-b shrink-0">
          <DrawerHeader className="text-left p-0">
            <DrawerTitle>
              {mode === "create" ? t("createAddress") : t("editAddress")}
            </DrawerTitle>
          </DrawerHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
          <Form {...form}>
            <form
              id="address-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Branch & Address Fields */}
              <FormInput
                control={form.control}
                name="branchName"
                label={<LabelWithAsterisk label={t("branchName")} required />}
                placeholder={t("enterBranchName")}
                required
              />
              <FormTextarea
                control={form.control}
                name="addressLine"
                label={<LabelWithAsterisk label={t("address")} required />}
                placeholder={t("enterAddress")}
                required
              />

              {/* Address Type Checkboxes */}
              <div className="space-y-3 py-2">
                <p className="text-sm font-medium">{t("addressFor")}</p>
                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="isBilling"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          {t("billing")}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isShipping"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          {t("shipping")}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tax ID */}
              <FormInput
                control={form.control}
                name="gst"
                label={<LabelWithAsterisk label={t("taxIdGst")} />}
                placeholder={t("enterGstNumber")}
              />
              <FormInput
                control={form.control}
                name="locality"
                label={t("locality")}
                placeholder={t("enterLocality")}
              />

              <Separator />

              {/* Location Section */}
              <div className="space-y-4">
                <p className="text-sm font-semibold">{t("location")}</p>

                {/* Country & State Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <FormDropdown
                    control={form.control}
                    name="country"
                    label={<LabelWithAsterisk label={t("country")} required />}
                    placeholder={
                      countriesLoading
                        ? t("loadingCountries")
                        : t("selectCountry")
                    }
                    options={countries.length > 0 ? countries : []}
                  />

                  <FormDropdown
                    control={form.control}
                    name="state"
                    label={<LabelWithAsterisk label={t("state")} required />}
                    placeholder={
                      statesLoading ? t("loadingStates") : t("selectState")
                    }
                    options={states.length > 0 ? states : []}
                  />
                </div>

                {/* District, PostalCode, City Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <FormDropdown
                    control={form.control}
                    name="district"
                    label={t("district")}
                    placeholder={
                      districtsLoading
                        ? t("loadingDistricts")
                        : t("selectDistrict")
                    }
                    options={districts.length > 0 ? districts : []}
                  />

                  <FormInput
                    control={form.control}
                    name="pinCode"
                    label={t("postalCodePinCode")}
                    placeholder={t("enterPostalCode")}
                    required
                  />
                </div>

                {/* City, Latitude & Longitude Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <FormInput
                    control={form.control}
                    name="city"
                    label={t("city")}
                    placeholder={t("enterCity")}
                  />
                  <FormInput
                    control={form.control}
                    name="lattitude"
                    label={t("latitude")}
                    placeholder={t("enterLatitude")}
                  />

                  <FormInput
                    control={form.control}
                    name="longitude"
                    label={t("longitude")}
                    placeholder={t("enterLongitude")}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Details Section */}
              <div className="space-y-4">
                <p className="text-sm font-semibold">{t("contactDetails")}</p>

                {/* Contact Name & Number Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <FormInput
                    control={form.control}
                    name="contactName"
                    label={<LabelWithAsterisk label={t("contactName")} />}
                    placeholder={t("enterContactName")}
                  />

                  <FormInput
                    control={form.control}
                    name="contactNumber"
                    label={<LabelWithAsterisk label={t("contactNumber")} />}
                    placeholder={t("enterContactNumber")}
                  />
                </div>
              </div>

              <Separator />

              {/* Address Type Checkboxes */}
              <div className="space-y-3 py-2">
                <p className="text-sm font-medium">{t("addressFor")}</p>
                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="isBilling"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          {t("billing")}
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isShipping"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          {t("shipping")}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tax ID */}
              <FormInput
                control={form.control}
                name="gst"
                label={<LabelWithAsterisk label={t("taxIdGst")} />}
                placeholder={t("enterGstNumber")}
              />
            </form>
          </Form>
        </div>

        {/* Fixed Footer */}
        <div className="px-4 pt-4 pb-6 border-t shrink-0">
          <DrawerFooter className="gap-2 p-0">
            <Button
              variant="outline"
              onClick={handleCancel}
              type="button"
              className="w-full"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              form="address-form"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? t("saving") : t("save")}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CompanyDialogBox;
