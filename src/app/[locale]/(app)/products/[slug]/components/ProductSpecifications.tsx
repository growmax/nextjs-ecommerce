"use client";

import { ProductDetail } from "@/types/product/product-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { hasSpecifications } from "@/utils/product/product-formatter";

interface ProductSpecificationsProps {
  product: ProductDetail;
}

export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const hasSpecs = hasSpecifications(product);

  if (!hasSpecs) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="specifications">
          <AccordionItem value="specifications">
            <AccordionTrigger className="text-lg font-semibold">
              Product Specifications
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2">
                {product.product_specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-3 border-b last:border-0"
                  >
                    <span className="text-muted-foreground font-medium">
                      {spec.name}:
                    </span>
                    <span className="font-medium text-right">
                      {spec.value}
                      {spec.unit && ` ${spec.unit}`}
                    </span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Product Attributes */}
          {product.set_product_atributes && product.set_product_atributes.length > 0 && (
            <AccordionItem value="attributes">
              <AccordionTrigger className="text-lg font-semibold">
                Product Attributes
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {product.set_product_atributes.map((attr, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-3 border-b last:border-0"
                    >
                      <span className="text-muted-foreground font-medium">
                        {attr.attributeName}:
                      </span>
                      <span className="font-medium text-right">
                        {attr.attributeValue}
                        {attr.attributeUnit && ` ${attr.attributeUnit}`}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Accessories */}
          {product.product_accessorieses && product.product_accessorieses.length > 0 && (
            <AccordionItem value="accessories">
              <AccordionTrigger className="text-lg font-semibold">
                Accessories
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3">
                  {product.product_accessorieses.map((accessory, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 border-b last:border-0"
                    >
                      <div>
                        <span className="font-medium">
                          {accessory.accessoryName}
                        </span>
                        {accessory.isDefault && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                        {accessory.quantity && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            Qty: {accessory.quantity}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold">
                        ₹{accessory.accessoryPrice}
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}

