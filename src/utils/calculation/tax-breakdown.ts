import cloneDeep from "lodash/cloneDeep";
import compact from "lodash/compact";
import each from "lodash/each";
import flatten from "lodash/flatten";
import map from "lodash/map";
import remove from "lodash/remove";
import uniqBy from "lodash/uniqBy";

/**
 * Sets tax breakup for products based on inter/intra state
 * @param productArr Array of products
 * @param isInter Boolean indicating inter-state (true) or intra-state (false)
 * @returns Array of tax breakups
 */
export function setTaxBreakup(productArr: any[], isInter: boolean) {
  if (!productArr || productArr.length === 0) {
    return [];
  }

  const compoundInter: any[] = [];
  const compoundIntra: any[] = [];
  let breakups: any[] = [];

  // Clone products to avoid mutation
  const clonedProducts = cloneDeep(productArr);

  each(clonedProducts, item => {
    if (!item.hsnDetails) return;

    if (isInter) {
      if (item.hsnDetails?.interTax?.taxReqLs) {
        const removed = remove(item.hsnDetails.interTax.taxReqLs, [
          "compound",
          true,
        ]);
        if (removed[0]) {
          compoundInter.push(removed[0]);
        }
      }
    } else {
      if (item.hsnDetails?.intraTax?.taxReqLs) {
        const removed = remove(item.hsnDetails.intraTax.taxReqLs, [
          "compound",
          true,
        ]);
        if (removed[0]) {
          compoundIntra.push(removed[0]);
        }
      }
    }
  });

  const productWiseHsn = map(clonedProducts, item => item.hsnDetails).filter(
    Boolean
  );

  if (productWiseHsn.length === 0) {
    return [];
  }

  if (isInter) {
    const productWiseInter = map(productWiseHsn, item => item?.interTax).filter(
      Boolean
    );
    const interBreakup = map(productWiseInter, item => item?.taxReqLs).filter(
      Boolean
    );
    const breakupInterFinal = uniqBy(flatten(interBreakup), "taxName");
    if (compoundInter.length > 0) {
      breakupInterFinal.push(uniqBy(compoundInter, "taxName"));
    }
    breakups = compact(flatten(breakupInterFinal));
  } else {
    const productWiseIntra = map(productWiseHsn, item => item?.intraTax).filter(
      Boolean
    );
    const breakup = map(productWiseIntra, item => item?.taxReqLs).filter(
      Boolean
    );
    const breakupIntraFinal = uniqBy(flatten(breakup), "taxName");
    if (compoundIntra.length > 0) {
      breakupIntraFinal.push(uniqBy(compoundIntra, "taxName"));
    }
    breakups = compact(flatten(breakupIntraFinal));
  }

  return breakups;
}

/**
 * Calculate shipping tax and update cart value with tax breakdown
 * @param totalShipping Total shipping charges
 * @param cartValue Current cart value object
 * @param products Array of products
 * @param isBeforeTax Whether shipping is before tax
 * @param isInter Inter-state or intra-state
 * @param roundOff Decimal precision for rounding
 * @param itemWiseShippingTax Whether to calculate shipping tax per item
 * @returns Updated cart value and products with tax breakdown
 */
