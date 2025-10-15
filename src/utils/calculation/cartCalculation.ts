import {
  cloneDeep,
  each,
  forEach,
  isEmpty,
  isNumber,
  remove,
  round,
  some,
} from "lodash";

export const cartCalculation = (
  cartData,
  isInter = true,
  insuranceCharges = 0,
  precision = 2,
  Settings
) => {
  let cartArray = cloneDeep(cartData);
  const cartValue = {
    totalItems: cartData.length,
    totalValue: 0,
    totalTax: 0,
    grandTotal: 0,
    totalLP: 0,
    pfRate: 0,
    totalShipping: 0,
    totalCashDiscount: 0,
    totalBasicDiscount: 0,
    cashDiscountValue: 0,
    hideListPricePublic: some(cartData, ["listPricePublic", false]),
  };
  cartArray = cartArray.map((data, index) => {
    // Apply cash discount to unit price if applicable
    if (data.cashdiscountValue && data.cashdiscountValue > 0) {
      // Only store original unit price if not already stored
      if (!data.originalUnitPrice) {
        data.originalUnitPrice = data.unitPrice;
      }
      // Calculate discounted unit price from the original price
      data.unitPrice =
        data.originalUnitPrice -
        (data.originalUnitPrice * data.cashdiscountValue) / 100;
    }
    if (!data.volumeDiscountApplied) {
      data.totalPrice = data.quantity * data.unitPrice;
    }
    if (!data.itemNo) {
      data.itemNo = new Date().getTime() + index;
    }
    data.pfItemValue = data.pfItemValue ? data.pfItemValue : 0;
    data.pfRate = round(data.totalPrice * (data.pfItemValue / 100), precision);
    data.itemTaxableAmount = data.unitPrice + data.pfRate / data.askedQuantity;
    data.interTaxBreakup = [];
    data.intraTaxBreakup = [];
    each(data.hsnDetails?.interTax?.taxReqLs, taxes => {
      const tax = {
        taxName: taxes.taxName,
        taxPercentage: taxes.rate,
        compound: taxes.compound,
      };
      data.interTaxBreakup.push(tax);
    });
    each(data.hsnDetails?.intraTax?.taxReqLs, taxes => {
      const tax = {
        taxName: taxes.taxName,
        taxPercentage: taxes.rate,
        compound: taxes.compound,
      };
      data.intraTaxBreakup.push(tax);
    });
    if (isInter) {
      data.tax = data.hsnDetails?.interTax?.totalTax || 0;
      let intraTotalTax = 0;
      if (data.interTaxBreakup?.length > 0) {
        each(data.interTaxBreakup, inter => {
          data[inter.taxName] = inter.taxPercentage;
          if (!inter.compound) {
            data[`${inter.taxName}Value`] =
              ((data.totalPrice + data.pfRate) * inter.taxPercentage) / 100;
            intraTotalTax += data[`${inter.taxName}Value`];
          } else {
            data[`${inter.taxName}Value`] =
              (intraTotalTax * inter.taxPercentage) / 100;
          }
          cartValue[`${inter.taxName}Total`] = cartValue[
            `${inter.taxName}Total`
          ]
            ? cartValue[`${inter.taxName}Total`]
            : 0;
          cartValue[`${inter.taxName}Total`] += data[`${inter.taxName}Value`];
          data.totalTax =
            ((data.totalPrice + data.pfRate) * data.totalInterTax) / 100;
        });
      } else {
        data.totalTax = 0;
      }
    } else {
      data.tax = data.hsnDetails?.intraTax?.totalTax || 0;
      let interTotalTax = 0;
      if (data.intraTaxBreakup?.length > 0) {
        each(data.intraTaxBreakup, intra => {
          data[intra.taxName] = intra.taxPercentage;
          if (!intra.compound) {
            data[`${intra.taxName}Value`] =
              ((data.totalPrice + data.pfRate) * intra.taxPercentage) / 100;
            interTotalTax += data[`${intra.taxName}Value`];
          } else {
            data[`${intra.taxName}Value`] =
              (interTotalTax * intra.taxPercentage) / 100;
          }
          cartValue[`${intra.taxName}Total`] = cartValue[
            `${intra.taxName}Total`
          ]
            ? cartValue[`${intra.taxName}Total`]
            : 0;
          cartValue[`${intra.taxName}Total`] += data[`${intra.taxName}Value`];
          data.totalTax = interTotalTax;
        });
      } else {
        data.totalTax = 0;
      }
    }
    data.prodTax = round(
      ((data.totalPrice + data.pfRate) * data.tax) / 100,
      precision
    );
    data.totalLP = data.unitListPrice * parseFloat(data.quantity);
    data.buyerRequestedPrice = data.unitPrice;

    // Calculate cash discount if applicable
    if (
      data.cashdiscountValue &&
      data.cashdiscountValue > 0 &&
      data.originalUnitPrice
    ) {
      // Cash discount amount is the difference between original price and discounted price
      data.cashDiscountedPrice = round(
        (data.originalUnitPrice - data.unitPrice) * data.quantity,
        precision
      );
      cartValue.totalCashDiscount += data.cashDiscountedPrice;
      cartValue.cashDiscountValue = data.cashdiscountValue;
    }
    // Calculate basic discount
    if (data.unitListPrice > data.unitPrice) {
      data.basicDiscountedPrice = round(
        (data.unitListPrice - data.unitPrice) * data.quantity,
        precision
      );
      cartValue.totalBasicDiscount += data.basicDiscountedPrice;
    }
    cartValue.totalShipping =
      cartValue.totalShipping +
      data.shippingCharges * parseFloat(data.quantity);
    cartValue.totalLP += data.totalLP;
    cartValue.totalTax += data.totalTax;
    cartValue.totalValue += data.totalPrice;
    cartValue.pfRate += data.pfRate;
    cartValue.taxableAmount = cartValue.totalValue + cartValue.pfRate;
    cartValue.insuranceCharges = round(insuranceCharges, precision);
    //REVIEW - Grand Total Calculation based on rounding adjustment
    // Note: Cash discount is already applied to unit prices, so totalValue already reflects the discount
    cartValue.calculatedTotal =
      cartValue.totalTax +
      cartValue.totalValue +
      cartValue.pfRate +
      cartValue.insuranceCharges;
    cartValue.grandTotal = Settings?.roundingAdjustment
      ? round(cartValue.calculatedTotal)
      : cartValue.calculatedTotal;
    cartValue.roundingAdjustment =
      cartValue.grandTotal - cartValue.calculatedTotal;
    return data;
  });
  if (some(cartArray, item => item.totalPrice < 0)) {
    cartValue.hasProductsWithNegativeTotalPrice = true;
  } else {
    cartValue.hasProductsWithNegativeTotalPrice = false;
  }

  if (some(cartArray, item => !item.isProductAvailableInPriceList)) {
    cartValue.hasAllProductsAvailableInPriceList = false;
  } else {
    cartValue.hasAllProductsAvailableInPriceList = true;
  }
  return cartValue;
};

