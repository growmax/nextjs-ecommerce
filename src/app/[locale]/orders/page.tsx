"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
  const t = useTranslations();

  return (
    <Card className="container mx-auto px-4 py-8">
      <CardContent>
        <CardTitle className="text-3xl font-bold mb-6">
          {t("ecommerce.orders")}
        </CardTitle>

        <Card className="space-y-4 border-0">
          <CardContent className="space-y-4 p-0">
            <Card className="border rounded-lg p-4 bg-white shadow-sm">
              <CardContent>
                <Card className="flex justify-between items-center mb-2 border-0">
                  <CardContent className="text-sm text-gray-600 p-0">
                    Order #12345
                  </CardContent>
                  <Badge
                    variant="secondary"
                    className="text-sm text-green-600 font-semibold"
                  >
                    Delivered
                  </Badge>
                </Card>
                <Card className="grid grid-cols-2 gap-4 text-sm border-0">
                  <CardContent className="p-0">
                    <CardContent className="text-gray-600 p-0">
                      {t("ecommerce.quantity")}:
                    </CardContent>
                    <CardContent className="ml-2 p-0">2</CardContent>
                  </CardContent>
                  <CardContent className="p-0">
                    <CardContent className="text-gray-600 p-0">
                      {t("ecommerce.price")}:
                    </CardContent>
                    <CardContent className="ml-2 p-0">$99.99</CardContent>
                  </CardContent>
                </Card>
                <Card className="mt-3 pt-3 border-t border-0">
                  <CardContent className="flex justify-between font-semibold p-0">
                    <CardContent className="p-0">
                      {t("ecommerce.total")}:
                    </CardContent>
                    <CardContent className="p-0">$199.98</CardContent>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className="border rounded-lg p-4 bg-white shadow-sm">
              <CardContent>
                <Card className="flex justify-between items-center mb-2 border-0">
                  <CardContent className="text-sm text-gray-600 p-0">
                    Order #12346
                  </CardContent>
                  <Badge
                    variant="secondary"
                    className="text-sm text-blue-600 font-semibold"
                  >
                    Processing
                  </Badge>
                </Card>
                <Card className="grid grid-cols-2 gap-4 text-sm border-0">
                  <CardContent className="p-0">
                    <CardContent className="text-gray-600 p-0">
                      {t("ecommerce.quantity")}:
                    </CardContent>
                    <CardContent className="ml-2 p-0">1</CardContent>
                  </CardContent>
                  <CardContent className="p-0">
                    <CardContent className="text-gray-600 p-0">
                      {t("ecommerce.price")}:
                    </CardContent>
                    <CardContent className="ml-2 p-0">$49.99</CardContent>
                  </CardContent>
                </Card>
                <Card className="mt-3 pt-3 border-t border-0">
                  <CardContent className="flex justify-between font-semibold p-0">
                    <CardContent className="p-0">
                      {t("ecommerce.total")}:
                    </CardContent>
                    <CardContent className="p-0">$49.99</CardContent>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
