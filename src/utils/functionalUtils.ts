import _, { maxBy, toNumber } from "lodash";

export function getSuitableDiscountByQuantity(
  quantity: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  discountsList: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  qtyIncrease: any // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  const { resultArr: ranges, nextSuitableDiscount } = getObjectsByQuantityValue(
    toNumber(quantity),
    discountsList,
    toNumber(qtyIncrease)
  );
  const suitableDiscount = maxBy(ranges, "Value");
  // let nextSuitableDiscount =  last(nextSuitableDiscArr)
  // if(nextSuitableDiscount?.Value === suitableDiscount?.Value || nextSuitableDiscount?.Value < suitableDiscount?.Value){
  //     nextSuitableDiscount = maxBy(discountsList, 'Value') ?  maxBy(discountsList, 'Value') : null
  // }
  return { suitableDiscount, nextSuitableDiscount };
}

function getObjectsByQuantityValue(
  quantity: any,
  arr: any = [],
  _qtyIncrease?: any
) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const resultArr = [];
  // const nextSuitableDiscArr = [];
  for (const obj of arr) {
    if (obj.min_qty <= quantity && quantity <= obj.max_qty) {
      resultArr.push(obj);
    }
    // if (obj.min_qty >= (quantity + qtyIncrease) && (quantity + qtyIncrease) <= obj.max_qty) {
    //   nextSuitableDiscArr.push(obj)
    // }
  }
  const nextSuitableDiscount = _.chain(arr)
    .filter(discount => {
      return discount.min_qty > quantity;
    })
    .sortBy("min_qty")
    .first()
    .value();
  return { resultArr, nextSuitableDiscount };
}

export const assign_pricelist_discounts_data_to_products = (
  product: any = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  prd_wise_discData: any = {}, // eslint-disable-line @typescript-eslint/no-explicit-any
  updateDiscounts: any = true // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  product.disc_prd_related_obj = prd_wise_discData
    ? prd_wise_discData
    : product.disc_prd_related_obj || {};
  product.isProductAvailableInPriceList =
    product.disc_prd_related_obj.isProductAvailableInPriceList;
  if (updateDiscounts) {
    if (
      product.disc_prd_related_obj.MasterPrice === null ||
      product.disc_prd_related_obj.BasePrice === null ||
      !product.disc_prd_related_obj.isProductAvailableInPriceList
    ) {
      product.priceNotAvailable = true;
    } else {
      product.priceNotAvailable = false;
    }
  }

  //Pricing....
  product.MasterPrice = product.disc_prd_related_obj.MasterPrice;
  product.BasePrice = product.disc_prd_related_obj.BasePrice;

  //Pricelist...
  product.priceListCode = product.disc_prd_related_obj.priceListCode;
  product.plnErpCode = product.disc_prd_related_obj.plnErpCode;

  //Discounts...
  product.discountsList = product.disc_prd_related_obj.discounts || [];
  product.quantity = product.quantity
    ? product.quantity
    : product?.minOrderQuantity
      ? parseFloat(product?.minOrderQuantity)
      : product?.packagingQuantity
        ? parseFloat(product?.packagingQuantity)
        : 1;
  const { suitableDiscount, nextSuitableDiscount } =
    getSuitableDiscountByQuantity(
      product?.quantity,
      product.discountsList,
      product?.packagingQty
        ? product?.packagingQty
        : product?.packagingQuantity || 1
    );
  product.CantCombineWithOtherDisCounts =
    suitableDiscount?.CantCombineWithOtherDisCounts;
  product.nextSuitableDiscount = nextSuitableDiscount;
  product.discountDetails = { ...suitableDiscount };

  product.discountDetails.BasePrice = product.BasePrice;
  product.discountDetails.plnErpCode = product.plnErpCode;
  product.discountDetails.priceListCode = product.priceListCode;
  product.discountDetails.pricingConditionCode =
    product.disc_prd_related_obj?.pricingConditionCode || null;

  product.overrideDiscount =
    ((product.MasterPrice - product.BasePrice) / product.MasterPrice) * 100 ||
    0;

  if (updateDiscounts) {
    //Setting master, base, and discount based on pricelist override data..
    if (product.disc_prd_related_obj?.isOveridePricelist === false) {
      product.unitListPrice = product.MasterPrice;

      product.discount =
        product.overrideDiscount + (product.discountDetails?.Value || 0);

      // When isOveridePricelist is false, apply total discount (override + additional) on MasterPrice

      product.discountedPrice =
        product.MasterPrice - (product.MasterPrice - product.BasePrice);
    } else {
      product.unitListPrice = product.BasePrice;

      product.discount = product.discountDetails?.Value || 0;
      product.discountedPrice =
        product.BasePrice - (product.BasePrice * product.discount) / 100;
    }
    product.pricingConditionCode =
      product.disc_prd_related_obj?.PricingCondition || null;
  }

  product.discountPercentage = product.discount;

  //reorder scenario
  product.isApprovalRequired = product.disc_prd_related_obj.isApprovalRequired;
  return product;
};