export const handleBundleProductsLogic = item => {
  let detectBundlePriceFromProduct = 0;
  let bundleUnitListPrice = item.initial_unitListPrice_fe;
  if (item.bundleProducts?.length > 0) {
    forEach(item.bundleProducts, bp => {
      if (!bp?.isBundleSelected_fe) {
        detectBundlePriceFromProduct +=
          bp.unitListPrice - bp.unitListPrice * (item.discount / 100);
      }
      if (!bp.bundleSelected || !bp.isBundleSelected_fe) {
        bundleUnitListPrice -= bp.unitListPrice;
      }
    });

    item.unitListPrice = bundleUnitListPrice;
    item.discountedPrice =
      item.unitListPrice - (item.unitListPrice * item.discountPercentage) / 100;
    item.unitPrice =
      item.initial_discounted_price_fe - detectBundlePriceFromProduct;
  }
  return item;
};

export const discountDetails = (
  cartData,
  isSeller,
  taxExemption,
  precision = 2
) => {
  cartData.forEach(item => {
    item.packagingQuantity = item.packagingQty
      ? parseFloat(item.packagingQty)
      : parseFloat(item.packagingQuantity);
    item.minOrderQuantity = item.minOrderQuantity
      ? parseFloat(item.minOrderQuantity)
      : parseFloat(item.packagingQuantity);
    item.checkMOQ = item.minOrderQuantity
      ? item.minOrderQuantity > item.askedQuantity
        ? true
        : false
      : false;

    item.bcProductCost = item.bcProductCost ? item.bcProductCost : 0;
    item.productCostLoad = item.productCost ? item.productCost : 0;

    item.bcProductCost = item.bcProductCost ? item.bcProductCost : 0;
    item.productCostLoad = item.productCost ? item.productCost : 0;

    item.discountPercentage = item?.discount ? item?.discount : 0;

    //Calculating the discounted Price..
    if (!item.initial_unitListPrice_fe) {
      item.initial_unitListPrice_fe = item.unitListPrice;
    }

    //Calculating the discounted Price..
    if (!item.initial_unitListPrice_fe) {
      item.initial_unitListPrice_fe = item.unitListPrice;
    }

    item.discountedPrice =
      item.unitListPrice - (item.unitListPrice * item.discountPercentage) / 100;

    if (!item.initial_discounted_price_fe) {
      item.initial_discounted_price_fe = item.discountedPrice;
    }
    item.tax = parseFloat(item.hsnDetails?.tax);
    if (!item.volumeDiscountApplied) {
      item.discount = item.discountPercentage;
      item.unitPrice = item.discountedPrice;

      //apply bundle Products logic...
      item = handleBundleProductsLogic(item);
      item.totalPrice = item.quantity * item.unitPrice;
    }
    if (item.taxInclusive) {
      item.unitPrice = item.unitPrice / (1 + item.tax / 100);
      // item.unitListPrice = round(
      //   item.unitListPrice / (1 + item.tax / 100),
      //   precision
      // );
    }
    if (!taxExemption) {
      item.tax = parseFloat(item.hsnDetails?.tax) || 0;
    } else {
      item.tax = 0;
    }
    item.unitLP = item.unitListPrice;
    item.unitLPRp = item.unitListPrice;
    item.actualdisc = item.discount;
    item.acturalUP = item.unitPrice;
    if (item.showPrice || item.priceNotAvailable) {
      item.pfItemValue = item.pfItemValue ? item.pfItemValue : 0;
      item.pfRate = round(
        (item.totalPrice * (item.pfItemValue / 100), precision)
      );
    }

    // dmc calculation
    item.addonCost = 0;
    if (item.productCost > 0 && item.unitPrice > 0) {
      item.dmc = round(
        (((item.productCost + item.addonCost) / item.unitPrice) * 100,
        precision)
      );
      item.marginPercentage = 100 - item.dmc;
    } else {
      item.dmc = 100;
      item.marginPercentage = 100 - item.dmc;
    }
    item.productShortDescription = item.productShortDescription
      ? item.productShortDescription
      : item.shortDescription;
    item.askedQuantity = item.quantity;
    item.totalInterTax = taxExemption
      ? 0
      : parseFloat(item?.hsnDetails?.interTax?.totalTax) || 0;
    item.totalIntraTax = taxExemption
      ? 0
      : parseFloat(item?.hsnDetails?.intraTax?.totalTax) || 0;
    item.interTaxBreakup = [];
    item.compoundInter = remove(item.hsnDetails?.interTax?.taxReqLs, [
      "compound",
      true,
    ]);
    if (!isEmpty(item.compoundInter)) {
      item.hsnDetails?.interTax?.taxReqLs.push(item.compoundInter[0]);
    }
    each(item.hsnDetails?.interTax?.taxReqLs, taxes => {
      const tax = {
        taxName: taxes.taxName,
        taxPercentage: taxExemption ? 0 : taxes.rate,
        compound: taxes.compound,
      };
      item.interTaxBreakup.push(tax);
    });
    item.intraTaxBreakup = [];
    item.compoundIntra = remove(item.hsnDetails?.intraTax?.taxReqLs, [
      "compound",
      true,
    ]);
    if (!isEmpty(item.compoundIntra)) {
      item.hsnDetails?.intraTax?.taxReqLs.push(item.compoundIntra[0]);
    }
    each(item.hsnDetails?.intraTax?.taxReqLs, taxes => {
      const tax = {
        taxName: taxes.taxName,
        taxPercentage: taxExemption ? 0 : taxes.rate,
        compound: taxes.compound,
      };
      item.intraTaxBreakup.push(tax);
    });
    item.hsnCode = item?.hsnDetails?.hsnCode;
    if (!item.showPrice || item.priceNotAvailable) {
      item.discountedPrice = 0;
      item.buyerRequestedPrice = 0;
      item.unitPrice = item.discountedPrice;
    } else {
      item.buyerRequestedPrice = item.unitPrice;
    }
    if (!item.showPrice || item.priceNotAvailable) {
      item.unitLP = 0;
      item.unitListPrice = 0;
    }
    item.shippingCharges = 0;
    // Preserve cash discount value if it exists
    item.cashdiscountValue = item.cashdiscountValue || 0;
  });
  return cartData;
};

