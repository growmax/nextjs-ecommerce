/**
 * Example usage of useTenantData hook
 *
 * This file shows how to use the useTenantData hook in your components
 */

"use client";

import Image from "next/image";
import { useTenantData } from "./useTenantData";

export function TenantDataExample() {
  const { tenantData, loading, error } = useTenantData();

  if (loading) {
    return <div>Loading tenant data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!tenantData) {
    return <div>No tenant data available</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tenant Configuration</h2>

      <div className="space-y-4">
        {/* Tenant Information */}
        <section>
          <h3 className="font-bold text-lg mb-2">Tenant Information</h3>
          <div className="space-y-1">
            <div>
              <strong>Tenant Code:</strong> {tenantData.tenant?.tenantCode}
            </div>
            <div>
              <strong>Tenant ID:</strong> {tenantData.tenant?.id}
            </div>
            <div>
              <strong>Domain:</strong> {tenantData.tenant?.tenantDomain}
            </div>
            <div>
              <strong>Description:</strong>{" "}
              {tenantData.tenant?.tenantDescription}
            </div>
            <div>
              <strong>Elastic Code:</strong> {tenantData.tenant?.elasticCode}
            </div>
            <div>
              <strong>TypeSense Code:</strong>{" "}
              {tenantData.tenant?.typeSenseCode}
            </div>
            <div>
              <strong>TypeSense Key:</strong> {tenantData.tenant?.typeSenseKey}
            </div>
          </div>
        </section>

        <hr className="my-4" />

        {/* Seller Company Information */}
        <section>
          <h3 className="font-bold text-lg mb-2">Seller Company</h3>
          <div className="space-y-1">
            <div>
              <strong>Company ID:</strong> {tenantData.sellerCompanyId?.id}
            </div>
            <div>
              <strong>Company Name:</strong> {tenantData.sellerCompanyId?.name}
            </div>
            <div>
              <strong>Identifier:</strong>{" "}
              {tenantData.sellerCompanyId?.companyIdentifier}
            </div>
            <div>
              <strong>Email:</strong> {tenantData.sellerCompanyId?.defaultEmail}
            </div>
            <div>
              <strong>Website:</strong> {tenantData.sellerCompanyId?.website}
            </div>
            <div>
              <strong>Verified:</strong>{" "}
              {tenantData.sellerCompanyId?.verified ? "Yes" : "No"}
            </div>
            {tenantData.sellerCompanyId?.logo && (
              <div>
                <strong>Logo:</strong>{" "}
                <Image
                  src={tenantData.sellerCompanyId.logo}
                  alt="Company Logo"
                  width={48}
                  height={48}
                  className="h-12"
                />
              </div>
            )}
          </div>
        </section>

        <hr className="my-4" />

        {/* Currency Information */}
        <section>
          <h3 className="font-bold text-lg mb-2">Currency</h3>
          <div className="space-y-1">
            <div>
              <strong>Currency ID:</strong> {tenantData.sellerCurrency?.id}
            </div>
            <div>
              <strong>Code:</strong> {tenantData.sellerCurrency?.currencyCode}
            </div>
            <div>
              <strong>Symbol:</strong> {tenantData.sellerCurrency?.symbol}
            </div>
            <div>
              <strong>Description:</strong>{" "}
              {tenantData.sellerCurrency?.description}
            </div>
            <div>
              <strong>Precision:</strong> {tenantData.sellerCurrency?.precision}
            </div>
            <div>
              <strong>Decimal Separator:</strong>{" "}
              {tenantData.sellerCurrency?.decimal}
            </div>
            <div>
              <strong>Thousand Separator:</strong>{" "}
              {tenantData.sellerCurrency?.thousand}
            </div>
          </div>
        </section>

        <hr className="my-4" />

        {/* Business Information */}
        <section>
          <h3 className="font-bold text-lg mb-2">Business Information</h3>
          <div className="space-y-1">
            <div>
              <strong>Business Type:</strong>{" "}
              {tenantData.sellerCompanyId?.businessTypeId?.name}
            </div>
            <div>
              <strong>Industry:</strong>{" "}
              {tenantData.sellerCompanyId?.subIndustryId?.industryId?.name}
            </div>
            <div>
              <strong>Sub-Industry:</strong>{" "}
              {tenantData.sellerCompanyId?.subIndustryId?.name}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Simple usage example
export function SimpleTenantDataUsage() {
  const { tenantData, loading } = useTenantData();

  if (loading) return null;

  return (
    <div>
      <p>Current Tenant: {tenantData?.tenant?.tenantCode}</p>
      <p>Company: {tenantData?.sellerCompanyId?.name}</p>
      <p>
        Currency: {tenantData?.sellerCurrency?.symbol} (
        {tenantData?.sellerCurrency?.currencyCode})
      </p>
    </div>
  );
}

// Price formatter example
export function PriceDisplay({ amount }: { amount: number }) {
  const { tenantData } = useTenantData();

  if (!tenantData) return null;

  const formatPrice = (value: number) => {
    const precision = tenantData.sellerCurrency?.precision || 2;
    const decimal = tenantData.sellerCurrency?.decimal || ".";
    const thousand = tenantData.sellerCurrency?.thousand || ",";

    const parts = value.toFixed(precision).split(".");
    parts[0] = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, thousand) || "";

    return `${tenantData.sellerCurrency?.symbol} ${parts.join(decimal)}`;
  };

  return <span>{formatPrice(amount)}</span>;
}
