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

interface SPRFormProps {
  isContentPage?: boolean;
  isSummaryPage?: boolean;
}

/**
 * SPRForm component for Customer Information
 * Migrated from buyer-fe/src/components/Summary/Components/SPRForm/SPRForm.js
 * 
 * Displays Customer Information fields (End Customer Name, Project Name, Competitors, Price Justification)
 * when SPR (Special Price Request) is enabled
 */
export default function SPRForm({
  isContentPage = false,
  isSummaryPage = true,
}: SPRFormProps) {
  const { quoteSettings } = useModuleSettings();
  const {
    getValues,
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext();

  const searchParams = useSearchParams();
  const sellerCompanyId = searchParams?.get("sellerId");

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


  const isSPR = getValues(
    isSummaryPage ? "sprDetails.spr" : "quotationDetails.0.sprDetails.spr"
  );

  const sprDetails = watch(
    isSummaryPage ? "sprDetails" : "quotationDetails.0.sprDetails"
  );

  // Set up SPR checkbox value to trigger validation
  useEffect(() => {
    if (isSummaryPage) {
      setValue("sprDetails.spr", isSPR || false);
      // Trigger validation when SPR status changes
      if (isSPR) {
        trigger("sprDetails");
        // Also ensure required fields are marked
        const fieldNames = [
          "sprDetails.companyName",
          "sprDetails.projectName",
          "sprDetails.competitorNames",
          "sprDetails.priceJustification",
        ];
        fieldNames.forEach((field) => trigger(field));
      }
    }
  }, [isSPR, isSummaryPage, setValue, trigger]);

  // Handle field changes with XSS validation
  const handleFieldChange = async (
    fieldName: string,
    value: string | string[],
    displayName: string
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

    setValue(fieldName as any, value);
    await trigger(fieldName as any);
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
      await handleFieldChange(fieldName, updatedCompetitors, "Competitors");
    }
  };

  // Handle competitor removal
  const handleRemoveCompetitor = async (competitorToRemove: string) => {
    const currentCompetitors = Array.isArray(sprDetails?.competitorNames)
      ? sprDetails.competitorNames
      : [];
    const updatedCompetitors = currentCompetitors.filter(
      (comp) => comp !== competitorToRemove
    );
    const fieldName = isSummaryPage
      ? "sprDetails.competitorNames"
      : "quotationDetails[0].sprDetails.competitorNames";
    await handleFieldChange(fieldName, updatedCompetitors, "Competitors");
  };

  const sprErrors = isSummaryPage
    ? errors?.sprDetails
    : errors?.quotationDetails?.[0]?.sprDetails;

  return (
    <Card className="shadow-sm mt-4" id="endCustomerInfo">
      <CardHeader className="px-6 py-4 bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0" id="sprDetails">
        {/* End Customer Name */}
        {isContentPage ? (
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
              {...register(
                isSummaryPage
                  ? "sprDetails.companyName"
                  : "quotationDetails[0].sprDetails.companyName",
                {
                  onChange: async (ev) => {
                    const value = ev.target.value;
                    const fieldName = isSummaryPage
                      ? "sprDetails.companyName"
                      : "quotationDetails[0].sprDetails.companyName";
                    await handleFieldChange(fieldName, value, "End Customer Name");
                  },
                }
              )}
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
        {isContentPage ? (
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
              {...register(
                isSummaryPage
                  ? "sprDetails.projectName"
                  : "quotationDetails[0].sprDetails.projectName",
                {
                  onChange: async (ev) => {
                    const value = ev.target.value;
                    const fieldName = isSummaryPage
                      ? "sprDetails.projectName"
                      : "quotationDetails[0].sprDetails.projectName";
                    await handleFieldChange(fieldName, value, "Project Name");
                  },
                }
              )}
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
        {isContentPage ? (
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
        {isContentPage ? (
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
              {...register(
                isSummaryPage
                  ? "sprDetails.priceJustification"
                  : "quotationDetails[0].sprDetails.priceJustification",
                {
                  onChange: async (ev) => {
                    const value = ev.target.value;
                    const fieldName = isSummaryPage
                      ? "sprDetails.priceJustification"
                      : "quotationDetails[0].sprDetails.priceJustification";
                    await handleFieldChange(fieldName, value, "Price Justification");
                  },
                }
              )}
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

