import each from "lodash/each";

import type {
  CalculationSettings,
  CartItem,
  VolumeDiscountData,
  VolumeDiscountDetails,
} from "@/types/calculation/cart";
import type {
  VolumeDiscountCalculationResult,
  VolumeDiscountItem,
} from "@/types/calculation/volume-discount";

export const calculateVolumeDiscount = (
  isInter: boolean,
  products: CartItem[],
  volumeDiscountData: VolumeDiscountData[],
  subTotal: number,
  overallShipping: number,
  settings: CalculationSettings,
  beforeTax: boolean,
  beforeTaxPercentage: number,
  precision = 2
): {
  products: CartItem[];
  vdDetails: VolumeDiscountDetails;
  pfRate: number;
} => {
  const vdDetails: VolumeDiscountDetails = {
    subTotal,
    subTotalVolume: 0,
    volumeDiscountApplied: 0,
    overallTax: 0,
    taxableAmount: 0,
    grandTotal: 0,
    pfRate: 0,
    totalTax: 0,
  };

  let addProd = 0;
  let addTax = 0;
  let addVolumeProd = 0;
  const productsAfterVd = [...products];
  let pfRate = 0;
  let shippingTax = 0;

  productsAfterVd.forEach((product, index) => {
    let shippingCompound = 0;

    volumeDiscountData?.forEach((vd, indexvd) => {
      if (product.itemNo === vd.itemNo) {
        product.appliedDiscount = vd.appliedDiscount;

        product.unitPrice = parseFloat(
          (
            product.unitListPrice! -
            (product.unitListPrice! *
              parseFloat(String(product.appliedDiscount))) /
              100
          ).toFixed(precision)
        );

        product.totalPrice = product.askedQuantity! * product.unitPrice;
        product.pfRate = parseFloat(
          (product.totalPrice * (product.pfItemValue! / 100)).toFixed(precision)
        );
        product.taxVolumeDiscountPercentage = parseFloat(
          (
            ((product.totalPrice + (product.pfRate || 0)) *
              parseFloat(String(product.tax))) /
            100
          ).toFixed(precision)
        );
        product.volumeDiscount = vd.volumeDiscount;

        if (beforeTax && settings.itemWiseShippingTax) {
          product.itemTaxableAmount =
            product.unitPrice +
            product.pfRate / product.askedQuantity! +
            (product.shippingCharges || 0);
        } else {
          product.itemTaxableAmount =
            product.unitPrice + product.pfRate / product.askedQuantity!;
        }

        if (isInter) {
          product.tax = product.hsnDetails?.interTax?.totalTax || 0;
          let intraTotalTax = 0;

          if (product.interTaxBreakup?.length) {
            each(product.interTaxBreakup, inter => {
              product[inter.taxName as keyof CartItem] = inter.taxPercentage;

              const percentage = settings.itemWiseShippingTax
                ? (product[inter.taxName as keyof CartItem] as number) || 0
                : beforeTaxPercentage;

              if (!inter.compound) {
                product[`${inter.taxName}Value` as keyof CartItem] = parseFloat(
                  (
                    ((product.totalPrice + (product.pfRate || 0)) *
                      inter.taxPercentage) /
                    100
                  ).toFixed(precision)
                );
                intraTotalTax += product[
                  `${inter.taxName}Value` as keyof CartItem
                ] as number;
              } else {
                product[`${inter.taxName}Value` as keyof CartItem] = parseFloat(
                  ((intraTotalTax * inter.taxPercentage) / 100).toFixed(
                    precision
                  )
                );
              }

              if (!settings.itemWiseShippingTax) {
                vdDetails[
                  `${inter.taxName}Total` as keyof VolumeDiscountDetails
                ] =
                  ((vdDetails[
                    `${inter.taxName}Total` as keyof VolumeDiscountDetails
                  ] as number) || 0) +
                  (product[
                    `${inter.taxName}Value` as keyof CartItem
                  ] as number);
                shippingTax += product[
                  `${inter.taxName}Value` as keyof CartItem
                ] as number;
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
                          ((product.shippingCharges || 0) *
                            product.askedQuantity! *
                            percentage) /
                          100
                        ).toFixed(precision)
                      )
                    : 0;
                  vdDetails[
                    `${inter.taxName}Total` as keyof VolumeDiscountDetails
                  ] =
                    ((vdDetails[
                      `${inter.taxName}Total` as keyof VolumeDiscountDetails
                    ] as number) || 0) +
                    ((product[
                      `${inter.taxName}Value` as keyof CartItem
                    ] as number) +
                      (Number(product.shippingTax) || 0));
                  shippingTax +=
                    (product[
                      `${inter.taxName}Value` as keyof CartItem
                    ] as number) + (Number(product.shippingTax) || 0);
                  vdDetails.totalTax = shippingTax;
                  product.taxVolumeDiscountPercentage = shippingTax;
                  shippingCompound += Number(product.shippingTax) || 0;
                } else {
                  product.shippingTax = beforeTax
                    ? parseFloat(
                        ((shippingCompound * percentage) / 100).toFixed(
                          precision
                        )
                      )
                    : 0;
                  vdDetails[
                    `${inter.taxName}Total` as keyof VolumeDiscountDetails
                  ] =
                    ((vdDetails[
                      `${inter.taxName}Total` as keyof VolumeDiscountDetails
                    ] as number) || 0) +
                    ((product[
                      `${inter.taxName}Value` as keyof CartItem
                    ] as number) +
                      (Number(product.shippingTax) || 0));
                  shippingTax +=
                    (product[
                      `${inter.taxName}Value` as keyof CartItem
                    ] as number) + (Number(product.shippingTax) || 0);
                  vdDetails.totalTax = shippingTax;
                  product.taxVolumeDiscountPercentage = shippingTax;
                }
              }
            });
          } else {
            const percentage = settings.itemWiseShippingTax
              ? 0
              : beforeTaxPercentage;
            vdDetails.shippingTax = beforeTax
              ? parseFloat(
                  (overallShipping * (percentage / 100)).toFixed(precision)
                )
              : 0;
            shippingTax = shippingTax + (vdDetails.shippingTax || 0);
            vdDetails.totalTax = shippingTax;
          }
        } else {
          product.tax = product.hsnDetails?.intraTax?.totalTax || 0;
          let interTotalTax = 0;

          if (product.intraTaxBreakup?.length) {
            each(product.intraTaxBreakup, intra => {
              product[intra.taxName as keyof CartItem] = intra.taxPercentage;

              const percentage = settings.itemWiseShippingTax
                ? (product[intra.taxName as keyof CartItem] as number) || 0
                : beforeTaxPercentage;

              if (!intra.compound) {
                product[`${intra.taxName}Value` as keyof CartItem] = parseFloat(
                  (
                    ((product.totalPrice + (product.pfRate || 0)) *
                      intra.taxPercentage) /
                    100
                  ).toFixed(precision)
                );
                interTotalTax += product[
                  `${intra.taxName}Value` as keyof CartItem
                ] as number;
              } else {
                product[`${intra.taxName}Value` as keyof CartItem] = parseFloat(
                  ((interTotalTax * intra.taxPercentage) / 100).toFixed(
                    precision
                  )
                );
              }

              if (!settings.itemWiseShippingTax) {
                vdDetails[
                  `${intra.taxName}Total` as keyof VolumeDiscountDetails
                ] =
                  ((vdDetails[
                    `${intra.taxName}Total` as keyof VolumeDiscountDetails
                  ] as number) || 0) +
                  (product[
                    `${intra.taxName}Value` as keyof CartItem
                  ] as number);
                shippingTax += product[
                  `${intra.taxName}Value` as keyof CartItem
                ] as number;
                vdDetails.shippingTax = beforeTax
                  ? parseFloat(
                      (overallShipping * (percentage / 100)).toFixed(precision)
                    )
                  : 0;
                product.taxVolumeDiscountPercentage =
                  (vdDetails.shippingTax || 0) + shippingTax;
                vdDetails.totalTax = product.taxVolumeDiscountPercentage;
              } else {
                if (!intra.compound) {
                  product.shippingTax = beforeTax
                    ? parseFloat(
                        (
                          ((product.shippingCharges || 0) *
                            product.askedQuantity! *
                            percentage) /
                          100
                        ).toFixed(precision)
                      )
                    : 0;
                  vdDetails[
                    `${intra.taxName}Total` as keyof VolumeDiscountDetails
                  ] =
                    ((vdDetails[
                      `${intra.taxName}Total` as keyof VolumeDiscountDetails
                    ] as number) || 0) +
                    ((product[
                      `${intra.taxName}Value` as keyof CartItem
                    ] as number) +
                      (Number(product.shippingTax) || 0));
                  shippingTax +=
                    (product[
                      `${intra.taxName}Value` as keyof CartItem
                    ] as number) + (Number(product.shippingTax) || 0);
                  vdDetails.totalTax = shippingTax;
                  product.taxVolumeDiscountPercentage = shippingTax;
                  shippingCompound += Number(product.shippingTax) || 0;
                } else {
                  product.shippingTax = beforeTax
                    ? parseFloat(
                        ((shippingCompound * percentage) / 100).toFixed(
                          precision
                        )
                      )
                    : 0;
                  vdDetails[
                    `${intra.taxName}Total` as keyof VolumeDiscountDetails
                  ] =
                    ((vdDetails[
                      `${intra.taxName}Total` as keyof VolumeDiscountDetails
                    ] as number) || 0) +
                    ((product[
                      `${intra.taxName}Value` as keyof CartItem
                    ] as number) +
                      (Number(product.shippingTax) || 0));
                  shippingTax +=
                    (product[
                      `${intra.taxName}Value` as keyof CartItem
                    ] as number) + (Number(product.shippingTax) || 0);
                  vdDetails.totalTax = shippingTax;
                  product.taxVolumeDiscountPercentage = shippingTax;
                }
              }
            });
          } else {
            const percentage = settings.itemWiseShippingTax
              ? 0
              : beforeTaxPercentage;
            vdDetails.shippingTax = beforeTax
              ? parseFloat(
                  (overallShipping * (percentage / 100)).toFixed(precision)
                )
              : 0;
            shippingTax = vdDetails.shippingTax || 0;
            vdDetails.totalTax = shippingTax;
          }
        }

        if (vd.volumeDiscount > 0) {
          product.volumeDiscountApplied = true;
          product.volumeDiscount = vd.volumeDiscount;
          product.unitVolumePrice = parseFloat(
            (
              product.unitListPrice! -
              (product.unitListPrice! * parseFloat(String(vd.volumeDiscount))) /
                100
            ).toFixed(precision)
          );
          product.totalVolumeDiscountPrice =
            product.askedQuantity! * product.unitVolumePrice;
          addVolumeProd = addVolumeProd + product.totalVolumeDiscountPrice;

          if ((product.productCost || 0) > 0 && product.unitVolumePrice > 0) {
            product.dmc = parseFloat(
              (
                (((product.productCost || 0) + (product.addonCost || 0)) /
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

      if (
        index === products.length - 1 &&
        indexvd === volumeDiscountData.length - 1
      ) {
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
        ((product.totalPrice * (product.tax || 0)) / 100).toFixed(precision)
      );
      addProd = addProd + product.totalPrice;
      addTax = addTax + product.taxVolumeDiscountPercentage;
    }

    if (index === products.length - 1 && volumeDiscountData.length === 0) {
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

export const calculateVolumeDiscountV2 = (
  isInter: boolean,
  volumeDiscountData: VolumeDiscountItem[],
  subTotal: number,
  insuranceCharges: number,
  beforeTax: boolean,
  beforeTaxPercentage: number,
  overallShipping: number,
  settings: CalculationSettings,
  precision = 2
): VolumeDiscountCalculationResult => {
  const vdDetails: VolumeDiscountDetails = {
    subTotal,
    subTotalVolume: 0,
    volumeDiscountApplied: 0,
    overallTax: 0,
    taxableAmount: 0,
    grandTotal: 0,
    pfRate: 0,
    totalTax: 0,
    insuranceCharges,
    calculatedTotal: 0,
    roundingAdjustment: 0,
  };

  let addProd = 0;
  let addVolumeProd = 0;
  let pfRate = 0;
  let shippingTax = 0;

  try {
    volumeDiscountData.forEach((product, index) => {
      let shippingCompound = 0;

      if (
        (product.discChanged ? true : !product.CantCombineWithOtherDisCounts) &&
        product.volume_discount_obj?.Percentage
      ) {
        product.volumeDiscount = product.volume_discount_obj.Percentage;
        product.appliedDiscount =
          product.volumeDiscount + (product.discount || 0);

        if (!product.additionalDiscounts?.length) {
          product.additionalDiscounts = [];
        }
        product.additionalDiscounts.push({
          ...product.volume_discount_obj,
          discounId: product.volume_discount_obj.DiscountId,
          discountPercentage: product.volume_discount_obj.Percentage,
        });
      } else {
        product.volumeDiscount = 0;
        product.appliedDiscount = product.discount || 0;
      }

      product.unitPrice = parseFloat(
        (
          product.unitListPrice! -
          (product.unitListPrice! * (product.appliedDiscount || 0)) / 100
        ).toFixed(precision)
      );

      product.tax = parseFloat(String(product.hsnDetails?.tax || 0));

      if (product.taxInclusive) {
        product.unitPrice = product.unitPrice / (1 + product.tax / 100);
        product.unitPrice = parseFloat(product.unitPrice.toFixed(precision));
      }

      product.totalPrice = parseFloat(
        (product.askedQuantity! * product.unitPrice).toFixed(precision)
      );
      product.pfRate = parseFloat(
        (product.totalPrice * (product.pfItemValue! / 100)).toFixed(precision)
      );

      product.taxVolumeDiscountPercentage = parseFloat(
        (((product.totalPrice + (product.pfRate || 0)) * product.tax) / 100).toFixed(
          precision
        )
      );

      if (beforeTax && settings.itemWiseShippingTax) {
        product.itemTaxableAmount =
          product.unitPrice +
          product.pfRate / product.askedQuantity! +
          (product.shippingCharges || 0);
      } else {
        product.itemTaxableAmount =
          product.unitPrice + product.pfRate / product.askedQuantity!;
      }

      if (isInter) {
        product.tax = product.hsnDetails?.interTax?.totalTax || 0;
        let intraTotalTax = 0;

        if (product.interTaxBreakup?.length) {
          each(product.interTaxBreakup, inter => {
            product[inter.taxName as keyof VolumeDiscountItem] =
              inter.taxPercentage;

            const percentage = settings.itemWiseShippingTax
              ? (product[
                  inter.taxName as keyof VolumeDiscountItem
                ] as number) || 0
              : beforeTaxPercentage;

            if (!inter.compound) {
              product[`${inter.taxName}Value` as keyof VolumeDiscountItem] =
                parseFloat(
                  (
                    (((product.totalPrice ?? 0) + (product.pfRate || 0)) *
                      inter.taxPercentage) /
                    100
                  ).toFixed(precision)
                );
              intraTotalTax += product[
                `${inter.taxName}Value` as keyof VolumeDiscountItem
              ] as number;
            } else {
              product[`${inter.taxName}Value` as keyof VolumeDiscountItem] =
                parseFloat(
                  ((intraTotalTax * inter.taxPercentage) / 100).toFixed(
                    precision
                  )
                );
            }

            if (!settings.itemWiseShippingTax) {
              vdDetails[
                `${inter.taxName}Total` as keyof VolumeDiscountDetails
              ] =
                ((vdDetails[
                  `${inter.taxName}Total` as keyof VolumeDiscountDetails
                ] as number) || 0) +
                (product[
                  `${inter.taxName}Value` as keyof VolumeDiscountItem
                ] as number);
              shippingTax += product[
                `${inter.taxName}Value` as keyof VolumeDiscountItem
              ] as number;
              vdDetails.shippingTax = beforeTax
                ? parseFloat(
                    (overallShipping * (percentage / 100)).toFixed(precision)
                  )
                : 0;
              product.taxVolumeDiscountPercentage =
                (vdDetails.shippingTax || 0) + shippingTax;
              vdDetails.totalTax = product.taxVolumeDiscountPercentage;
            } else {
              if (!inter.compound) {
                product.shippingTax = beforeTax
                  ? parseFloat(
                      (
                        ((product.shippingCharges || 0) *
                          product.askedQuantity! *
                          percentage) /
                        100
                      ).toFixed(precision)
                    )
                  : 0;
                vdDetails[
                  `${inter.taxName}Total` as keyof VolumeDiscountDetails
                ] =
                  ((vdDetails[
                    `${inter.taxName}Total` as keyof VolumeDiscountDetails
                  ] as number) || 0) +
                  ((product[
                    `${inter.taxName}Value` as keyof VolumeDiscountItem
                  ] as number) +
                    (Number(product.shippingTax) || 0));
                shippingTax +=
                  (product[
                    `${inter.taxName}Value` as keyof VolumeDiscountItem
                  ] as number) + (Number(product.shippingTax) || 0);
                vdDetails.totalTax = shippingTax;
                product.taxVolumeDiscountPercentage = shippingTax;
                shippingCompound = product.shippingTax || 0;
              } else {
                product.shippingTax = beforeTax
                  ? parseFloat(
                      ((shippingCompound * percentage) / 100).toFixed(precision)
                    )
                  : 0;
                vdDetails[
                  `${inter.taxName}Total` as keyof VolumeDiscountDetails
                ] =
                  ((vdDetails[
                    `${inter.taxName}Total` as keyof VolumeDiscountDetails
                  ] as number) || 0) +
                  ((product[
                    `${inter.taxName}Value` as keyof VolumeDiscountItem
                  ] as number) +
                    (Number(product.shippingTax) || 0));
                shippingTax +=
                  (product[
                    `${inter.taxName}Value` as keyof VolumeDiscountItem
                  ] as number) + (Number(product.shippingTax) || 0);
                vdDetails.totalTax = shippingTax;
                product.taxVolumeDiscountPercentage = shippingTax;
              }
            }
          });
        } else {
          const percentage = settings.itemWiseShippingTax
            ? 0
            : beforeTaxPercentage;
          vdDetails.shippingTax = beforeTax
            ? parseFloat(
                (overallShipping * (percentage / 100)).toFixed(precision)
              )
            : 0;
          shippingTax = shippingTax + (vdDetails.shippingTax || 0);
          product.taxVolumeDiscountPercentage =
            (vdDetails.shippingTax || 0) + shippingTax;
          vdDetails.totalTax = product.taxVolumeDiscountPercentage;
        }
      } else {
        product.tax = product.hsnDetails?.intraTax?.totalTax || 0;
        let interTotalTax = 0;

        if (product.intraTaxBreakup?.length) {
          each(product.intraTaxBreakup, intra => {
            product[intra.taxName as keyof VolumeDiscountItem] =
              intra.taxPercentage;

            const percentage = settings.itemWiseShippingTax
              ? (product[
                  intra.taxName as keyof VolumeDiscountItem
                ] as number) || 0
              : beforeTaxPercentage;

            if (!intra.compound) {
              product[`${intra.taxName}Value` as keyof VolumeDiscountItem] =
                parseFloat(
                  (
                    (((product.totalPrice ?? 0) + (product.pfRate || 0)) *
                      intra.taxPercentage) /
                    100
                  ).toFixed(precision)
                );
              interTotalTax += product[
                `${intra.taxName}Value` as keyof VolumeDiscountItem
              ] as number;
            } else {
              product[`${intra.taxName}Value` as keyof VolumeDiscountItem] =
                parseFloat(
                  ((interTotalTax * intra.taxPercentage) / 100).toFixed(
                    precision
                  )
                );
            }

            if (!settings.itemWiseShippingTax) {
              vdDetails[
                `${intra.taxName}Total` as keyof VolumeDiscountDetails
              ] =
                ((vdDetails[
                  `${intra.taxName}Total` as keyof VolumeDiscountDetails
                ] as number) || 0) +
                (product[
                  `${intra.taxName}Value` as keyof VolumeDiscountItem
                ] as number);
              shippingTax += product[
                `${intra.taxName}Value` as keyof VolumeDiscountItem
              ] as number;
              vdDetails.shippingTax = beforeTax
                ? parseFloat(
                    (overallShipping * (percentage / 100)).toFixed(precision)
                  )
                : 0;
              product.taxVolumeDiscountPercentage =
                (vdDetails.shippingTax || 0) + shippingTax;
              vdDetails.totalTax = product.taxVolumeDiscountPercentage;
            } else {
              if (!intra.compound) {
                product.shippingTax = beforeTax
                  ? parseFloat(
                      (
                        ((product.shippingCharges || 0) *
                          product.askedQuantity! *
                          percentage) /
                        100
                      ).toFixed(precision)
                    )
                  : 0;
                vdDetails[
                  `${intra.taxName}Total` as keyof VolumeDiscountDetails
                ] =
                  ((vdDetails[
                    `${intra.taxName}Total` as keyof VolumeDiscountDetails
                  ] as number) || 0) +
                  ((product[
                    `${intra.taxName}Value` as keyof VolumeDiscountItem
                  ] as number) +
                    (Number(product.shippingTax) || 0));
                shippingTax +=
                  (product[
                    `${intra.taxName}Value` as keyof VolumeDiscountItem
                  ] as number) + (Number(product.shippingTax) || 0);
                vdDetails.totalTax = shippingTax;
                product.taxVolumeDiscountPercentage = shippingTax;
                shippingCompound += product.shippingTax || 0;
              } else {
                product.shippingTax = beforeTax
                  ? parseFloat(
                      ((shippingCompound * percentage) / 100).toFixed(precision)
                    )
                  : 0;
                vdDetails[
                  `${intra.taxName}Total` as keyof VolumeDiscountDetails
                ] =
                  ((vdDetails[
                    `${intra.taxName}Total` as keyof VolumeDiscountDetails
                  ] as number) || 0) +
                  ((product[
                    `${intra.taxName}Value` as keyof VolumeDiscountItem
                  ] as number) +
                    (Number(product.shippingTax) || 0));
                shippingTax +=
                  (product[
                    `${intra.taxName}Value` as keyof VolumeDiscountItem
                  ] as number) + (Number(product.shippingTax) || 0);
                vdDetails.totalTax = shippingTax;
                product.taxVolumeDiscountPercentage = shippingTax;
              }
            }
          });
        } else {
          const percentage = settings.itemWiseShippingTax
            ? 0
            : beforeTaxPercentage;
          vdDetails.shippingTax = beforeTax
            ? parseFloat(
                (overallShipping * (percentage / 100)).toFixed(precision)
              )
            : 0;
          shippingTax = vdDetails.shippingTax || 0;
          vdDetails.totalTax = shippingTax;
        }
      }

      if (product.volumeDiscount! > 0) {
        product.volumeDiscountApplied = true;
        product.unitVolumePrice = parseFloat(
          (
            product.unitListPrice! -
            (product.unitListPrice! * product.volumeDiscount!) / 100
          ).toFixed(precision)
        );
        product.totalVolumeDiscountPrice =
          product.askedQuantity! * product.unitVolumePrice;
        addVolumeProd = addVolumeProd + product.totalVolumeDiscountPrice;

        if ((product.productCost || 0) > 0 && product.unitVolumePrice > 0) {
          product.dmc = parseFloat(
            (
              ((product.productCost + (product.addonCost || 0)) /
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

      if (index === volumeDiscountData.length - 1) {
        vdDetails.subTotal = subTotal;
        vdDetails.subTotalVolume = addProd;
        vdDetails.volumeDiscountApplied =
          parseFloat(String(subTotal)) -
          parseFloat(String(vdDetails.subTotalVolume));
        vdDetails.overallTax = vdDetails.totalTax || 0;
        vdDetails.pfRate = pfRate;
        vdDetails.taxableAmount = beforeTax
          ? vdDetails.subTotalVolume + pfRate + overallShipping
          : vdDetails.subTotalVolume + pfRate;
        vdDetails.insuranceCharges = insuranceCharges;

        vdDetails.calculatedTotal =
          vdDetails.subTotalVolume +
          (vdDetails.totalTax || 0) +
          pfRate +
          overallShipping +
          insuranceCharges;
        vdDetails.grandTotal = settings.roundingAdjustment
          ? parseFloat(String(vdDetails.calculatedTotal))
          : vdDetails.calculatedTotal;
        vdDetails.roundingAdjustment =
          vdDetails.grandTotal - vdDetails.calculatedTotal;
      }
    });
  } catch {}

  return {
    products: volumeDiscountData,
    vdDetails,
    pfRate,
  };
};
