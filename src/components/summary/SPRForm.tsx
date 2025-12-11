"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useGetManufacturerCompetitors from "@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors";
import useModuleSettings from "@/hooks/useModuleSettings";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

// Helper hook to safely use FormContext
function useFormContextSafe() {
  try {
    return useFormContext();
  } catch {
    return null;
  }
}

interface SPRFormProps {
  isContentPage?: boolean;
  isSummaryPage?: boolean;
  // Optional props for when FormProvider is not available (fallback mode)
  sellerCompanyId?: number;
  customerName?: string;
  projectName?: string;
  competitors?: string[];
  priceJustification?: string;
  onCustomerNameChange?: (value: string) => void;
  onProjectNameChange?: (value: string) => void;
  onCompetitorsChange?: (value: string[]) => void;
  onPriceJustificationChange?: (value: string) => void;
}

/**
 * SPRForm component for Customer Information
 * Migrated from buyer-fe/src/components/Summary/Components/SPRForm/SPRForm.js
 * 
 * Displays Customer Information fields (End Customer Name, Project Name, Competitors, Price Justification)
 * when SPR (Special Price Request) is enabled
 * 
 * Supports two modes:
 * 1. FormProvider mode (for QuoteSummary): Uses react-hook-form context
 * 2. Props mode (for QuoteEdit): Uses direct props when FormProvider is not available
 * 
 * Auto-detects read-only vs editable:
 * - If values exist and isContentPage=true: Read-only display
 * - If values don't exist or isContentPage=false: Editable inputs
 */
