"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
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
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormDropdown } from "./FormDropdown";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
interface CompanyDialogBoxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: AddressFormData | null;
  branchId?: string | number | null;
  onSuccess?: () => void;
}

// Create schema function that accepts translations
const createAddressFormSchema = (t: (key: string) => string) =>
  z.object({
    id: z.number().optional(),
    companyName: z.string().optional(),
    branchName: z.string().min(1, t("validation.branchNameRequired")),
    addressLine: z.string().min(1, t("validation.addressLineRequired")),
    locality: z.string().optional(),
    country: z.string().refine(val => val.length > 0, {
      message: t("validation.countryRequired"),
    }),
    state: z.string().refine(val => val.length > 0, {
      message: t("validation.stateRequired"),
    }),
    district: z.string().optional(),
    pinCode: z.string().min(1, t("validation.pinCodeRequired")),
    city: z.string().optional(),
    lattitude: z.string().optional(),
    longitude: z.string().optional(),
    isBilling: z.boolean(),
    isShipping: z.boolean(),
    gst: z.string().optional(),
    contactName: z.string().optional(),
    contactNumber: z.string().optional(),
  });

type AddressFormData = z.infer<ReturnType<typeof createAddressFormSchema>>;

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

  // small helper to normalize unknown service payloads into dropdown options
  const toOption = useCallback((c: unknown) => {
    if (c && typeof c === "object") {
      const rec = c as Record<string, unknown>;
      const value = String(rec.code ?? rec.iso ?? rec.id ?? rec.name ?? "");
      const label = String(rec.name ?? rec.label ?? rec.iso ?? rec.code ?? "");
      return { value, label };
    }
    return { value: "", label: "" };
  }, []);

  const loadCountries = useCallback(async () => {
    try {
      setCountriesLoading(true);
      const resp = await LocationService.getAllCountries();
      const list = Array.isArray(resp?.data)
        ? resp.data.map(toOption).filter(o => o.value)
        : [];
      setCountries(list);
    } catch {
      setCountries([]);
    } finally {
      setCountriesLoading(false);
    }
  }, [toOption]);

  const loadStates = useCallback(
    async (countryValue?: string) => {
      try {
        setStatesLoading(true);
        const resp = await LocationService.getAllStates();
        const raw = Array.isArray(resp?.data) ? resp.data : [];
        const filtered = countryValue
          ? raw.filter((r: unknown) => {
              if (!r || typeof r !== "object") return false;
              const rec = r as Record<string, unknown>;
              const countryFields = [
                rec.country,
                rec.countryId,
                rec.countryCode,
                rec.countryIso,
                rec.country_name,
              ];
              return countryFields.some(
                f => f !== undefined && String(f) === String(countryValue)
              );
            })
          : raw;
        const list = filtered.map(toOption).filter(o => o.value);
        setStates(list);
      } catch {
        setStates([]);
      } finally {
        setStatesLoading(false);
      }
    },
    [toOption]
  );

  const loadDistricts = useCallback(
    async (stateValue?: string) => {
      try {
        setDistrictsLoading(true);
        const resp = await LocationService.getAllDistricts();
        const raw = Array.isArray(resp?.data) ? resp.data : [];
        const filtered = stateValue
          ? raw.filter((r: unknown) => {
              if (!r || typeof r !== "object") return false;
              const rec = r as Record<string, unknown>;
              const stateFields = [
                rec.state,
                rec.stateId,
                rec.stateCode,
                rec.stateIso,
                rec.state_name,
              ];
              return stateFields.some(
                f => f !== undefined && String(f) === String(stateValue)
              );
            })
          : raw;
        const list = filtered.map(toOption).filter(o => o.value);
        setDistricts(list);
      } catch {
        setDistricts([]);
      } finally {
        setDistrictsLoading(false);
      }
    },
    [toOption]
  );

  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
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
          district: d.district || "",
          latitude: lattitude ?? 0,
          longitude: longitude ?? 0,
          lattitude: String(lattitude ?? 0),
          pinCodeId: d.pinCode || "",
          state: d.state || "",
          country: d.country || "",
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
          throw new Error(t("missingAuthCannotUpdateBranch"));
        }

        // attach resolved ids to the payload explicitly
        payload.companyId = resolvedCompanyId as number;
        payload.userId = resolvedUserId as number;
        await CompanyService.updateBranchAddress(payload);
      }

      // Call onSuccess callback to refresh parent data
      onSuccess?.();
      onOpenChange(false);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (open) {
      // only load countries on open; load states/districts on-demand when parent value exists
      void loadCountries();
    }

    if (mode === "edit") {
      if (initialData) {
        form.reset(initialData);
      }
    } else {
      // create mode
      form.reset(emptyDefaults);
    }
    // include `open` so that opening the dialog will reset correctly
  }, [initialData, mode, open, form, emptyDefaults, loadCountries]);

  // targeted watchers: watch country and state separately to load children and reset dependents
  const watchedCountry = form.watch("country");
  useEffect(() => {
    // when country changes, reset state/district and load filtered states (or clear lists)
    if (watchedCountry) {
      form.setValue("state", "");
      form.setValue("district", "");
      // load only states relevant to the selected country
      void loadStates(watchedCountry);
      setDistricts([]);
    } else {
      // no country selected -> clear child lists/values
      setStates([]);
      setDistricts([]);
      form.setValue("state", "");
      form.setValue("district", "");
    }
  }, [watchedCountry, loadStates, form]);

  const watchedState = form.watch("state");
  useEffect(() => {
    // when state changes, reset district and load filtered districts (or clear list)
    if (watchedState) {
      form.setValue("district", "");
      void loadDistricts(watchedState);
    } else {
      setDistricts([]);
      form.setValue("district", "");
    }
  }, [watchedState, loadDistricts, form]);

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Dialog is closing - reset to defaults for create or to initialData for edit
      if (mode === "create") {
        form.reset(emptyDefaults);
      } else {
        form.reset(initialData || emptyDefaults);
      }
    } else {
      // Dialog is opening - ensure form matches mode
      if (mode === "create") {
        form.reset(emptyDefaults);
      } else {
        form.reset(initialData || emptyDefaults);
      }
    }

    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay className="!z-[150]" />
        <DialogContent hideOverlay className="w-full h-full sm:max-w-2xl sm:max-h-[90vh] sm:rounded-lg p-0 flex flex-col !z-[150]">
          {/* Fixed Header */}
          <div className="px-4 sm:px-6 pt-6 pb-4 border-b shrink-0">
            <DialogHeader>
              <DialogTitle>
                {mode === "create" ? t("createAddress") : t("editAddress")}
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
                label={t("branch")}
                placeholder={t("enterBranchName")}
                required
              />

              <FormTextarea
                control={form.control}
                name="addressLine"
                label={t("address")}
                placeholder={t("enterAddress")}
                required
              />

              <FormInput
                control={form.control}
                name="locality"
                label={t("locality")}
                placeholder={t("enterLocality")}
              />

              {/* Country & State Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormDropdown
                  control={form.control}
                  name="country"
                  label={t("country")}
                  placeholder={
                    countriesLoading
                      ? t("loadingCountries")
                      : t("searchACountry")
                  }
                  required
                  options={countries.length > 0 ? countries : []}
                />

                <FormDropdown
                  control={form.control}
                  name="state"
                  label={t("stateProvince")}
                  placeholder={
                    statesLoading
                      ? t("loadingStates")
                      : t("searchAStateProvince")
                  }
                  required
                  options={states.length > 0 ? states : []}
                />
              </div>

              {/* District, PostalCode, City Grid */}
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
                  label={t("postalCodePinCode")}
                  placeholder={t("enterPostalCode")}
                  required
                />
              </div>

              {/* lattitude & Longitude Grid */}
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
                label={t("taxIdGst")}
                placeholder={t("enterGstNumber")}
              />

              <Separator />

              {/* Contact Details Section */}
              <div className="space-y-4">
                <p className="text-sm font-semibold">{t("contactDetails")}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="contactName"
                    label={t("contactName")}
                    placeholder={t("enterContactName")}
                  />

                  <FormInput
                    control={form.control}
                    name="contactNumber"
                    label={t("contactNumber")}
                    placeholder={t("enterContactNumber")}
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
              {t("cancel")}
            </Button>
            <Button type="submit" form="address-form" disabled={isSubmitting}>
              {isSubmitting ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CompanyDialogBox;
