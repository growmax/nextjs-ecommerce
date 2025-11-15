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

  tempProducts.forEach((data, index) => {
    let shippingTax = 0;
    let intraTotalTax = 0;
    let shippingCompound = 0;

    if (data.showPrice !== false) {
      if (breakup?.length > 0) {
        each(breakup, taxBreakup => {
          const percentage = itemWiseShippingTax
            ? data[taxBreakup?.taxName] || 0
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
          if (!taxBreakup.compound) {
            data[`${taxBreakup.taxName}Value`] = data[taxBreakup.taxName]
              ? parseFloat(
                  (
                    ((data.totalPrice + data.pfRate) *
                      data[taxBreakup.taxName]) /
                    100
                  ).toFixed(roundOff)
                )
              : 0;
            intraTotalTax += data[`${taxBreakup.taxName}Value`];
          } else {
            data[`${taxBreakup.taxName}Value`] = data[taxBreakup.taxName]
              ? parseFloat(
                  ((intraTotalTax * data[taxBreakup.taxName]) / 100).toFixed(
                    roundOff
                  )
                )
              : 0;
          }

          if (!itemWiseShippingTax) {
            tempCartValue[`${taxBreakup.taxName}Total`] +=
              data[`${taxBreakup.taxName}Value`];
            shippingTax += tempCartValue[`${taxBreakup.taxName}Total`];
            tempCartValue.shippingTax = isBeforeTax
              ? parseFloat(
                  (totalShipping * (percentage / 100)).toFixed(roundOff)
                )
              : 0;
            totalTaxIncShipping = tempCartValue.shippingTax + shippingTax;
            tempCartValue.totalTax = totalTaxIncShipping;
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
              tempCartValue[`${taxBreakup.taxName}Total`] +=
                data[`${taxBreakup.taxName}Value`] + data.shippingTax;
              shippingTax += tempCartValue[`${taxBreakup.taxName}Total`];
              tempCartValue.totalTax = shippingTax;
              totalTaxIncShipping = shippingTax;
              shippingCompound += data.shippingTax;
            } else {
              data.shippingTax = isBeforeTax
                ? parseFloat(
                    ((shippingCompound * percentage) / 100).toFixed(roundOff)
                  )
                : 0;
              tempCartValue[`${taxBreakup.taxName}Total`] +=
                data[`${taxBreakup.taxName}Value`] + data.shippingTax;
              shippingTax += tempCartValue[`${taxBreakup.taxName}Total`];
              tempCartValue.totalTax = shippingTax;
              totalTaxIncShipping = shippingTax;
            }
          }
        });
      } else {
        tempCartValue.shippingTax = 0;
        totalTaxIncShipping = shippingTax;
        tempCartValue.totalTax = totalTaxIncShipping;
      }
    } else {
      tempCartValue.shippingTax = shippingTax;
    }
  });

  tempCartValue.totalTax = totalTaxIncShipping || 0;
  tempCartValue.taxableAmount = isBeforeTax
    ? tempCartValue.totalValue + tempCartValue.pfRate + totalShipping
    : tempCartValue.totalValue + tempCartValue.pfRate;

  return {
    cartValue: tempCartValue,
    products: tempProducts,
    breakup: breakup,
  };
}
