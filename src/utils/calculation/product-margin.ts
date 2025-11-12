import each from "lodash/each";

import type { CartItem } from "@/types/calculation/cart";
import type { MarginCalculationResult } from "@/types/calculation/discount";

export const calculateProductWiseMargin = (
  precision = 2,
  discountBased: boolean,
  data: CartItem[],
  prevData: CartItem[],
  subTotal: number,
  maxRange: number,
  prevApproved: number | undefined,
  isRejected: boolean
): MarginCalculationResult => {
  let totalHoCost = 0;
  let totalProductCost = 0;
  let totalHoCostBC = 0;
  let totalProductCostBC = 0;
  let hoProfit = 0;
  let costProfit = 0;

  const toPrecision = (value: number | undefined): number =>
    Number((value ?? 0).toFixed(precision));

  each(data, (item, index) => {
    item.goingForApproval = false;
    item.Cost =
      ((item.productCost || 0) + (item.addonCost || 0)) *
      (item.askedQuantity || 0);
    item.totalProductCost = (item.productCost || 0) * (item.askedQuantity || 0);
    totalHoCost = totalHoCost + item.Cost;
    totalProductCost = totalProductCost + item.totalProductCost;
    item.bcCost =
      ((item.bcProductCost || 0) + (item.addonCostBC || 0)) *
      (item.askedQuantity || 0);
    item.totalbcProductCost =
      (item.bcProductCost || 0) * (item.askedQuantity || 0);
    totalHoCostBC = totalHoCostBC + item.bcCost;
    totalProductCostBC = totalProductCostBC + item.totalbcProductCost;

    if (prevData.length > 0) {
      each(prevData, prev => {
        if (item.itemNo) {
          if (typeof prevApproved === "number") {
            if (prevData.some(prevItem => prevItem.itemNo === item.itemNo)) {
              if (item.itemNo === prev.itemNo) {
                if (discountBased) {
                  const checkDiscount = isRejected
                    ? toPrecision(prev.discount) < toPrecision(item.discount)
                    : toPrecision(prev.discount) < toPrecision(item.discount);

                  if (checkDiscount) {
                    if (toPrecision(item.discount) >= maxRange) {
                      item.goingForApproval = true;
                    }
                  } else {
                    item.goingForApproval = false;
                  }
                } else {
                  const checkMargin = isRejected
                    ? toPrecision(item.marginPercentage) <
                      toPrecision(prev.marginPercentage)
                    : toPrecision(item.marginPercentage) <
                      toPrecision(prev.marginPercentage);

                  if (checkMargin) {
                    if (toPrecision(item.marginPercentage) <= maxRange) {
                      item.goingForApproval = true;
                    }
                  } else {
                    item.goingForApproval = false;
                  }
                }
              }
            } else {
              if (discountBased) {
                if (toPrecision(item.discount) >= maxRange) {
                  item.goingForApproval = true;
                }
              } else {
                if (toPrecision(item.marginPercentage) <= maxRange) {
                  item.goingForApproval = true;
                }
              }
            }
          } else {
            if (typeof maxRange === "number") {
              if (discountBased) {
                if (toPrecision(item.discount) >= maxRange) {
                  item.goingForApproval = true;
                }
              } else {
                if (toPrecision(item.marginPercentage) <= maxRange) {
                  item.goingForApproval = true;
                }
              }
            }
          }
        } else {
          if (typeof maxRange === "number") {
            if (discountBased) {
              if (toPrecision(item.discount) >= maxRange) {
                item.goingForApproval = true;
              }
            } else {
              if (toPrecision(item.marginPercentage) <= maxRange) {
                item.goingForApproval = true;
              }
            }
          }
        }
      });
    } else {
      if (typeof maxRange === "number") {
        if (discountBased) {
          if (toPrecision(item.discount) >= maxRange) {
            item.goingForApproval = true;
          }
        } else {
          if (toPrecision(item.marginPercentage) <= maxRange) {
            item.goingForApproval = true;
          }
        }
      }
    }

    if (index === data.length - 1) {
      costProfit =
        subTotal > 0 && totalProductCost > 0
          ? parseFloat(
              (((subTotal - totalProductCost) / subTotal) * 100).toFixed(
                precision
              )
            )
          : 0;
      hoProfit =
        subTotal > 0 && totalHoCost > 0
          ? parseFloat(
              (((subTotal - totalHoCost) / subTotal) * 100).toFixed(precision)
            )
          : 0;
    }
  });

  return {
    totalHoCost,
    totalHoCostBC,
    totalProductCostBC,
    totalProductCost,
    hoProfit,
    costProfit,
    data,
  };
};
