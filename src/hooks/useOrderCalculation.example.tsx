/**
 * USAGE EXAMPLES for useOrderCalculation Hook
 *
 * This file shows different ways to use the order calculation hook
 * in various scenarios like editing orders, reorders, etc.
 */

import type { CalculationSettings, CartItem } from "@/types/calculation/cart";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useOrderCalculation from "./useOrderCalculation";

// ============================================================================
// EXAMPLE 1: Basic Edit Order Usage
// ============================================================================

export function EditOrderExample() {
  const { watch, setValue } = useFormContext();

  // Watch form fields
  const products = watch("orderDetails[0].dbProductDetails");
  const isInter = watch("orderDetails[0].isInter");
  const taxExemption = watch("taxExemption");

  // Settings (can come from module settings or API)
  const settings: CalculationSettings = {
    roundingAdjustment: true,
    itemWiseShippingTax: false,
  };

  // Calculate using the hook
  const { calculatedData, isCalculating } = useOrderCalculation({
    products: products || [],
    isInter: isInter ?? true,
    taxExemption: taxExemption ?? false,
    settings,
    options: {
      applyVolumeDiscount: true,
      applyCashDiscount: true,
      checkMOQ: true,
    },
  });

  // Update form with calculated values
  useEffect(() => {
    if (calculatedData && !isCalculating) {
      setValue("orderDetails[0].dbProductDetails", calculatedData.products);
      setValue("orderDetails[0].cartValue", calculatedData.cartValue);
      setValue("orderDetails[0].breakup", calculatedData.breakup);
    }
  }, [calculatedData, isCalculating, setValue]);

  return (
    <div>
      {isCalculating && <p>Calculating...</p>}
      <p>Total: ${calculatedData.cartValue.grandTotal}</p>
      {calculatedData.warnings.map((warning, idx) => (
        <div key={idx} className="warning">
          {warning.message}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Reorder Scenario (Reset Shipping & Discounts)
// ============================================================================

export function ReorderExample() {
  const { watch, setValue } = useFormContext();

  const products = watch("orderDetails[0].dbProductDetails");
  const isReorder = watch("isReorder");

  const settings: CalculationSettings = {
    roundingAdjustment: true,
    itemWiseShippingTax: false,
  };

  // For reorder, reset shipping and discounts
  const { calculatedData } = useOrderCalculation({
    products: products || [],
    settings,
    options: {
      resetShipping: isReorder, // Reset shipping charges
      resetDiscounts: isReorder, // Reset cash discounts
      applyVolumeDiscount: true,
    },
  });

  useEffect(() => {
    if (calculatedData) {
      setValue("orderDetails[0].dbProductDetails", calculatedData.products);
      setValue("orderDetails[0].cartValue", calculatedData.cartValue);

      // Reset additional fields for reorder
      if (isReorder) {
        setValue("orderDetails[0].customerRequiredDate", null);
        setValue("comment", null);
      }
    }
  }, [calculatedData, isReorder, setValue]);

  return <div>Reorder Total: ${calculatedData.cartValue.grandTotal}</div>;
}

// ============================================================================
// EXAMPLE 3: Manual Recalculation (After API Fetch)
// ============================================================================

export function ManualRecalculationExample() {
  const { watch, setValue } = useFormContext();

  const products = watch("orderDetails[0].dbProductDetails");
  const settings: CalculationSettings = {
    roundingAdjustment: true,
    itemWiseShippingTax: false,
  };

  const { calculatedData } = useOrderCalculation({
    products: products || [],
    settings,
  });

  // Fetch latest data and recalculate
  const handleFetchLatestData = async () => {
    try {
      // Fetch from API
      const response = await fetch("/api/order/latest-data");
      const latestData = await response.json();

      // Update products with latest data
      const updatedProducts = products.map((product: CartItem) => {
        const latest = latestData.find(
          (d: any) => d.productId === product.productId
        );
        return latest ? { ...product, ...latest } : product;
      });

      setValue("orderDetails[0].dbProductDetails", updatedProducts);

      // Recalculate will happen automatically via useMemo dependency
    } catch {}
  };

  return (
    <div>
      <button onClick={handleFetchLatestData}>Refresh Latest Prices</button>
      <p>Total: ${calculatedData.cartValue.grandTotal}</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: With Volume Discount
// ============================================================================

export function VolumeDiscountExample() {
  const { watch, setValue } = useFormContext();

  const products = watch("orderDetails[0].dbProductDetails");
  const VolumeDiscountAvailable = watch(
    "orderDetails[0].VolumeDiscountAvailable"
  );
  const VDapplied = watch("orderDetails[0].VDapplied");

  const settings: CalculationSettings = {
    roundingAdjustment: true,
  };

  // Only apply VD if available and user opted in
  const { calculatedData } = useOrderCalculation({
    products: products || [],
    settings,
    options: {
      applyVolumeDiscount: VolumeDiscountAvailable && VDapplied,
    },
  });

  useEffect(() => {
    if (calculatedData) {
      setValue("orderDetails[0].dbProductDetails", calculatedData.products);
      setValue("orderDetails[0].cartValue", calculatedData.cartValue);
    }
  }, [calculatedData, setValue]);

  return (
    <div>
      {calculatedData.metadata.hasVolumeDiscount && (
        <div className="success">
          Volume discount applied! Saved: $
          {calculatedData.cartValue.totalBasicDiscount}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: With Additional Charges (Shipping, Insurance, PF)
// ============================================================================

export function AdditionalChargesExample() {
  const { watch, setValue } = useFormContext();

  const products = watch("orderDetails[0].dbProductDetails");
  const overallShipping = watch("orderDetails[0].overallShipping");
  const insuranceCharges = watch("orderDetails[0].orderTerms.insuranceValue");
  const pfRate = watch("orderDetails[0].orderTerms.pfRate");

  const settings: CalculationSettings = {
    roundingAdjustment: true,
    itemWiseShippingTax: true,
  };

  const { calculatedData } = useOrderCalculation({
    products: products || [],
    shippingCharges: overallShipping || 0,
    insuranceCharges: insuranceCharges || 0,
    pfRate: pfRate || 0,
    settings,
  });

  useEffect(() => {
    if (calculatedData) {
      setValue("orderDetails[0].dbProductDetails", calculatedData.products);
      setValue("orderDetails[0].cartValue", calculatedData.cartValue);
    }
  }, [calculatedData, setValue]);

  return (
    <div>
      <p>Subtotal: ${calculatedData.cartValue.totalValue}</p>
      <p>Shipping: ${calculatedData.cartValue.totalShipping}</p>
      <p>Insurance: ${calculatedData.cartValue.insuranceCharges}</p>
      <p>PF Rate: ${calculatedData.cartValue.pfRate}</p>
      <p>Tax: ${calculatedData.cartValue.totalTax}</p>
      <hr />
      <p>
        <strong>Grand Total: ${calculatedData.cartValue.grandTotal}</strong>
      </p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: With Currency Conversion
// ============================================================================

export function CurrencyConversionExample() {
  const { watch } = useFormContext();

  const products = watch("orderDetails[0].dbProductDetails");
  const currencyFactor = watch("orderDetails[0].currencyFactor");
  const buyerCurrencySymbol = watch("buyerCurrencySymbol");

  const settings: CalculationSettings = {
    roundingAdjustment: true,
  };

  const { calculatedData } = useOrderCalculation({
    products: products || [],
    currencyFactor: currencyFactor || 1,
    settings,
  });

  // Convert totals to buyer currency
  const grandTotalInBuyerCurrency =
    calculatedData.cartValue.grandTotal * (currencyFactor || 1);

  return (
    <div>
      <p>Total (Base Currency): ${calculatedData.cartValue.grandTotal}</p>
      <p>
        Total ({buyerCurrencySymbol?.currencyCode}):
        {buyerCurrencySymbol?.currencySymbol}
        {grandTotalInBuyerCurrency.toFixed(2)}
      </p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: With Warnings Display
// ============================================================================

export function WarningsExample() {
  const { watch } = useFormContext();

  const products = watch("orderDetails[0].dbProductDetails");

  const settings: CalculationSettings = {
    roundingAdjustment: true,
  };

  const { calculatedData } = useOrderCalculation({
    products: products || [],
    settings,
    options: {
      checkMOQ: true,
    },
  });

  const getWarningColor = (type: string) => {
    switch (type) {
      case "moq":
        return "orange";
      case "negative_price":
        return "red";
      case "pricing":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <div>
      {calculatedData.warnings.length > 0 && (
        <div className="warnings-container">
          <h3>⚠️ Calculation Warnings</h3>
          {calculatedData.warnings.map((warning, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: getWarningColor(warning.type),
                padding: "10px",
                margin: "5px 0",
                borderRadius: "4px",
              }}
            >
              <strong>{warning.type.toUpperCase()}</strong>: {warning.message}
              <br />
              <small>Product ID: {warning.productId}</small>
            </div>
          ))}
        </div>
      )}

      {calculatedData.metadata.hasNegativePrices && (
        <div style={{ color: "red", fontWeight: "bold" }}>
          ⚠️ Some products have negative prices after discounts!
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Complete Edit Order Flow
// ============================================================================

export function CompleteEditOrderFlow() {
  const { watch, setValue } = useFormContext();

  // Watch all necessary fields
  const selectedVersion = watch("selectedVersion");
  const products = watch(`orderDetails[${selectedVersion}].dbProductDetails`);
  const isInter = watch(`orderDetails[${selectedVersion}].isInter`);
  const taxExemption = watch("taxExemption");
  const isReorder = watch("isReorder");
  const VolumeDiscountAvailable = watch(
    `orderDetails[${selectedVersion}].VolumeDiscountAvailable`
  );
  const VDapplied = watch(`orderDetails[${selectedVersion}].VDapplied`);
  const overallShipping = watch(
    `orderDetails[${selectedVersion}].overallShipping`
  );
  const orderTerms = watch("orderDetails[0].orderTerms");

  const settings: CalculationSettings = {
    roundingAdjustment: true,
    itemWiseShippingTax: false,
  };

  // Full calculation with all options
  const { calculatedData, isCalculating } = useOrderCalculation({
    products: products || [],
    isInter: isInter ?? true,
    taxExemption: taxExemption ?? false,
    shippingCharges: overallShipping || 0,
    insuranceCharges: orderTerms?.insuranceValue || 0,
    pfRate: orderTerms?.pfRate || 0,
    precision: 2,
    settings,
    options: {
      applyVolumeDiscount: VolumeDiscountAvailable && VDapplied,
      applyCashDiscount: true,
      applyBasicDiscount: true,
      handleBundles: true,
      checkMOQ: true,
      applyRounding: true,
      resetShipping: isReorder,
      resetDiscounts: isReorder,
    },
  });

  // Update form when calculation completes
  useEffect(() => {
    if (calculatedData && !isCalculating) {
      // Update products
      setValue(`orderDetails[0].dbProductDetails`, calculatedData.products);

      // Update cart value
      setValue(`orderDetails[0].cartValue`, calculatedData.cartValue);

      // Update breakup
      setValue(`orderDetails[0].breakup`, calculatedData.breakup);

      // Reset additional fields for reorder
      if (isReorder) {
        setValue("orderDetails[0].customerRequiredDate", null);
        setValue("comment", null);
      }

      // Set loading to false
      setValue("isLoading", false);
    }
  }, [calculatedData, isCalculating, isReorder, setValue]);

  return (
    <div>
      {isCalculating && <div>Calculating order...</div>}

      {/* Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        <p>Products: {calculatedData.metadata.totalProducts}</p>
        <p>Subtotal: ${calculatedData.cartValue.totalValue.toFixed(2)}</p>
        <p>
          Discounts: -${calculatedData.cartValue.totalBasicDiscount.toFixed(2)}
        </p>
        <p>Shipping: ${calculatedData.cartValue.totalShipping.toFixed(2)}</p>
        <p>Tax: ${calculatedData.cartValue.totalTax.toFixed(2)}</p>
        <hr />
        <p>
          <strong>
            Grand Total: ${calculatedData.cartValue.grandTotal.toFixed(2)}
          </strong>
        </p>
      </div>

      {/* Warnings */}
      {calculatedData.warnings.length > 0 && (
        <div className="warnings">
          {calculatedData.warnings.map((w, i) => (
            <div key={i}>{w.message}</div>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="metadata">
        <small>
          Calculated at:{" "}
          {new Date(
            calculatedData.metadata.calculationTimestamp
          ).toLocaleString()}
          <br />
          Volume Discount:{" "}
          {calculatedData.metadata.hasVolumeDiscount ? "✅" : "❌"}
          <br />
          Cash Discount: {calculatedData.metadata.hasCashDiscount ? "✅" : "❌"}
        </small>
      </div>
    </div>
  );
}
