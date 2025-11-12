import each from "lodash/each";
import isEmpty from "lodash/isEmpty";
import remove from "lodash/remove";
import round from "lodash/round";

import type { CartItem } from "@/types/calculation/cart";
import type { TaxBreakup } from "@/types/calculation/tax";

export const handleBundleProductsLogic = (item: CartItem): CartItem => {
  const updatedItem = { ...item };
  let detectBundlePriceFromProduct = 0;
  let bundleUnitListPrice =
    updatedItem.initial_unitListPrice_fe || updatedItem.unitListPrice!;

  if (updatedItem.bundleProducts?.length) {
    updatedItem.bundleProducts.forEach(bp => {
      if (!bp.isBundleSelected_fe) {
        detectBundlePriceFromProduct +=
          bp.unitListPrice -
          bp.unitListPrice * ((updatedItem.discount || 0) / 100);
      }
      if (!bp.bundleSelected || !bp.isBundleSelected_fe) {
        bundleUnitListPrice -= bp.unitListPrice;
      }
    });

    updatedItem.unitListPrice = bundleUnitListPrice;
    updatedItem.discountedPrice =
      updatedItem.unitListPrice -
      (updatedItem.unitListPrice * (updatedItem.discountPercentage || 0)) / 100;
    updatedItem.unitPrice =
      (updatedItem.initial_discounted_price_fe || 0) -
      detectBundlePriceFromProduct;
  }

  return updatedItem;
};