export const VolumeDiscountCalculation = (
  isInter,
  products,
  VdData,
  subTotal,
  overallShipping,
  Settings,
  beforeTax,
  beforeTaxPercentage,
  precision = 2
) => {
  const vdDetails = {};
  let addProd = 0;
  let addTax = 0;
  let addVolumeProd = 0;
  const productsAfterVd = products;
  let pfRate = 0;
  let shippingTax = 0;
  productsAfterVd.forEach((product, index) => {
    let shippingCompound = 0;
    VdData?.forEach((vd, indexvd) => {
      if (product.itemNo === vd.itemNo) {
        product.appliedDiscount = vd.appliedDiscount;
        // product.discount = vd.appliedDiscount
        product.unitPrice = parseFloat(
          (
            product.unitListPrice -
            (product.unitListPrice * parseFloat(product.appliedDiscount)) / 100
          ).toFixed(precision)
        );
        // product.discountedPrice = product.unitPrice
        product.totalPrice = product.askedQuantity * product.unitPrice;
        product.pfRate = parseFloat(
          (product.totalPrice * (product.pfItemValue / 100)).toFixed(precision)
        );
        product.taxVolumeDiscountPercentage = parseFloat(
          (
            ((product.totalPrice + product.pfRate) * parseFloat(product.tax)) /
            100
          ).toFixed(precision)
        );
        product.volumeDiscount = vd.volumeDiscount;
        if (beforeTax && Settings.itemWiseShippingTax) {
          product.itemTaxableAmount =
            product.unitPrice +
            product.pfRate / product.askedQuantity +
            product.shippingCharges;
        } else {
          product.itemTaxableAmount =
            product.unitPrice + product.pfRate / product.askedQuantity;
        }
        if (isInter) {
          product.tax = product.hsnDetails?.interTax?.totalTax || 0;
          let intraTotalTax = 0;
          if (product.interTaxBreakup?.length > 0) {
            each(product.interTaxBreakup, inter => {
              product[inter.taxName] = inter.taxPercentage;
              const percentage = Settings.itemWiseShippingTax
                ? product[inter.taxName]
                  ? product[inter.taxName]
                  : 0
                : beforeTaxPercentage;
              if (!inter.compound) {
                product[`${inter.taxName}Value`] = parseFloat(
                  (
                    ((product.totalPrice + product.pfRate) *
                      inter.taxPercentage) /
                    100
                  ).toFixed(precision)
                );
                intraTotalTax += product[`${inter.taxName}Value`];
              } else {
                product[`${inter.taxName}Value`] = parseFloat(
                  ((intraTotalTax * inter.taxPercentage) / 100).toFixed(
                    precision
                  )
                );
              }
              if (!Settings.itemWiseShippingTax) {
                vdDetails[`${inter.taxName}Total`] = vdDetails[
                  `${inter.taxName}Total`
                ]
                  ? vdDetails[`${inter.taxName}Total`]
                  : 0;
                vdDetails[`${inter.taxName}Total`] +=
                  product[`${inter.taxName}Value`];
                shippingTax += product[`${inter.taxName}Value`];
                vdDetails.shippingTax = beforeTax
                  ? parseFloat(
                      (overallShipping * (percentage / 100)).toFixed(precision)
                    )
                  : 0;
                product.taxVolumeDiscountPercentage =
                  vdDetails.shippingTax + shippingTax;
                vdDetails.totalTax = product.taxVolumeDiscountPercentage;
              } else {
                if (!inter.compound) {
                  product.shippingTax = beforeTax
                    ? parseFloat(
                        (
                          (product.shippingCharges *
                            product.askedQuantity *
                            percentage) /
                          100
                        ).toFixed(precision)
                      )
                    : 0;
                  vdDetails[`${inter.taxName}Total`] = vdDetails[
                    `${inter.taxName}Total`
                  ]
                    ? vdDetails[`${inter.taxName}Total`]
                    : 0;
                  vdDetails[`${inter.taxName}Total`] +=
                    product[`${inter.taxName}Value`] + product.shippingTax;
                  shippingTax +=
                    product[`${inter.taxName}Value`] + product.shippingTax;
                  vdDetails.totalTax = shippingTax;
                  product.taxVolumeDiscountPercentage = shippingTax;
                  shippingCompound += product.shippingTax;
                } else {
                  product.shippingTax = beforeTax
                    ? parseFloat(
                        ((shippingCompound * percentage) / 100).toFixed(
                          precision
                        )
                      )
                    : 0;
                  vdDetails[`${inter.taxName}Total`] = vdDetails[
                    `${inter.taxName}Total`
                  ]
                    ? vdDetails[`${inter.taxName}Total`]
                    : 0;
                  vdDetails[`${inter.taxName}Total`] +=
                    product[`${inter.taxName}Value`] + product.shippingTax;
                  shippingTax +=
                    product[`${inter.taxName}Value`] + product.shippingTax;
                  vdDetails.totalTax = shippingTax;
                  product.taxVolumeDiscountPercentage = shippingTax;
                }
              }
            });
          } else {
            const percentage = Settings.itemWiseShippingTax
              ? 0
              : beforeTaxPercentage;
            vdDetails.shippingTax = beforeTax
              ? parseFloat(
                  (overallShipping * (percentage / 100)).toFixed(precision)
                )
              : 0;
            shippingTax = vdDetails.shippingTax + shippingTax;
            vdDetails.totalTax = shippingTax;
          }
        } else {
          product.tax = product.hsnDetails?.intraTax?.totalTax || 0;
          let interTotalTax = 0;
          if (product.intraTaxBreakup?.length > 0) {
            each(product.intraTaxBreakup, intra => {
              product[intra.taxName] = intra.taxPercentage;
              const percentage = Settings.itemWiseShippingTax
                ? product[intra.taxName]
                  ? product[intra.taxName]
                  : 0
                : beforeTaxPercentage;
              if (!intra.compound) {
                product[`${intra.taxName}Value`] = parseFloat(
                  (
                    ((product.totalPrice + product.pfRate) *
                      intra.taxPercentage) /
                    100
                  ).toFixed(precision)
                );
                interTotalTax += product[`${intra.taxName}Value`];
              } else {
                product[`${intra.taxName}Value`] = parseFloat(
                  ((interTotalTax * intra.taxPercentage) / 100).toFixed(
                    precision
                  )
                );
              }
              if (!Settings.itemWiseShippingTax) {
                vdDetails[`${intra.taxName}Total`] = vdDetails[
                  `${intra.taxName}Total`
                ]
                  ? vdDetails[`${intra.taxName}Total`]
                  : 0;
                vdDetails[`${intra.taxName}Total`] +=
                  product[`${intra.taxName}Value`];
                shippingTax += product[`${intra.taxName}Value`];
                vdDetails.shippingTax = beforeTax
                  ? parseFloat(
                      (overallShipping * (percentage / 100)).toFixed(precision)
                    )
                  : 0;
                product.taxVolumeDiscountPercentage =
                  vdDetails.shippingTax + shippingTax;
                vdDetails.totalTax = product.taxVolumeDiscountPercentage;
              } else {
                if (!intra.compound) {
                  product.shippingTax = beforeTax
                    ? parseFloat(
                        (
                          (product.shippingCharges *
                            product.askedQuantity *
                            percentage) /
                          100
                        ).toFixed(precision)
                      )
                    : 0;
                  vdDetails[`${intra.taxName}Total`] = vdDetails[
                    `${intra.taxName}Total`
                  ]
                    ? vdDetails[`${intra.taxName}Total`]
                    : 0;
                  vdDetails[`${intra.taxName}Total`] +=
                    product[`${intra.taxName}Value`] + product.shippingTax;
                  shippingTax +=
                    product[`${intra.taxName}Value`] + product.shippingTax;
                  vdDetails.totalTax = shippingTax;
                  product.taxVolumeDiscountPercentage = shippingTax;
                  shippingCompound += product.shippingTax;
                } else {
                  product.shippingTax = beforeTax
                    ? parseFloat(
                        ((shippingCompound * percentage) / 100).toFixed(
                          precision
                        )
                      )
                    : 0;
                  vdDetails[`${intra.taxName}Total`] = vdDetails[
                    `${intra.taxName}Total`
                  ]
                    ? vdDetails[`${intra.taxName}Total`]
                    : 0;
                  vdDetails[`${intra.taxName}Total`] +=
                    product[`${intra.taxName}Value`] + product.shippingTax;
                  shippingTax +=
                    product[`${intra.taxName}Value`] + product.shippingTax;
                  vdDetails.totalTax = shippingTax;
                  product.taxVolumeDiscountPercentage = shippingTax;
                }
              }
            });
          } else {
            const percentage = Settings.itemWiseShippingTax
              ? 0
              : beforeTaxPercentage;
            vdDetails.shippingTax = beforeTax
              ? parseFloat(
                  (overallShipping * (percentage / 100)).toFixed(precision)
                )
              : 0;
            shippingTax = vdDetails.shippingTax;
            vdDetails.totalTax = shippingTax;
          }
        }
        if (vd.volumeDiscount > 0) {
          product.volumeDiscountApplied = true;
          product.volumeDiscount = vd.volumeDiscount;
          product.unitVolumePrice = parseFloat(
            (
              product.unitListPrice -
              (product.unitListPrice * parseFloat(vd.volumeDiscount)) / 100
            ).toFixed(precision)
          );
          product.totalVolumeDiscountPrice =
            product.askedQuantity * product.unitVolumePrice;
          addVolumeProd = addVolumeProd + product.totalVolumeDiscountPrice;
          if (product.productCost > 0 && product.unitVolumePrice > 0) {
            product.dmc = parseFloat(
              (
                ((product.productCost + product.addonCost) /
                  product.unitVolumePrice) *
                100
              ).toFixed(precision)
            );
            product.marginPercentage = 100 - product.dmc;
          } else {
            product.dmc = 100;
            product.marginPercentage = 100 - product.dmc;
          }
        } else {
          product.volumeDiscountApplied = false;
        }
        addProd = addProd + product.totalPrice;
        pfRate = pfRate + product.pfRate;
        addTax = shippingTax;
      }
      if (index === products.length - 1 && indexvd === VdData.length - 1) {
        vdDetails.subTotal = subTotal;
        vdDetails.subTotalVolume = addProd;
        vdDetails.volumeDiscountApplied = subTotal - vdDetails.subTotalVolume;
        vdDetails.overallTax = addTax;
        vdDetails.taxableAmount = beforeTax
          ? vdDetails.subTotalVolume + pfRate + overallShipping
          : vdDetails.subTotalVolume + pfRate;
        vdDetails.grandTotal =
          vdDetails.subTotalVolume +
          vdDetails.overallTax +
          pfRate +
          overallShipping;
      }
    });
    if (!product.productId) {
      product.taxVolumeDiscountPercentage = parseFloat(
        ((product.totalPrice * parseFloat(product.tax)) / 100).toFixed(
          precision
        )
      );
      addProd = addProd + product.totalPrice;
      addTax = addTax + product.taxVolumeDiscountPercentage;
    }
    if (index === products.length - 1 && VdData.length === 0) {
      vdDetails.subTotal = subTotal;
      vdDetails.subTotalVolume = addProd;
      vdDetails.volumeDiscountApplied = subTotal - vdDetails.subTotalVolume;
      vdDetails.overallTax = addTax;
      vdDetails.taxableAmount = beforeTax
        ? vdDetails.subTotalVolume + pfRate + overallShipping
        : vdDetails.subTotalVolume + pfRate;
      vdDetails.grandTotal =
        vdDetails.subTotalVolume +
        vdDetails.overallTax +
        pfRate +
        overallShipping;
    }
  });
  return {
    products: productsAfterVd,
    vdDetails,
    pfRate,
  };
};

