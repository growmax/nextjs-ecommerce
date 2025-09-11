"use client";

import React from "react";
import { useSafeTranslation } from "@/hooks/use-safe-translation";

export default function OrdersPage() {
  const { t } = useSafeTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {t("ecommerce.orders", "Orders")}
      </h1>

      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Order #12345</span>
            <span className="text-sm text-green-600 font-semibold">
              Delivered
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">
                {t("ecommerce.quantity", "Quantity")}:
              </span>
              <span className="ml-2">2</span>
            </div>
            <div>
              <span className="text-gray-600">
                {t("ecommerce.price", "Price")}:
              </span>
              <span className="ml-2">$99.99</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between font-semibold">
              <span>{t("ecommerce.total", "Total")}:</span>
              <span>$199.98</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Order #12346</span>
            <span className="text-sm text-blue-600 font-semibold">
              Processing
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">
                {t("ecommerce.quantity", "Quantity")}:
              </span>
              <span className="ml-2">1</span>
            </div>
            <div>
              <span className="text-gray-600">
                {t("ecommerce.price", "Price")}:
              </span>
              <span className="ml-2">$49.99</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between font-semibold">
              <span>{t("ecommerce.total", "Total")}:</span>
              <span>$49.99</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