export function calculateShippingTax(
  totalShipping: number,
  cartValue: any,
  products: any[],
  isBeforeTax: boolean,
  isInter: boolean,
  roundOff: number = 2,
  itemWiseShippingTax: boolean = false
) {
  let totalTaxIncShipping = 0;
  const tempCartValue = cloneDeep(cartValue);
  const tempProducts = cloneDeep(products);

  // Get tax breakup
  const breakup = setTaxBreakup(tempProducts, isInter);

  // Initialize tax totals
  each(breakup, tax => {
    tempCartValue[`${tax.taxName}Total`] = 0;
  });

  // Initialize shippingTax outside the product loop
  let totalShippingTax = 0;

  tempProducts.forEach((data, index) => {
    let intraTotalTax = 0;
    let shippingCompound = 0;

    if (data.showPrice !== false) {
      if (breakup?.length > 0) {
        each(breakup, taxBreakup => {
          // Get tax percentage - try multiple sources to ensure we have it
          // 1. From product (set by calculateItemTaxes)
          // 2. From product's taxBreakup (interTaxBreakup or intraTaxBreakup)
          // 3. From taxBreakup.rate (from setTaxBreakup)
          let taxPercentage = data[taxBreakup?.taxName] || 0;
          
          // If not on product, try to get from product's taxBreakup
          if (!taxPercentage && data.hsnDetails) {
            const taxBreakupList = isInter 
              ? data.hsnDetails?.interTax?.taxReqLs 
              : data.hsnDetails?.intraTax?.taxReqLs;
            if (taxBreakupList) {
              const matchingTax = taxBreakupList.find(
                (t: any) => t.taxName === taxBreakup.taxName
              );
              if (matchingTax) {
                taxPercentage = matchingTax.rate || 0;
              }
            }
          }
          
          // If still not found, try from taxBreakup.rate (from setTaxBreakup result)
          if (!taxPercentage && (taxBreakup as any).rate) {
            taxPercentage = (taxBreakup as any).rate;
          }
          
          // Set the tax percentage on the product if it wasn't set
          if (!data[taxBreakup.taxName] && taxPercentage > 0) {
            data[taxBreakup.taxName] = taxPercentage;
          }
          
          const percentage = itemWiseShippingTax
            ? taxPercentage
            : 0;

          if (index === 0) {
            tempCartValue[`${taxBreakup.taxName}Total`] = 0;
          }

          // Set taxable amount
          if (isBeforeTax && itemWiseShippingTax) {
            data.itemTaxableAmount =
              data.unitPrice +
              data.pfRate / data.askedQuantity +
              data.shippingCharges;
          } else {
            data.itemTaxableAmount =
              data.unitPrice + data.pfRate / data.askedQuantity;
          }

          // Calculate tax for each breakup
          // CRITICAL: Always use discounted totalPrice (after cash discount) for tax calculation
          // This ensures tax is calculated on subtotal (5,565.42) not original (5,679.00)
          // Reference: getBreakupTax uses item.totalPrice which should have cash discount applied (line 643, 679)
          let taxableBase = data.totalPrice + data.pfRate;

          // If cash discount is applied, ensure we use the discounted price
          // The totalPrice should already be discounted from cartCalculation, but verify
          if (data.cashdiscountValue && data.cashdiscountValue > 0) {
            // Calculate discounted total from discounted unitPrice
            // This ensures we use the correct base: quantity * discounted unitPrice
            const quantity = data.quantity || data.askedQuantity || 1;
            const discountedTotal = quantity * data.unitPrice;
            // Use discounted total for tax calculation (this is the subtotal after cash discount)
            taxableBase = discountedTotal + data.pfRate;
          }

          if (!taxBreakup.compound) {
            data[`${taxBreakup.taxName}Value`] = taxPercentage
              ? parseFloat(
                  (
                    (taxableBase * taxPercentage) / 100
                  ).toFixed(roundOff)
                )
              : 0;
            intraTotalTax += data[`${taxBreakup.taxName}Value`];
          } else {
            data[`${taxBreakup.taxName}Value`] = taxPercentage
              ? parseFloat(
                  ((intraTotalTax * taxPercentage) / 100).toFixed(
                    roundOff
                  )
                )
              : 0;
          }

          // Accumulate tax totals per tax type across all products
          // Reference: buyer-fe getBreakupTax line 665, 701 - cartValue[`${taxName}Total`] += item[`${taxName}Value`]
          tempCartValue[`${taxBreakup.taxName}Total`] +=
            data[`${taxBreakup.taxName}Value`];

          if (!itemWiseShippingTax) {
            // Calculate shipping tax only once after all products are processed
            // Don't accumulate here - we'll do it after the loop
          } else {
            if (!taxBreakup.compound) {
              data.shippingTax = isBeforeTax
                ? parseFloat(
                    (
                      (data.shippingCharges * data.askedQuantity * percentage) /
                      100
                    ).toFixed(roundOff)
                  )
                : 0;
              tempCartValue[`${taxBreakup.taxName}Total`] += data.shippingTax;
              shippingCompound += data.shippingTax;
            } else {
              data.shippingTax = isBeforeTax
                ? parseFloat(
                    ((shippingCompound * percentage) / 100).toFixed(roundOff)
                  )
                : 0;
              tempCartValue[`${taxBreakup.taxName}Total`] += data.shippingTax;
            }
          }
        });
      } else {
        tempCartValue.shippingTax = 0;
      }
    }
  });

  // After all products are processed, calculate shipping tax and sum all tax totals
  // Reference: buyer-fe useCalculation.js lines 391-394
  if (breakup?.length > 0 && !itemWiseShippingTax) {
    // Calculate shipping tax based on total shipping and tax percentage
    // Use the first tax percentage as representative (or calculate average)
    const firstTax = breakup[0];
    const taxPercentage = firstTax?.rate || 0;
    tempCartValue.shippingTax = isBeforeTax
      ? parseFloat(
          (totalShipping * (taxPercentage / 100)).toFixed(roundOff)
        )
      : 0;
  }

  // Sum all tax totals to get totalTax
  // Reference: buyer-fe useCalculation.js line 391 - tempCartValue.totalTax = totalTaxIncShipping || 0
  totalTaxIncShipping = tempCartValue.shippingTax || 0;
  each(breakup, taxBreakup => {
    totalTaxIncShipping += tempCartValue[`${taxBreakup.taxName}Total`] || 0;
  });

  tempCartValue.totalTax = totalTaxIncShipping || 0;
  tempCartValue.taxableAmount = isBeforeTax
    ? tempCartValue.totalValue + tempCartValue.pfRate + totalShipping
    : tempCartValue.totalValue + tempCartValue.pfRate;

  // Recalculate calculatedTotal after updating totalTax
  // Reference: buyer-fe useCalculation.js lines 395-407
  // This ensures calculatedTotal uses the correct totalTax value (not the old one from calculateCart)
  const totalBeforeInsurance =
    tempCartValue.totalValue +
    (totalTaxIncShipping || 0) +
    tempCartValue.pfRate +
    totalShipping;

  // Preserve insuranceCharges from input cartValue (already calculated in calculateCart)
  const insuranceCharges = tempCartValue.insuranceCharges || 0;

  const grandTotal = totalBeforeInsurance + insuranceCharges;
  tempCartValue.calculatedTotal = grandTotal;

  // Preserve rounding adjustment settings if they exist
  const roundingAdjustment = tempCartValue.roundingAdjustment !== undefined 
    ? tempCartValue.roundingAdjustment 
    : 0;
  
  // Only recalculate grandTotal if roundingAdjustment is enabled
  // Otherwise, grandTotal should equal calculatedTotal
  if (roundingAdjustment !== 0) {
    tempCartValue.grandTotal = Math.round(grandTotal);
    tempCartValue.roundingAdjustment = tempCartValue.grandTotal - grandTotal;
  } else {
    tempCartValue.grandTotal = grandTotal;
    tempCartValue.roundingAdjustment = 0;
  }

  return {
    cartValue: tempCartValue,
    products: tempProducts,
    breakup: breakup,
  };
}