export const processDiscountDetails = (
  cartData: CartItem[],
  taxExemption: boolean,
  precision = 2
): CartItem[] => {
  return cartData.map(item => {
    let updatedItem = { ...item };

    if (updatedItem.packagingQty !== undefined) {
      updatedItem.packagingQuantity = updatedItem.packagingQty;
    }

    if (
      updatedItem.minOrderQuantity === undefined &&
      updatedItem.packagingQuantity !== undefined
    ) {
      updatedItem.minOrderQuantity = updatedItem.packagingQuantity;
    }

    const askedQuantityForMOQ =
      updatedItem.askedQuantity ?? updatedItem.quantity;
    updatedItem.checkMOQ =
      updatedItem.minOrderQuantity !== undefined
        ? updatedItem.minOrderQuantity > askedQuantityForMOQ
        : false;

    updatedItem.bcProductCost = updatedItem.bcProductCost || 0;
    updatedItem.productCostLoad = updatedItem.productCost || 0;

    updatedItem.discountPercentage = updatedItem.discount || 0;

    const unitListPrice = updatedItem.unitListPrice ?? 0;

    if (
      updatedItem.initial_unitListPrice_fe === undefined &&
      updatedItem.unitListPrice !== undefined
    ) {
      updatedItem.initial_unitListPrice_fe = updatedItem.unitListPrice;
    }

    updatedItem.discountedPrice =
      unitListPrice - (unitListPrice * updatedItem.discountPercentage) / 100;

    if (updatedItem.initial_discounted_price_fe === undefined) {
      updatedItem.initial_discounted_price_fe = updatedItem.discountedPrice;
    }

    updatedItem.tax = updatedItem.hsnDetails?.tax
      ? parseFloat(String(updatedItem.hsnDetails.tax))
      : 0;

    if (!updatedItem.volumeDiscountApplied) {
      updatedItem.discount = updatedItem.discountPercentage;
      updatedItem.unitPrice = updatedItem.discountedPrice;

      updatedItem = handleBundleProductsLogic(updatedItem);
      updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
    }

    if (updatedItem.taxInclusive) {
      const taxRate = updatedItem.tax ?? 0;
      updatedItem.unitPrice = updatedItem.unitPrice / (1 + taxRate / 100);
    }

    if (taxExemption) {
      updatedItem.tax = 0;
    }

    updatedItem.unitLP = updatedItem.unitListPrice ?? 0;
    updatedItem.unitLPRp = updatedItem.unitListPrice ?? 0;
    updatedItem.actualdisc = updatedItem.discount ?? 0;
    updatedItem.acturalUP = updatedItem.unitPrice;

    if (updatedItem.showPrice || updatedItem.priceNotAvailable) {
      updatedItem.pfItemValue = updatedItem.pfItemValue || 0;
      updatedItem.pfRate = round(
        updatedItem.totalPrice * (updatedItem.pfItemValue / 100),
        precision
      );
    }

    // DMC calculation
    updatedItem.addonCost = 0;
    if ((updatedItem.productCost || 0) > 0 && updatedItem.unitPrice > 0) {
      updatedItem.dmc = round(
        ((updatedItem.productCost! + updatedItem.addonCost) /
          updatedItem.unitPrice) *
          100,
        precision
      );
      updatedItem.marginPercentage = 100 - updatedItem.dmc;
    } else {
      updatedItem.dmc = 100;
      updatedItem.marginPercentage = 100 - updatedItem.dmc;
    }

    updatedItem.productShortDescription = updatedItem.productShortDescription
      ? updatedItem.productShortDescription
      : updatedItem.shortDescription;
    updatedItem.askedQuantity = updatedItem.quantity;
    updatedItem.totalInterTax = taxExemption
      ? 0
      : parseFloat(String(updatedItem.hsnDetails?.interTax?.totalTax || 0));
    updatedItem.totalIntraTax = taxExemption
      ? 0
      : parseFloat(String(updatedItem.hsnDetails?.intraTax?.totalTax || 0));

    updatedItem.interTaxBreakup = [];
    updatedItem.compoundInter = remove(
      updatedItem.hsnDetails?.interTax?.taxReqLs || [],
      ["compound", true]
    );
    if (!isEmpty(updatedItem.compoundInter)) {
      const [firstCompoundInter] = updatedItem.compoundInter ?? [];
      if (firstCompoundInter && updatedItem.hsnDetails?.interTax?.taxReqLs) {
        updatedItem.hsnDetails.interTax.taxReqLs.push(firstCompoundInter);
      }
    }

    each(updatedItem.hsnDetails?.interTax?.taxReqLs || [], (taxes: any) => {
      const tax: TaxBreakup = {
        taxName: taxes.taxName,
        taxPercentage: taxExemption ? 0 : taxes.rate,
        compound: taxes.compound,
      };
      updatedItem.interTaxBreakup!.push(tax);
    });

    updatedItem.intraTaxBreakup = [];
    updatedItem.compoundIntra = remove(
      updatedItem.hsnDetails?.intraTax?.taxReqLs || [],
      ["compound", true]
    );
    if (!isEmpty(updatedItem.compoundIntra)) {
      const [firstCompoundIntra] = updatedItem.compoundIntra ?? [];
      if (firstCompoundIntra && updatedItem.hsnDetails?.intraTax?.taxReqLs) {
        updatedItem.hsnDetails.intraTax.taxReqLs.push(firstCompoundIntra);
      }
    }

    each(updatedItem.hsnDetails?.intraTax?.taxReqLs || [], (taxes: any) => {
      const tax: TaxBreakup = {
        taxName: taxes.taxName,
        taxPercentage: taxExemption ? 0 : taxes.rate,
        compound: taxes.compound,
      };
      updatedItem.intraTaxBreakup!.push(tax);
    });

    if (updatedItem.hsnDetails?.hsnCode !== undefined) {
      updatedItem.hsnCode = updatedItem.hsnDetails.hsnCode;
    }

    if (!updatedItem.showPrice || updatedItem.priceNotAvailable) {
      updatedItem.discountedPrice = 0;
      updatedItem.buyerRequestedPrice = 0;
      updatedItem.unitPrice = updatedItem.discountedPrice;
    } else {
      updatedItem.buyerRequestedPrice = updatedItem.unitPrice;
    }

    if (!updatedItem.showPrice || updatedItem.priceNotAvailable) {
      updatedItem.unitLP = 0;
      updatedItem.unitListPrice = 0;
    }

    updatedItem.shippingCharges = 0;
    updatedItem.cashdiscountValue = updatedItem.cashdiscountValue || 0;

    return updatedItem;
  });
};

