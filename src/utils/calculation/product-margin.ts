import each from "lodash/each";

import type {
  CartItem,
  MarginCalculationResult,
} from "@/types/calculation/cart";

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
                    ? parseFloat(
                        String(prev.discount || 0).toFixed(precision)
                      ) <
                      parseFloat(String(item.discount || 0).toFixed(precision))
                    : parseFloat(
                        String(prev.discount || 0).toFixed(precision)
                      ) <
                      parseFloat(String(item.discount || 0).toFixed(precision));

                  if (checkDiscount) {
                    if (
                      parseFloat(
                        String(item.discount || 0).toFixed(precision)
                      ) >= maxRange
                    ) {
                      item.goingForApproval = true;
                    }
                  } else {
                    item.goingForApproval = false;
                  }
                } else {
                  const checkMargin = isRejected
                    ? parseFloat(
                        String(item.marginPercentage || 0).toFixed(precision)
                      ) <
                      parseFloat(
                        String(prev.marginPercentage || 0).toFixed(precision)
                      )
                    : parseFloat(
                        String(item.marginPercentage || 0).toFixed(precision)
                      ) <
                      parseFloat(
                        String(prev.marginPercentage || 0).toFixed(precision)
                      );

                  if (checkMargin) {
                    if (
                      parseFloat(
                        String(item.marginPercentage || 0).toFixed(precision)
                      ) <= maxRange
                    ) {
                      item.goingForApproval = true;
                    }
                  } else {
                    item.goingForApproval = false;
                  }
                }
              }
            } else {
              if (discountBased) {
                if (
                  parseFloat(String(item.discount || 0).toFixed(precision)) >=
                  maxRange
                ) {
                  item.goingForApproval = true;
                }
              } else {
                if (
                  parseFloat(
                    String(item.marginPercentage || 0).toFixed(precision)
                  ) <= maxRange
                ) {
                  item.goingForApproval = true;
                }
              }
            }
          } else {
            if (typeof maxRange === "number") {
              if (discountBased) {
                if (
                  parseFloat(String(item.discount || 0).toFixed(precision)) >=
                  maxRange
                ) {
                  item.goingForApproval = true;
                }
              } else {
                if (
                  parseFloat(
                    String(item.marginPercentage || 0).toFixed(precision)
                  ) <= maxRange
                ) {
                  item.goingForApproval = true;
                }
              }
            }
          }
        } else {
          if (typeof maxRange === "number") {
            if (discountBased) {
              if (
                parseFloat(String(item.discount || 0).toFixed(precision)) >=
                maxRange
              ) {
                item.goingForApproval = true;
              }
            } else {
              if (
                parseFloat(
                  String(item.marginPercentage || 0).toFixed(precision)
                ) <= maxRange
              ) {
                item.goingForApproval = true;
              }
            }
          }
        }
      });
    } else {
      if (typeof maxRange === "number") {
        if (discountBased) {
          if (
            parseFloat(String(item.discount || 0).toFixed(precision)) >=
            maxRange
          ) {
            item.goingForApproval = true;
          }
        } else {
          if (
            parseFloat(String(item.marginPercentage || 0).toFixed(precision)) <=
            maxRange
          ) {
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