export default function SPRForm({
  isContentPage = false,
  isSummaryPage = true,
  // Props mode fallback
  sellerCompanyId: propSellerCompanyId,
  customerName: propCustomerName,
  projectName: propProjectName,
  competitors: propCompetitors,
  priceJustification: propPriceJustification,
  onCustomerNameChange,
  onProjectNameChange,
  onCompetitorsChange,
  onPriceJustificationChange,
}: SPRFormProps) {
  useModuleSettings();
  
  // Try to use FormContext, fallback to null if not available
  const formContext = useFormContextSafe();
  const useFormContextMode = formContext !== null;
  
  // Get form methods - use formContext if available, otherwise use fallback
  const register = useFormContextMode && formContext ? formContext.register : () => ({});
  const errors = useFormContextMode && formContext ? formContext.formState.errors : {};

  const searchParams = useSearchParams();
  const sellerCompanyIdFromUrl = searchParams?.get("sellerId");
  const sellerCompanyId = propSellerCompanyId || (sellerCompanyIdFromUrl ? Number(sellerCompanyIdFromUrl) : undefined);

  const { competitors, competitorsLoading } = useGetManufacturerCompetitors(
    sellerCompanyId,
    !!sellerCompanyId
  );

  // Debug: Log competitors data to see the structure
  useEffect(() => {
    if (competitors && competitors.length > 0) {
      console.log("Competitors data:", competitors);
      console.log("First competitor:", competitors[0]);
    }
  }, [competitors]);


  // Get SPR details - from form context or props
  let sprDetailsFromForm: any = null;
  if (useFormContextMode && formContext) {
    sprDetailsFromForm = formContext.watch(
      isSummaryPage ? "sprDetails" : "quotationDetails.0.sprDetails"
    );
  }

  const sprDetailsFromProps = useFormContextMode
    ? null
    : {
        companyName: propCustomerName || "",
        projectName: propProjectName || "",
        competitorNames: propCompetitors || [],
        priceJustification: propPriceJustification || "",
        spr: false, // Not used in props mode
      };

  const sprDetails = sprDetailsFromForm || sprDetailsFromProps || {};

  // Check if SPR is enabled (only in form context mode)
  let isSPR = false;
  if (useFormContextMode && formContext) {
    isSPR = formContext.getValues(
      isSummaryPage ? "sprDetails.spr" : "quotationDetails.0.sprDetails.spr"
    ) || false;
  }

  // Auto-detect if we should show read-only: if values exist and isContentPage is true
  const hasValues =
    sprDetails?.companyName ||
    sprDetails?.projectName ||
    (Array.isArray(sprDetails?.competitorNames) &&
      sprDetails.competitorNames.length > 0) ||
    sprDetails?.priceJustification;

  // Determine if should be read-only: isContentPage=true AND values exist
  const shouldBeReadOnly = isContentPage && hasValues;

  // Set up SPR checkbox value to trigger validation (only in form context mode)
  useEffect(() => {
    if (useFormContextMode && isSummaryPage && formContext) {
      formContext.setValue("sprDetails.spr", isSPR || false);
      // Trigger validation when SPR status changes
      if (isSPR) {
        formContext.trigger("sprDetails");
        // Also ensure required fields are marked
        const fieldNames = [
          "sprDetails.companyName",
          "sprDetails.projectName",
          "sprDetails.competitorNames",
          "sprDetails.priceJustification",
        ];
        fieldNames.forEach((field) => formContext.trigger(field));
      }
    }
  }, [isSPR, isSummaryPage, useFormContextMode, formContext]);

  // Handle field changes with XSS validation
  const handleFieldChange = async (
    fieldName: string,
    value: string | string[]
  ) => {
    // XSS validation
    if (typeof value === "string" && value && containsXSS(value)) {
      toast.error("Invalid content detected");
      return;
    }
    if (Array.isArray(value) && value.some((v) => containsXSS(v))) {
      toast.error("Invalid content detected");
      return;
    }

    if (useFormContextMode && formContext) {
      formContext.setValue(fieldName as any, value);
      await formContext.trigger(fieldName as any);
    } else {
      // Props mode - call the appropriate callback
      if (fieldName.includes("companyName")) {
        onCustomerNameChange?.(value as string);
      } else if (fieldName.includes("projectName")) {
        onProjectNameChange?.(value as string);
      } else if (fieldName.includes("competitorNames")) {
        onCompetitorsChange?.(value as string[]);
      } else if (fieldName.includes("priceJustification")) {
        onPriceJustificationChange?.(value as string);
      }
    }
  };

  // Handle competitor selection
  const handleCompetitorSelect = async (value: string) => {
    const currentCompetitors = Array.isArray(sprDetails?.competitorNames)
      ? sprDetails.competitorNames
      : [];
    
    if (value && !currentCompetitors.includes(value)) {
      const updatedCompetitors = [...currentCompetitors, value];
      const fieldName = isSummaryPage
        ? "sprDetails.competitorNames"
        : "quotationDetails[0].sprDetails.competitorNames";
      await handleFieldChange(fieldName, updatedCompetitors);
    }
  };

  // Handle competitor removal
  const handleRemoveCompetitor = async (competitorToRemove: string) => {
    const currentCompetitors = Array.isArray(sprDetails?.competitorNames)
      ? sprDetails.competitorNames
      : [];
    const updatedCompetitors = currentCompetitors.filter(
      (comp: string) => comp !== competitorToRemove
    );
    const fieldName = isSummaryPage
      ? "sprDetails.competitorNames"
      : "quotationDetails[0].sprDetails.competitorNames";
    await handleFieldChange(fieldName, updatedCompetitors);
  };

  const sprErrors = isSummaryPage
    ? errors?.sprDetails
    : (errors?.quotationDetails as any)?.[0]?.sprDetails;

  return (
    <Card className="shadow-sm pb-0 py-0 gap-0">
      <CardHeader className="px-6 py-2 bg-muted rounded-t-lg items-end gap-0">
        <CardTitle className="text-xl font-semibold text-gray-900 m-0!">
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0" id="sprDetails">
        {/* End Customer Name */}
        {shouldBeReadOnly ? (
          <div className="flex justify-between items-center py-2 px-4">
            <Label className="text-sm font-normal text-gray-900 w-1/2">
              End Customer Name
            </Label>
            <div className="text-sm font-semibold text-gray-900 w-1/2 text-right">
              {sprDetails?.companyName || "-"}
            </div>
          </div>
        ) : (
          <div className="py-2 px-4">
            <Input
              id="sprDetails.companyName"
              {...(useFormContextMode
                ? register(
                    isSummaryPage
                      ? "sprDetails.companyName"
                      : "quotationDetails[0].sprDetails.companyName",
                    {
                      onChange: async (ev: React.ChangeEvent<HTMLInputElement>) => {
                        const value = ev.target.value;
                        const fieldName = isSummaryPage
                          ? "sprDetails.companyName"
                          : "quotationDetails[0].sprDetails.companyName";
                        await handleFieldChange(fieldName, value);
                      },
                    }
                  )
                : {
                    value: sprDetails?.companyName || "",
                    onChange: (e) =>
                      handleFieldChange("companyName", e.target.value),
                  })}
              placeholder="End Customer Name"
              required={isSPR}
              className={
                sprErrors?.companyName ? "border-red-500" : ""
              }
            />
            {sprErrors?.companyName && (
              <p className="text-sm text-red-500 mt-1">
                {sprErrors.companyName.message as string}
              </p>
            )}
          </div>
        )}

        {/* Project Name */}
        {shouldBeReadOnly ? (
          <div className="flex justify-between items-center py-2 px-4">
            <Label className="text-sm font-normal text-gray-900 w-1/2">
              Project Name
            </Label>
            <div className="text-sm font-semibold text-gray-900 w-1/2 text-right">
              {sprDetails?.projectName || "-"}
            </div>
          </div>
        ) : (
          <div className="py-2 px-4">
            <Input
              id="sprDetails.projectName"
              {...(useFormContextMode
                ? register(
                    isSummaryPage
                      ? "sprDetails.projectName"
                      : "quotationDetails[0].sprDetails.projectName",
                    {
                      onChange: async (ev: React.ChangeEvent<HTMLInputElement>) => {
                        const value = ev.target.value;
                        const fieldName = isSummaryPage
                          ? "sprDetails.projectName"
                          : "quotationDetails[0].sprDetails.projectName";
                        await handleFieldChange(fieldName, value);
                      },
                    }
                  )
                : {
                    value: sprDetails?.projectName || "",
                    onChange: (e) =>
                      handleFieldChange("projectName", e.target.value),
                  })}
              placeholder="Project Name"
              required={isSPR}
              className={
                sprErrors?.projectName ? "border-red-500" : ""
              }
            />
            {sprErrors?.projectName && (
              <p className="text-sm text-red-500 mt-1">
                {sprErrors.projectName.message as string}
              </p>
            )}
          </div>
        )}

        {/* Competitors */}
        {shouldBeReadOnly ? (
          <div className="flex justify-between items-center py-2 px-4">
            <Label className="text-sm font-normal text-gray-900 w-1/2">
              Competitors
            </Label>
            <div className="text-sm font-semibold text-gray-900 w-1/2 text-right">
              {Array.isArray(sprDetails?.competitorNames) && sprDetails.competitorNames.length > 0
                ? sprDetails.competitorNames.join(", ")
                : "-"}
            </div>
          </div>
        ) : (
          <div className="py-2 px-4 w-full">
            <Select
              onValueChange={handleCompetitorSelect}
              disabled={competitorsLoading}
            >
              <SelectTrigger
                id="sprDetails.competitorNames"
                className={`w-full ${sprErrors?.competitorNames ? "border-red-500" : ""}`}
              >
                <SelectValue
                  placeholder={
                    competitorsLoading
                      ? "Loading competitors..."
                      : "Competitors"
                  }
                />
              </SelectTrigger>
              <SelectContent className="w-full">
                {competitorsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading competitors...
                  </SelectItem>
                ) : competitors.length === 0 ? (
                  <SelectItem value="no-competitors" disabled>
                    No competitors available
                  </SelectItem>
                ) : (
                  competitors.map((competitor: any, index: number) => {
                    // Use competitorName as primary field (matching buyer-fe)
                    const competitorName = competitor.competitorName || competitor.name || "";
                    const competitorId = competitor.id || index;
                    
                    return (
                      <SelectItem
                        key={competitorId}
                        value={competitorName}
                      >
                        {competitorName || "Unknown"}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
            {sprErrors?.competitorNames && (
              <p className="text-sm text-red-500 mt-1">
                {sprErrors.competitorNames.message as string}
              </p>
            )}

            {/* Selected Competitors */}
            {Array.isArray(sprDetails?.competitorNames) &&
              sprDetails.competitorNames.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 w-full">
                  {sprDetails.competitorNames.map((competitor: string) => (
                    <Badge
                      key={competitor}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {competitor}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(competitor)}
                        className="ml-2 hover:text-red-600"
                        aria-label={`Remove ${competitor}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Price Justification */}
        {shouldBeReadOnly ? (
          <div className="flex justify-between items-center py-2 px-4">
            <Label className="text-sm font-normal text-gray-900 w-1/2">
              Price Justification
            </Label>
            <div className="text-sm font-semibold text-gray-900 w-1/2 text-right">
              {sprDetails?.priceJustification || "-"}
            </div>
          </div>
        ) : (
          <div className="py-2 px-4 pb-4">
            <Textarea
              id="sprDetails.priceJustification"
              {...(useFormContextMode
                ? register(
                    isSummaryPage
                      ? "sprDetails.priceJustification"
                      : "quotationDetails[0].sprDetails.priceJustification",
                    {
                      onChange: async (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const value = ev.target.value;
                        const fieldName = isSummaryPage
                          ? "sprDetails.priceJustification"
                          : "quotationDetails[0].sprDetails.priceJustification";
                        await handleFieldChange(fieldName, value);
                      },
                    }
                  )
                : {
                    value: sprDetails?.priceJustification || "",
                    onChange: (e) =>
                      handleFieldChange("priceJustification", e.target.value),
                  })}
              placeholder="Price Justification"
              required={isSPR}
              rows={4}
              className={
                sprErrors?.priceJustification ? "border-red-500" : ""
              }
            />
            {sprErrors?.priceJustification && (
              <p className="text-sm text-red-500 mt-1">
                {sprErrors.priceJustification.message as string}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

