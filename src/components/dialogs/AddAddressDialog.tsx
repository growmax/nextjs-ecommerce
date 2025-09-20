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
import { Search } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthStorage } from "@/lib/auth";
import { JWTService } from "@/lib/services/JWTService";

// Form validation schema - required fields marked
const addressFormSchema = z.object({
  companyName: z.string().optional(),
  branch: z.string().min(1, "Branch is required"),
  address: z.string().min(1, "Address is required"),
  locality: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State/Province is required"),
  district: z.string().optional(),
  postalCode: z.string().min(1, "PostalCode/PinCode is required"),
  city: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  isBilling: z.boolean().optional(),
  isShipping: z.boolean().optional(),
  taxId: z.string().optional(),
  contactName: z.string().optional(),
  contactNumber: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

export interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: AddressFormData) => void;
  mode?: "add" | "edit";
  initialData?: Partial<AddressFormData>;
  countries?: Array<{ value: string; label: string }>;
  states?: Array<{ value: string; label: string }>;
  districts?: Array<{ value: string; label: string }>;
}

export function AddAddressDialog({
  open,
  onOpenChange,
  onSuccess,
  mode = "add",
  initialData,
  countries = [],
  states = [],
  districts = [],
}: AddressDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty, touchedFields },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
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

  // Form state monitoring disabled for production
  React.useEffect(() => {
    // Development-only form state monitoring
  }, [isValid, isDirty, touchedFields, errors]);

  // Reset form when dialog opens with initial data
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          companyName: "",
          branch: "",
          address: "",
          locality: "",
          country: "",
          state: "",
          district: "",
          postalCode: "",
          city: "",
          latitude: "",
          longitude: "",
          isBilling: false,
          isShipping: false,
          taxId: "",
          contactName: "",
          contactNumber: "",
        });
      }
    }
  }, [open, initialData, reset]);

  // Memoize the states and districts to prevent infinite loops
  const availableStates = React.useMemo(() => states, [states]);
  const availableDistricts = React.useMemo(() => districts, [districts]);

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

      const apiPayload = {
        ...data,
        companyName: searchTerm, // Include search term
        companyId: payload.companyId,
        userId: payload.userId,
      };

      const endpoint =
        mode === "edit" ? `/api/addresses/update` : "/api/addresses/create";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-tenant": payload.iss,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${mode} address`);
      }

      await response.json();

      toast.success(
        `Address ${mode === "edit" ? "updated" : "added"} successfully!`
      );
      onSuccess?.(data);
      onOpenChange(false);
      reset();
    } catch {
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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b shrink-0">
          <DialogTitle>
            {mode === "edit" ? "Edit Address" : "Add Address"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
          <Card className="border-0 shadow-none h-full">
            <CardContent className="p-0 space-y-4 sm:space-y-3 h-full">
              {/* Company Search */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Company Name
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Search company name"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <Separator />

              <form
                id="address-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Single Fields */}
                <div>
                  <Label htmlFor="branch">
                    Branch <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="branch"
                    {...register("branch")}
                    className="w-full mt-1"
                  />
                  {errors.branch && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.branch.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    {...register("address")}
                    className="w-full mt-1"
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="locality">Locality</Label>
                  <Input
                    id="locality"
                    {...register("locality")}
                    className="w-full mt-1"
                  />
                </div>

                {/* Country and State - Responsive Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.length > 0 ? (
                              countries.map(country => (
                                <SelectItem
                                  key={country.value}
                                  value={country.value}
                                >
                                  {country.label}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="India">India</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.country && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.country.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>
                      State/Province <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStates.length > 0 ? (
                              availableStates.map(state => (
                                <SelectItem
                                  key={state.value}
                                  value={state.value}
                                >
                                  {state.label}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="Tamil Nadu">
                                Tamil Nadu
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* District and PostalCode - Responsive Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>District</Label>
                    <Controller
                      name="district"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDistricts.length > 0 ? (
                              availableDistricts.map(district => (
                                <SelectItem
                                  key={district.value}
                                  value={district.value}
                                >
                                  {district.label}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="Chennai">Chennai</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode">
                      PostalCode/PinCode <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      {...register("postalCode")}
                      type="tel"
                      inputMode="numeric"
                      className="w-full mt-1"
                    />
                    {errors.postalCode && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* City and Coordinates - Mobile Optimized */}
                <div>
                  <div className="mb-3">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      className="w-full mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        {...register("latitude")}
                        type="number"
                        inputMode="decimal"
                        className="w-full mt-1"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        {...register("longitude")}
                        type="number"
                        inputMode="decimal"
                        className="w-full mt-1"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Type Checkboxes */}
                <div>
                  <Label className="mb-2 block">Address for</Label>
                  <div className="flex gap-4">
                    <Controller
                      name="isBilling"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="billing"
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                          <label
                            htmlFor="billing"
                            className="text-sm cursor-pointer"
                          >
                            Billing
                          </label>
                        </div>
                      )}
                    />
                    <Controller
                      name="isShipping"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="shipping"
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                          <label
                            htmlFor="shipping"
                            className="text-sm cursor-pointer"
                          >
                            Shipping
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Tax ID */}
                <div>
                  <Label htmlFor="taxId">Tax ID / GST#</Label>
                  <Input
                    id="taxId"
                    {...register("taxId")}
                    className="w-full mt-1"
                  />
                </div>

                <Separator />

                {/* Contact Details - Responsive Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      {...register("contactName")}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      {...register("contactNumber")}
                      type="tel"
                      inputMode="tel"
                      className="w-full mt-1"
                    />
                  </div>
                </div>

                <Separator />

                {/* Action Buttons - Mobile Responsive */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="default"
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "SAVING..." : "SAVE"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddAddressDialog;
