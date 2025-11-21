"use client";

import { useState } from "react";
import { ProductDetail } from "@/types/product/product-detail";
import { VariantData } from "@/lib/api/services/VariantService";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface VariantDebugInfoProps {
  product: ProductDetail;
  variants: VariantData[];
  error: string | null;
  isLoading: boolean;
  elasticIndex: string;
  context: {
    origin: string;
    tenantCode: string;
  };
}

export default function VariantDebugInfo({
  product,
  variants,
  error,
  isLoading,
  elasticIndex,
  context,
}: VariantDebugInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV === "production") {
    return null; // Don't show debug info in production
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          Debug Info
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <div className="space-y-4 text-xs font-mono">
          <div>
            <h4 className="font-bold mb-2">Product Info:</h4>
            <div>Product ID: {product.product_id}</div>
            <div>Group ID: {product.product_group_id}</div>
            <div>Title: {product.title}</div>
            <div>Published: {product.is_published ? "Yes" : "No"}</div>
          </div>

          <div>
            <h4 className="font-bold mb-2">API Info:</h4>
            <div>Elastic Index: {elasticIndex}</div>
            <div>Origin: {context.origin}</div>
            <div>Tenant: {context.tenantCode}</div>
          </div>

          <div>
            <h4 className="font-bold mb-2">Loading State:</h4>
            <div>Loading: {isLoading ? "Yes" : "No"}</div>
            <div>Error: {error || "None"}</div>
            <div>Variants Found: {variants.length}</div>
          </div>

          {variants.length > 0 && (
            <div>
              <h4 className="font-bold mb-2">Sample Variant:</h4>
              <div>ID: {variants[0]?.product_id}</div>
              <div>Attributes: {JSON.stringify(variants[0]?.attributes || {})}</div>
              <div>Images: {variants[0]?.images?.length || 0}</div>
              <div>Price: {variants[0]?.pricing?.unit_list_price || 0}</div>
            </div>
          )}

          <div>
            <h4 className="font-bold mb-2">Product Assets:</h4>
            <div>Total Assets: {product.product_assetss?.length || 0}</div>
            {product.product_assetss?.slice(0, 3).map((asset, index) => (
              <div key={index} className="ml-2">
                {index + 1}. {asset.source} (Default: {asset.isDefault ? "Yes" : "No"})
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
