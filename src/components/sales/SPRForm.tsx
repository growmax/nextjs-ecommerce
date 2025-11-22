"use client";

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
import useGetManufacturerCompetitors, {
  type CompetitorDetail,
} from "@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors";
import { useTranslations } from "next-intl";

interface SPRFormProps {
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

export default function SPRForm({
  sellerCompanyId,
  customerName = "",
  projectName = "",
  competitors = [],
  priceJustification = "",
  onCustomerNameChange,
  onProjectNameChange,
  onCompetitorsChange,
  onPriceJustificationChange,
}: SPRFormProps) {
  const t = useTranslations("components");
  // Fetch competitors from the hook
  const { competitors: competitorsList, competitorsLoading } =
    useGetManufacturerCompetitors(sellerCompanyId, !!sellerCompanyId);

  const handleCompetitorSelect = (value: string) => {
    if (value && !competitors.includes(value)) {
      const updatedCompetitors = [...competitors, value];
      onCompetitorsChange?.(updatedCompetitors);
    }
  };

  const handleRemoveCompetitor = (competitorToRemove: string) => {
    const updatedCompetitors = competitors.filter(
      comp => comp !== competitorToRemove
    );
    onCompetitorsChange?.(updatedCompetitors);
  };

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="px-4 py-3 bg-blue-50 rounded-t-lg gap-0 -mt-6">
        <CardTitle className="text-lg font-semibold text-gray-800 ">
          {t("customerInformation")}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-4 space-y-4 -mt-6">
        {/* End Customer Name */}
        <div className="space-y-2">
          <Label htmlFor="customer-name" className="text-sm text-gray-600">
            {t("endCustomerName")}
          </Label>
          <Input
            id="customer-name"
            type="text"
            value={customerName}
            onChange={e => onCustomerNameChange?.(e.target.value)}
            placeholder={t("enterCustomerName")}
            className="w-full"
          />
        </div>

        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="project-name" className="text-sm text-gray-600">
            {t("projectName")}
          </Label>
          <Input
            id="project-name"
            type="text"
            value={projectName}
            onChange={e => onProjectNameChange?.(e.target.value)}
            placeholder={t("enterProjectName")}
            className="w-full"
          />
        </div>

        {/* Competitors */}
        <div className="space-y-2">
          <Label htmlFor="competitors" className="text-sm text-gray-600">
            {t("competitors")}
          </Label>
          <Select
            onValueChange={handleCompetitorSelect}
            disabled={competitorsLoading}
          >
            <SelectTrigger id="competitors" className="w-full">
              <SelectValue
                placeholder={
                  competitorsLoading
                    ? t("loadingCompetitors")
                    : t("selectCompetitors")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {competitorsList.length === 0 ? (
                <SelectItem value="no-competitors" disabled>
                  {t("noCompetitorsAvailable")}
                </SelectItem>
              ) : (
                competitorsList.map((competitor: CompetitorDetail) => (
                  <SelectItem
                    key={competitor.id || competitor.name}
                    value={competitor.name || competitor.competitorName || ""}
                  >
                    {competitor.name || competitor.competitorName || "Unknown"}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Selected Competitors */}
          {competitors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {competitors.map(competitor => (
                <div
                  key={competitor}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  <span>{competitor}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetitor(competitor)}
                    className="ml-1 hover:text-blue-600"
                    aria-label={t("removeCompetitor", { competitor })}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Justification */}
        <div className="space-y-2">
          <Label
            htmlFor="price-justification"
            className="text-sm text-gray-600"
          >
            {t("priceJustification")}
          </Label>
          <Textarea
            id="price-justification"
            value={priceJustification}
            onChange={e => onPriceJustificationChange?.(e.target.value)}
            placeholder={t("enterPriceJustification")}
            className="w-full min-h-[100px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
