"use client";

import { ProductDetail } from "@/types/product/product-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getCategoryBreadcrumb } from "@/utils/product/product-formatter";

interface ProductInfoProps {
  product: ProductDetail;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const brandName = product.brand_name || product.brands_name || "Generic";
  const categoryBreadcrumb = getCategoryBreadcrumb(product);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tax">Tax & HSN</TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-4">
            {product.product_description ? (
              <div className="prose max-w-none">
                <p className="text-foreground whitespace-pre-wrap">
                  {product.product_description}
                </p>
              </div>
            ) : product.product_short_description ? (
              <div className="prose max-w-none">
                <p className="text-foreground">
                  {product.product_short_description}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No description available for this product.
              </p>
            )}

            {/* Category Breadcrumb */}
            {categoryBreadcrumb.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Categories:</h4>
                <div className="flex flex-wrap gap-2">
                  {categoryBreadcrumb.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="font-medium">{brandName}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{product.brand_product_id}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Product Code:</span>
                  <span className="font-medium">{product.product_index_name}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Product ID:</span>
                  <span className="font-medium">{product.product_id}</span>
                </div>

                {product.unit_of_measure && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Unit of Measure:</span>
                    <span className="font-medium">{product.unit_of_measure}</span>
                  </div>
                )}

                {product.min_order_quantity && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Min Order Qty:</span>
                    <span className="font-medium">{product.min_order_quantity}</span>
                  </div>
                )}

                {product.packaging_qty && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Packaging Qty:</span>
                    <span className="font-medium">{product.packaging_qty}</span>
                  </div>
                )}

                {product.outer_pack_qty && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Outer Pack Qty:</span>
                    <span className="font-medium">{product.outer_pack_qty}</span>
                  </div>
                )}

                {product.net_weight && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Net Weight:</span>
                    <span className="font-medium">{product.net_weight}</span>
                  </div>
                )}

                {product.packaging_dimension && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">{product.packaging_dimension}</span>
                  </div>
                )}

                {product.standard_lead_time && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Lead Time:</span>
                    <span className="font-medium">
                      {product.standard_lead_time} {product.lead_uom}
                    </span>
                  </div>
                )}
              </div>

              {/* Business Unit Info */}
              {(product.business_unit_name || product.division_name) && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">Business Information</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {product.business_unit_name && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Business Unit:</span>
                        <span className="font-medium">{product.business_unit_name}</span>
                      </div>
                    )}
                    
                    {product.division_name && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Division:</span>
                        <span className="font-medium">{product.division_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Flags */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Product Attributes</h4>
                <div className="flex flex-wrap gap-2">
                  {product.is_new && <Badge variant="default">New</Badge>}
                  {product.is_brand_stock && <Badge variant="secondary">Brand Stock</Badge>}
                  {product.is_b2c && <Badge variant="secondary">B2C</Badge>}
                  {product.is_bundle && <Badge variant="secondary">Bundle</Badge>}
                  {product.is_custom_product && <Badge variant="secondary">Custom</Badge>}
                  {product.is_discontinued && <Badge variant="destructive">Discontinued</Badge>}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tax & HSN Tab */}
          <TabsContent value="tax" className="space-y-4">
            <div className="space-y-4">
              {/* HSN Code Information */}
              <div>
                <h4 className="text-sm font-semibold mb-3">HSN Classification</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">HSN Code:</span>
                    <span className="font-medium">{product.hsn_code}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">HSN Description:</span>
                    <span className="font-medium">{product.hsn_description}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Total Tax Rate:</span>
                    <span className="font-medium">{product.hsn_tax}%</span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Tax Inclusive:</span>
                    <span className="font-medium">
                      {product.is_tax_inclusive ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax Breakup */}
              {product.hsn_tax_breakup && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">Tax Breakup</h4>
                  
                  {/* Intra-State Tax (CGST + SGST) */}
                  {product.hsn_tax_breakup.intraTax && (
                    <div className="mb-4">
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">
                        Intra-State Tax ({product.hsn_tax_breakup.intraTax.taxGroupName})
                      </h5>
                      <div className="space-y-2">
                        {product.hsn_tax_breakup.intraTax.taxReqLs?.map((tax) => (
                          <div 
                            key={tax.id} 
                            className="flex justify-between py-1 text-sm"
                          >
                            <span className="text-muted-foreground">{tax.taxName}:</span>
                            <span className="font-medium">{tax.rate}%</span>
                          </div>
                        ))}
                        <div className="flex justify-between py-2 border-t font-medium">
                          <span>Total:</span>
                          <span>{product.hsn_tax_breakup.intraTax.totalTax}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inter-State Tax (IGST) */}
                  {product.hsn_tax_breakup.interTax && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">
                        Inter-State Tax ({product.hsn_tax_breakup.interTax.taxGroupName})
                      </h5>
                      <div className="space-y-2">
                        {product.hsn_tax_breakup.interTax.taxReqLs?.map((tax) => (
                          <div 
                            key={tax.id} 
                            className="flex justify-between py-1 text-sm"
                          >
                            <span className="text-muted-foreground">{tax.taxName}:</span>
                            <span className="font-medium">{tax.rate}%</span>
                          </div>
                        ))}
                        <div className="flex justify-between py-2 border-t font-medium">
                          <span>Total:</span>
                          <span>{product.hsn_tax_breakup.interTax.totalTax}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