export const addMoreProductUtils = (
  isInter: boolean,
  item: CartItem = {} as CartItem,
  _isSeller: boolean,
  taxExemption: boolean,
  precision = 2
): CartItem => {
  const updatedItem = { ...item };

  updatedItem.productCost = updatedItem.productCost || 0;
  updatedItem.bcProductCost = updatedItem.bcProductCost || 0;
  updatedItem.productCostLoad = updatedItem.productCost || 0;

  updatedItem.discountPercentage = updatedItem.discount || 0;
  const unitListPrice = updatedItem.unitListPrice ?? 0;

  updatedItem.discountedPrice =
    unitListPrice - (unitListPrice * updatedItem.discountPercentage) / 100;

  if (!updatedItem.volumeDiscountApplied) {
    updatedItem.discount = updatedItem.discountPercentage;
    updatedItem.unitPrice = updatedItem.discountedPrice;
  }

  if (!updatedItem.showPrice || updatedItem.priceNotAvailable) {
    updatedItem.discountedPrice = 0;
    updatedItem.buyerRequestedPrice = 0;
    updatedItem.unitPrice = updatedItem.discountedPrice;
  } else {
    updatedItem.buyerRequestedPrice = updatedItem.unitPrice;
  }

  updatedItem.actualdisc = updatedItem.discount ?? 0;
  updatedItem.acturalUP = updatedItem.unitPrice;

  // DMC calculation
  updatedItem.addonCost = 0;
  if ((updatedItem.productCost || 0) > 0 && updatedItem.unitPrice > 0) {
    updatedItem.dmc = round(
      ((updatedItem.productCost! + updatedItem.addonCost) /
        updatedItem.unitPrice) *
        100,
      precision
    );
    updatedItem.marginPercentage = 100 - updatedItem.dmc;
  } else {
    updatedItem.dmc = 100;
    updatedItem.marginPercentage = 100 - updatedItem.dmc;
  }

  updatedItem.productShortDescription = updatedItem.shortDescription;
  if (updatedItem.packagingQty !== undefined) {
    updatedItem.packagingQuantity = updatedItem.packagingQty;
  }
  updatedItem.askedQuantity = updatedItem.quantity;
  updatedItem.totalPrice = updatedItem.unitPrice * updatedItem.askedQuantity!;

  if (updatedItem.showPrice || updatedItem.priceNotAvailable) {
    updatedItem.pfItemValue = updatedItem.pfItemValue || 0;
    updatedItem.pfRate = round(
      updatedItem.totalPrice * (updatedItem.pfItemValue / 100),
      precision
    );
  }

  updatedItem.totalInterTax = parseFloat(
    String(updatedItem.hsnDetails?.interTax?.totalTax || 0)
  );
  updatedItem.totalIntraTax = parseFloat(
    String(updatedItem.hsnDetails?.intraTax?.totalTax || 0)
  );
  updatedItem.tax = isInter
    ? updatedItem.totalInterTax
    : updatedItem.totalIntraTax;

  if (updatedItem.taxInclusive) {
    const taxRate = updatedItem.tax ?? 0;
    updatedItem.unitPrice = updatedItem.unitPrice / (1 + taxRate / 100);
  }

  if (!taxExemption) {
    updatedItem.tax = isInter
      ? updatedItem.totalInterTax
      : updatedItem.totalIntraTax;
  } else {
    updatedItem.tax = 0;
  }

  updatedItem.totalInterTax = taxExemption
    ? 0
    : parseFloat(String(updatedItem.hsnDetails?.interTax?.totalTax || 0));
  updatedItem.totalIntraTax = taxExemption
    ? 0
    : parseFloat(String(updatedItem.hsnDetails?.intraTax?.totalTax || 0));
  updatedItem.tax = isInter
    ? updatedItem.totalInterTax
    : updatedItem.totalIntraTax;

  updatedItem.interTaxBreakup = [];
  updatedItem.compoundInter = remove(
    updatedItem.hsnDetails?.interTax?.taxReqLs || [],
    ["compound", true]
  );
  if (!isEmpty(updatedItem.compoundInter)) {
    const [firstCompoundInter] = updatedItem.compoundInter ?? [];
    if (firstCompoundInter && updatedItem.hsnDetails?.interTax?.taxReqLs) {
      updatedItem.hsnDetails.interTax.taxReqLs.push(firstCompoundInter);
    }
  }

  each(updatedItem.hsnDetails?.interTax?.taxReqLs || [], (taxes: any) => {
    const tax: TaxBreakup = {
      taxName: taxes.taxName,
      taxPercentage: taxExemption ? 0 : taxes.rate,
      compound: taxes.compound,
    };
    updatedItem.interTaxBreakup!.push(tax);
  });

  updatedItem.intraTaxBreakup = [];
  updatedItem.compoundIntra = remove(
    updatedItem.hsnDetails?.intraTax?.taxReqLs || [],
    ["compound", true]
  );
  if (!isEmpty(updatedItem.compoundIntra)) {
    const [firstCompoundIntra] = updatedItem.compoundIntra ?? [];
    if (firstCompoundIntra && updatedItem.hsnDetails?.intraTax?.taxReqLs) {
      updatedItem.hsnDetails.intraTax.taxReqLs.push(firstCompoundIntra);
    }
  }

  each(updatedItem.hsnDetails?.intraTax?.taxReqLs || [], (taxes: any) => {
    const tax: TaxBreakup = {
      taxName: taxes.taxName,
      taxPercentage: taxExemption ? 0 : taxes.rate,
      compound: taxes.compound,
    };
    updatedItem.intraTaxBreakup!.push(tax);
  });

  updatedItem.unitLP = updatedItem.unitListPrice ?? 0;
  if (updatedItem.hsnDetails?.hsnCode !== undefined) {
    updatedItem.hsnCode = updatedItem.hsnDetails.hsnCode;
  }
  updatedItem.unitLPRp = updatedItem.unitListPrice ?? 0;
  updatedItem.shippingCharges = 0;

  return updatedItem;
};