export const getProductWiseMargin = (
  precision = 2,
  discountBased,
  data,
  prevData,
  subTotal,
  maxRange,
  prevApproved,
  isRejected
) => {
  let totalHoCost = 0;
  let totalProductCost = 0;
  let totalHoCostBC = 0;
  let totalProductCostBC = 0;
  let hoProfit = 0;
  let costProfit = 0;
  each(data, (item, index) => {
    item.goingForApproval = false;
    item.Cost = (item.productCost + item.addonCost) * item.askedQuantity;
    item.totalProductCost = item.productCost * item.askedQuantity;
    totalHoCost = totalHoCost + item.Cost;
    totalProductCost = totalProductCost + item.totalProductCost;
    item.bcCost = (item.bcProductCost + item.addonCostBC) * item.askedQuantity;
    item.totalbcProductCost = item.bcProductCost * item.askedQuantity;
    totalHoCostBC = totalHoCostBC + item.bcCost;
    totalProductCostBC = totalProductCostBC + item.totalbcProductCost;
    if (prevData.length > 0) {
      each(prevData, prev => {
        if (item.itemNo) {
          if (isNumber(prevApproved)) {
            if (some(prevData, ["itemNo", item.itemNo])) {
              if (item.itemNo === prev.itemNo) {
                if (discountBased) {
                  const checkDiscount = isRejected
                    ? parseFloat(prev.discount.toFixed(precision)) <
                      parseFloat(item.discount.toFixed(precision))
                    : parseFloat(prev.discount.toFixed(precision)) <
                      parseFloat(item.discount.toFixed(precision));
                  if (checkDiscount) {
                    if (
                      parseFloat(item.discount.toFixed(precision)) >= maxRange
                    ) {
                      item.goingForApproval = true;
                    }
                  } else {
                    item.goingForApproval = false;
                  }
                } else {
                  const checkMargin = isRejected
                    ? parseFloat(item.marginPercentage.toFixed(precision)) <
                      parseFloat(prev.marginPercentage.toFixed(precision))
                    : parseFloat(item.marginPercentage.toFixed(precision)) <
                      parseFloat(prev.marginPercentage.toFixed(precision));
                  if (checkMargin) {
                    if (
                      parseFloat(item.marginPercentage.toFixed(precision)) <=
                      maxRange
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
                if (parseFloat(item.discount.toFixed(precision)) >= maxRange) {
                  item.goingForApproval = true;
                }
              } else {
                if (
                  parseFloat(item.marginPercentage.toFixed(precision)) <=
                  maxRange
                ) {
                  item.goingForApproval = true;
                }
              }
            }
          } else {
            if (isNumber(maxRange)) {
              if (discountBased) {
                if (parseFloat(item.discount.toFixed(precision)) >= maxRange) {
                  item.goingForApproval = true;
                }
              } else {
                if (
                  parseFloat(item.marginPercentage.toFixed(precision)) <=
                  maxRange
                ) {
                  item.goingForApproval = true;
                }
              }
            }
          }
        } else {
          if (isNumber(maxRange)) {
            if (discountBased) {
              if (parseFloat(item.discount.toFixed(precision)) >= maxRange) {
                item.goingForApproval = true;
              }
            } else {
              if (
                parseFloat(item.marginPercentage.toFixed(precision)) <= maxRange
              ) {
                item.goingForApproval = true;
              }
            }
          }
        }
      });
    } else {
      if (isNumber(maxRange)) {
        if (discountBased) {
          if (parseFloat(item.discount.toFixed(precision)) >= maxRange) {
            item.goingForApproval = true;
          }
        } else {
          if (
            parseFloat(item.marginPercentage.toFixed(precision)) <= maxRange
          ) {
            item.goingForApproval = true;
          }
        }
      }
    }
    // }
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

export const addMoreUtils = (
  isInter,
  item = {},
  isSeller,
  taxExemption,
  precision = 2
) => {
  item.productCost = item.productCost ? item.productCost : 0;
  item.bcProductCost = item.bcProductCost ? item.bcProductCost : 0;
  item.productCostLoad = item.productCost ? item.productCost : 0;

  item.discountPercentage = item?.discount ? item?.discount : 0;
  item.discountedPrice =
    item.unitListPrice - (item.unitListPrice * item.discountPercentage) / 100;

  if (!item.volumeDiscountApplied) {
    item.discount = item.discountPercentage;
    item.unitPrice = item.discountedPrice;
  }
  if (!item.showPrice || item.priceNotAvailable) {
    item.discountedPrice = 0;
    item.buyerRequestedPrice = 0;
    item.unitPrice = item.discountedPrice;
  } else {
    item.buyerRequestedPrice = item.unitPrice;
  }

  item.actualdisc = item.discount;
  item.acturalUP = item.unitPrice;

  //dmc calculation...
  item.addonCost = 0;
  if (item.productCost > 0 && item.unitPrice > 0) {
    item.dmc = round(
      (((item.productCost + item.addonCost) / item.unitPrice) * 100, precision)
    );
    item.marginPercentage = 100 - item.dmc;
  } else {
    item.dmc = 100;
    item.marginPercentage = 100 - item.dmc;
  }
  item.productShortDescription = item.shortDescription;
  item.packagingQuantity = item.packagingQty
    ? item.packagingQty
    : item.packagingQuantity;
  item.askedQuantity = item.quantity;
  item.totalPrice = item.unitPrice * item.askedQuantity;
  if (item.showPrice || item.priceNotAvailable) {
    item.pfItemValue = item.pfItemValue ? item.pfItemValue : 0;
    item.pfRate = round(
      (item.totalPrice * (item.pfItemValue / 100), precision)
    );
  }
  item.totalInterTax = parseFloat(item.hsnDetails?.interTax?.totalTax) || 0;
  item.totalIntraTax = parseFloat(item.hsnDetails?.intraTax?.totalTax) || 0;
  item.tax = isInter ? item.totalInterTax : item.totalIntraTax;
  if (item.taxInclusive) {
    item.unitPrice = item.unitPrice / (1 + item.tax / 100);
    // item.unitListPrice =  round((item.unitListPrice / (1 + item.tax / 100)),precision)
  }
  if (!taxExemption) {
    item.tax = isInter ? item.totalInterTax : item.totalIntraTax;
  } else {
    item.tax = 0;
  }

  item.totalInterTax = taxExemption
    ? 0
    : parseFloat(item.hsnDetails?.interTax?.totalTax) || 0;
  item.totalIntraTax = taxExemption
    ? 0
    : parseFloat(item.hsnDetails?.intraTax?.totalTax) || 0;
  item.tax = isInter ? item.totalInterTax : item.totalIntraTax;
  item.interTaxBreakup = [];
  item.compoundInter = remove(item.hsnDetails?.interTax?.taxReqLs, [
    "compound",
    true,
  ]);
  if (!isEmpty(item.compoundInter)) {
    item.hsnDetails?.interTax?.taxReqLs.push(item.compoundInter[0]);
  }
  each(item.hsnDetails?.interTax?.taxReqLs, taxes => {
    const tax = {
      taxName: taxes.taxName,
      taxPercentage: taxExemption ? 0 : taxes.rate,
      compound: taxes.compound,
    };
    item.interTaxBreakup.push(tax);
  });
  item.intraTaxBreakup = [];
  item.compoundIntra = remove(item.hsnDetails?.intraTax?.taxReqLs, [
    "compound",
    true,
  ]);
  if (!isEmpty(item.compoundIntra)) {
    item.hsnDetails?.intraTax?.taxReqLs.push(item.compoundIntra[0]);
  }
  each(item.hsnDetails?.intraTax?.taxReqLs, taxes => {
    const tax = {
      taxName: taxes.taxName,
      taxPercentage: taxExemption ? 0 : taxes.rate,
      compound: taxes.compound,
    };
    item.intraTaxBreakup.push(tax);
  });
  item.unitLP = item.unitListPrice;
  item.hsnCode = item.hsnDetails?.hsnCode;
  item.unitLPRp = item.unitListPrice;
  item.shippingCharges = 0;
  return item;
};

export const calculate_volume_discount = (
  isInter,
  VdData,
  subTotal,
  insuranceCharges,
  beforeTax,
  beforeTaxPercentage,
  overallShipping,
  Settings,
  precision = 2
) => {
  const vdDetails = {};
  let addProd = 0;
  let addVolumeProd = 0;
  let pfRate = 0;
  let shippingTax = 0;
  try {
    VdData.forEach((product, index) => {
      let shippingCompound = 0;
      // if(product?.volume_discount_obj?.Percentage && product?.volume_discount_obj?.DiscountId){
      //if disc changed manually, we dont need to check CantCombineWithOtherDiscounts..
      if (
        (product.discChanged ? true : !product.CantCombineWithOtherDisCounts) &&
        product?.volume_discount_obj?.Percentage
      ) {
        //Setting Volume Discount from the volume_discount_obj
        product.volumeDiscount = product?.volume_discount_obj?.Percentage;
        product.appliedDiscount = product.volumeDiscount + product.discount;

        //inserting additionalDiscounts to track vd, and further discounts..
        if (!product.additionalDiscounts?.length) {
          product.additionalDiscounts = [];
        }
        product.additionalDiscounts.push({
          ...product?.volume_discount_obj,
          discounId: product?.volume_discount_obj?.DiscountId,
          discountPercentage: product?.volume_discount_obj?.Percentage,
        });
      } else {
        product.volumeDiscount = 0;
        product.appliedDiscount = product.discount;
      }
      //Calculating basic data's based on the lastest volumeDiscount
      product.unitPrice = round(
        product.unitListPrice -
          (product.unitListPrice * parseFloat(product.appliedDiscount)) / 100,
        precision
      );

      product.tax = parseFloat(product.hsnDetails?.tax) || 0;

      if (product.taxInclusive) {
        // product.unitPrice = product.unitListPrice - ((product.unitListPrice * product.discountPercentage) / 100);
        product.unitPrice = product.unitPrice / (1 + product.tax / 100);
        product.unitPrice = round(product.unitPrice, precision); //Rounding up the unitPrice after taxInclusive calc...
      }
      product.totalPrice = round(
        product.askedQuantity * product.unitPrice,
        precision
      );
      product.pfRate = round(
        product.totalPrice * (product.pfItemValue / 100),
        precision
      );

      product.taxVolumeDiscountPercentage = round(
        ((product.totalPrice + product.pfRate) * parseFloat(product.tax)) / 100,
        precision
      );

      if (beforeTax && Settings.itemWiseShippingTax) {
        product.itemTaxableAmount =
          product.unitPrice +
          product.pfRate / product.askedQuantity +
          product.shippingCharges;
      } else {
        product.itemTaxableAmount =
          product.unitPrice + product.pfRate / product.askedQuantity;
      }

      if (isInter) {
        product.tax = product.hsnDetails?.interTax?.totalTax || 0;
        let intraTotalTax = 0;
        if (product.interTaxBreakup.length) {
          each(product.interTaxBreakup, inter => {
            product[inter.taxName] = inter.taxPercentage;
            const percentage = Settings.itemWiseShippingTax
              ? product[inter.taxName]
                ? product[inter.taxName]
                : 0
              : beforeTaxPercentage;
            if (!inter.compound) {
              product[`${inter.taxName}Value`] = round(
                ((product.totalPrice + product.pfRate) *
                  product[inter.taxName]) /
                  100,
                precision
              );
              intraTotalTax += product[`${inter.taxName}Value`];
            } else {
              product[`${inter.taxName}Value`] = round(
                (intraTotalTax * inter.taxPercentage) / 100,
                precision
              );
            }
            if (!Settings.itemWiseShippingTax) {
              vdDetails[`${inter.taxName}Total`] = vdDetails[
                `${inter.taxName}Total`
              ]
                ? vdDetails[`${inter.taxName}Total`]
                : 0;
              vdDetails[`${inter.taxName}Total`] +=
                product[`${inter.taxName}Value`];
              shippingTax += product[`${inter.taxName}Value`];
              vdDetails.shippingTax = beforeTax
                ? round(overallShipping * (percentage / 100), precision)
                : 0;
              product.taxVolumeDiscountPercentage =
                vdDetails.shippingTax + shippingTax;
              vdDetails.totalTax = product.taxVolumeDiscountPercentage;
            } else {
              if (!inter.compound) {
                product.shippingTax = beforeTax
                  ? round(
                      (product.shippingCharges *
                        product.askedQuantity *
                        percentage) /
                        100,
                      precision
                    )
                  : 0;
                vdDetails[`${inter.taxName}Total`] = vdDetails[
                  `${inter.taxName}Total`
                ]
                  ? vdDetails[`${inter.taxName}Total`]
                  : 0;
                vdDetails[`${inter.taxName}Total`] +=
                  product[`${inter.taxName}Value`] + product.shippingTax;
                shippingTax +=
                  product[`${inter.taxName}Value`] + product.shippingTax;
                vdDetails.totalTax = shippingTax;
                product.taxVolumeDiscountPercentage = shippingTax;
                shippingCompound = product.shippingTax;
              } else {
                product.shippingTax = beforeTax
                  ? round((shippingCompound * percentage) / 100, precision)
                  : 0;
                vdDetails[`${inter.taxName}Total`] = vdDetails[
                  `${inter.taxName}Total`
                ]
                  ? vdDetails[`${inter.taxName}Total`]
                  : 0;
                vdDetails[`${inter.taxName}Total`] +=
                  product[`${inter.taxName}Value`] + product.shippingTax;
                shippingTax +=
                  product[`${inter.taxName}Value`] + product.shippingTax;
                vdDetails.totalTax = shippingTax;
                product.taxVolumeDiscountPercentage = shippingTax;
              }
            }
          });
        } else {
          const percentage = Settings.itemWiseShippingTax
            ? 0
            : beforeTaxPercentage;
          vdDetails.shippingTax = beforeTax
            ? round(overallShipping * (percentage / 100), precision)
            : 0;
          shippingTax = shippingTax + vdDetails.shippingTax;
          product.taxVolumeDiscountPercentage =
            vdDetails.shippingTax + shippingTax;
          vdDetails.totalTax = product.taxVolumeDiscountPercentage;
        }
      } else {
        product.tax = product.hsnDetails?.intraTax?.totalTax || 0;
        let interTotalTax = 0;
        if (product.intraTaxBreakup.length) {
          each(product.intraTaxBreakup, intra => {
            product[intra.taxName] = intra.taxPercentage;
            const percentage = Settings.itemWiseShippingTax
              ? product[intra.taxName]
                ? product[intra.taxName]
                : 0
              : beforeTaxPercentage;
            if (!intra.compound) {
              product[`${intra.taxName}Value`] = round(
                ((product.totalPrice + product.pfRate) * intra.taxPercentage) /
                  100,
                precision
              );
              interTotalTax += product[`${intra.taxName}Value`];
            } else {
              product[`${intra.taxName}Value`] = round(
                (interTotalTax * intra.taxPercentage) / 100,
                precision
              );
            }
            if (!Settings.itemWiseShippingTax) {
              vdDetails[`${intra.taxName}Total`] = vdDetails[
                `${intra.taxName}Total`
              ]
                ? vdDetails[`${intra.taxName}Total`]
                : 0;
              vdDetails[`${intra.taxName}Total`] +=
                product[`${intra.taxName}Value`];
              shippingTax += product[`${intra.taxName}Value`];
              vdDetails.shippingTax = beforeTax
                ? round(overallShipping * (percentage / 100), precision)
                : 0;
              product.taxVolumeDiscountPercentage =
                vdDetails.shippingTax + shippingTax;
              vdDetails.totalTax = product.taxVolumeDiscountPercentage;
            } else {
              if (!intra.compound) {
                product.shippingTax = beforeTax
                  ? round(
                      (product.shippingCharges *
                        product.askedQuantity *
                        percentage) /
                        100,
                      precision
                    )
                  : 0;
                vdDetails[`${intra.taxName}Total`] = vdDetails[
                  `${intra.taxName}Total`
                ]
                  ? vdDetails[`${intra.taxName}Total`]
                  : 0;
                vdDetails[`${intra.taxName}Total`] +=
                  product[`${intra.taxName}Value`] + product.shippingTax;
                shippingTax +=
                  product[`${intra.taxName}Value`] + product.shippingTax;
                vdDetails.totalTax = shippingTax;
                product.taxVolumeDiscountPercentage = shippingTax;
                shippingCompound += product.shippingTax;
              } else {
                product.shippingTax = beforeTax
                  ? round((shippingCompound * percentage) / 100, precision)
                  : 0;
                vdDetails[`${intra.taxName}Total`] = vdDetails[
                  `${intra.taxName}Total`
                ]
                  ? vdDetails[`${intra.taxName}Total`]
                  : 0;
                vdDetails[`${intra.taxName}Total`] +=
                  product[`${intra.taxName}Value`] + product.shippingTax;
                shippingTax +=
                  product[`${intra.taxName}Value`] + product.shippingTax;
                vdDetails.totalTax = shippingTax;
                product.taxVolumeDiscountPercentage = shippingTax;
              }
            }
          });
        } else {
          const percentage = Settings.itemWiseShippingTax
            ? 0
            : beforeTaxPercentage;
          vdDetails.shippingTax = beforeTax
            ? round(overallShipping * (percentage / 100), precision)
            : 0;
          shippingTax = vdDetails.shippingTax;
          vdDetails.totalTax = shippingTax;
        }
      }
      if (product.volumeDiscount > 0) {
        product.volumeDiscountApplied = true;
        // product.volumeDiscount = vd.volumeDiscount
        product.unitVolumePrice = round(
          product.unitListPrice -
            (product.unitListPrice * parseFloat(product.volumeDiscount)) / 100,
          precision
        );
        product.totalVolumeDiscountPrice =
          product.askedQuantity * product.unitVolumePrice;
        addVolumeProd = addVolumeProd + product.totalVolumeDiscountPrice;
        if (product.productCost > 0 && product.unitVolumePrice > 0) {
          product.dmc = round(
            ((product.productCost + product.addonCost) /
              product.unitVolumePrice) *
              100,
            precision
          );
          product.marginPercentage = 100 - product.dmc;
        } else {
          product.dmc = 100;
          product.marginPercentage = 100 - product.dmc;
        }
      } else {
        product.volumeDiscountApplied = false;
      }
      addProd = addProd + product.totalPrice;
      pfRate = pfRate + product.pfRate;
      // }
      if (index === VdData.length - 1) {
        vdDetails.subTotal = subTotal;
        vdDetails.subTotalVolume = addProd;
        vdDetails.volumeDiscountApplied =
          round(subTotal) - round(vdDetails.subTotalVolume);
        vdDetails.overallTax = vdDetails?.totalTax;
        vdDetails.pfRate = pfRate;
        vdDetails.taxableAmount = beforeTax
          ? vdDetails.subTotalVolume + pfRate + overallShipping
          : vdDetails.subTotalVolume + pfRate;
        vdDetails.insuranceCharges = insuranceCharges;

        //REVIEW - Grand Total calculation...
        vdDetails.calculatedTotal =
          vdDetails.subTotalVolume +
          vdDetails?.totalTax +
          pfRate +
          overallShipping +
          insuranceCharges;
        vdDetails.grandTotal = Settings.roundingAdjustment
          ? round(vdDetails.calculatedTotal)
          : vdDetails.calculatedTotal;
        vdDetails.roundingAdjustment =
          vdDetails.grandTotal - vdDetails.calculatedTotal;
      }
    });
  } catch (_error) {
    // Error handled silently
  }
  return {
    products: VdData,
    vdDetails,
    pfRate,
  };
};
