"use client";

import { useTenant } from "@/contexts/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Globe, Hash, DollarSign } from "lucide-react";

export function TenantInfo() {
  const { tenant, company, currency, isLoading, error } = useTenant();

  if (isLoading) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">
              Loading tenant data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-red-600">
              ⚠️ Tenant Error: {error}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tenant || !company || !currency) {
    return (
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <span className="text-sm text-yellow-700">
            ⚠️ No tenant data available
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-green-800 flex items-center">
          <Building className="h-4 w-4 mr-2" />
          Tenant Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Tenant ID */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">
              Tenant ID:
            </span>
          </div>
          <Badge variant="outline" className="bg-white">
            {tenant.id}
          </Badge>
        </div>

        {/* Tenant Code */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Code:</span>
          <Badge variant="secondary">{tenant.tenantCode}</Badge>
        </div>

        {/* Company Name */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Company:</span>
          <span className="text-xs text-gray-600 max-w-[150px] truncate">
            {company.name}
          </span>
        </div>

        {/* Domain */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Globe className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Domain:</span>
          </div>
          <span className="text-xs text-gray-600 max-w-[120px] truncate">
            {tenant.tenantDomain}
          </span>
        </div>

        {/* Currency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Currency:</span>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            {currency.currencyCode}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple version for quick debugging
export function TenantDebug() {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return <div className="text-xs text-gray-500">Loading tenant...</div>;
  }

  return (
    <div className="text-xs text-gray-600 p-2 bg-gray-100 rounded">
      <strong>Tenant ID:</strong> {tenant?.id || "N/A"} |<strong> Code:</strong>{" "}
      {tenant?.tenantCode || "N/A"}
    </div>
  );
}
