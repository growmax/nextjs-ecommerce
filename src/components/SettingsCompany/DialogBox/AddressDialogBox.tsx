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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import CompanyService, {
  AddressData,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "@/lib/api/services/CompanyService";
import LocationService from "@/lib/api/services/LocationService/LocationService";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormDropdown } from "../../forms/FormDropdown/FormDropdown";
import FormInput from "../../forms/FormInput/FormInput";

interface CompanyDialogBoxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: AddressFormData | null;
  branchId?: string | number | null;
  onSuccess?: () => void;
}

// Zod validation schema
const addressFormSchema = z.object({
  id: z.number().optional(),
  companyName: z.string().optional(),
  branchName: z.string().min(1),
  addressLine: z.string().min(1),
  locality: z.string().optional(),
  country: z.string().refine(val => val.length > 0),
  state: z.string().refine(val => val.length > 0),
  district: z.string().optional(),
  pinCode: z.string().min(1),
  city: z.string().optional(),
  lattitude: z.string().optional(),
  longitude: z.string().optional(),
  isBilling: z.boolean(),
  isShipping: z.boolean(),
  gst: z.string().optional(),
  contactName: z.string().optional(),
  contactNumber: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

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
      mode === "create" ? emptyDefaults : initialData || emptyDefaults,
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
          if (/^\d+$/.test(stateValue)) {
            stateId = Number(stateValue);
          } else {
            // Use functional update to access current states without dependency
            await new Promise<void>(resolve => {
              setStates(current => {
                const found = current.find(s => s.label === stateValue);
                if (found) stateId = Number(found.value);
                resolve();
                return current;
              });
            });
          }
        }

        // Load districts
        const resp = stateId
          ? await LocationService.getDistrictsByState(stateId)
          : await LocationService.getAllDistricts();

        const raw = Array.isArray(resp?.data) ? resp.data : [];
        const filtered = stateId
          ? raw.filter((district: any) => district.stateId === stateId)
          : raw;
        const list = filtered.map(toDropdownOption).filter(o => o.value);
        setDistricts(list);
      } catch {
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
          throw new Error(
            "Missing authentication (userId/companyId) - cannot create branch"
          );
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
          throw new Error(
            "Missing address id for update. Please re-open the branch or refresh the list and try again."
          );
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
          // Update-specific fields required by UpdateBranchRequest
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
          throw new Error(
            "Missing authentication (userId/companyId) - cannot update branch"
          );
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
      }

      // Mark as loaded to prevent duplicate calls
      hasLoadedInitialData.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, open]);

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
    form.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form when closing
      form.reset(
        mode === "create" ? emptyDefaults : initialData || emptyDefaults
      );
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full h-full sm:max-w-2xl sm:max-h-[90vh] sm:rounded-lg p-0 flex flex-col">
        {/* Fixed Header */}
        <div className="px-4 sm:px-6 pt-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Address" : "Edit Address"}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
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
                label={<LabelWithAsterisk label="Branch" required />}
                placeholder="Enter branch name"
              />

              <FormTextarea
                control={form.control}
                name="addressLine"
                label={<LabelWithAsterisk label="Address" required />}
                placeholder="Enter address"
              />

              <FormInput
                control={form.control}
                name="locality"
                label={<LabelWithAsterisk label="Locality" />}
                placeholder="Enter locality"
              />

              {/* Country & State Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormDropdown
                  control={form.control}
                  name="country"
                  label={<LabelWithAsterisk label="Country" required />}
                  placeholder={
                    countriesLoading
                      ? "Loading countries..."
                      : "Search A Country"
                  }
                  options={countries.length > 0 ? countries : []}
                />

                <FormDropdown
                  control={form.control}
                  name="state"
                  label={<LabelWithAsterisk label="State/Province" required />}
                  placeholder={
                    statesLoading
                      ? "Loading states..."
                      : "Search A State/Province"
                  }
                  options={states.length > 0 ? states : []}
                />
              </div>

              {/* District, PostalCode, City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormDropdown
                  control={form.control}
                  name="district"
                  label={<LabelWithAsterisk label="District" />}
                  placeholder={
                    districtsLoading
                      ? "Loading districts..."
                      : "Select district"
                  }
                  options={districts.length > 0 ? districts : []}
                />

                <FormInput
                  control={form.control}
                  name="pinCode"
                  label={
                    <LabelWithAsterisk label="PostalCode/PinCode" required />
                  }
                  placeholder="Enter postal code"
                />
              </div>

              {/* lattitude & Longitude Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput
                  control={form.control}
                  name="city"
                  label={<LabelWithAsterisk label="City" />}
                  placeholder="Enter city"
                />
                <FormInput
                  control={form.control}
                  name="lattitude"
                  label={<LabelWithAsterisk label="Lattitude" />}
                  placeholder="Enter lattitude"
                />

                <FormInput
                  control={form.control}
                  name="longitude"
                  label={<LabelWithAsterisk label="Longitude" />}
                  placeholder="Enter longitude"
                />
              </div>

              {/* Address Type Checkboxes */}
              <div className="space-y-3 py-2">
                <p className="text-sm font-medium">Address for</p>
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
                          Billing
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
                          Shipping
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
                label={<LabelWithAsterisk label="Tax ID / GST#" />}
                placeholder="Enter GST number"
              />

              <Separator />

              {/* Contact Details Section */}
              <div className="space-y-4">
                <p className="text-sm font-semibold">Contact Details</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="contactName"
                    label={<LabelWithAsterisk label="Contact Name" />}
                    placeholder="Enter contact name"
                  />

                  <FormInput
                    control={form.control}
                    name="contactNumber"
                    label={<LabelWithAsterisk label="Contact Number" />}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* Fixed Footer */}
        <div className="px-4 sm:px-6 pt-4 pb-6 border-t shrink-0">
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" form="address-form" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyDialogBox;
