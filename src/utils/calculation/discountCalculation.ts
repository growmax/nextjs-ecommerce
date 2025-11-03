import _, { maxBy, toNumber } from "lodash";

interface DiscountRange {
  min_qty: number;
  max_qty: number;
  Value: number;
}

interface DiscountResult {
  suitableDiscount: DiscountRange | undefined;
  nextSuitableDiscount: DiscountRange | undefined;
}

/**
 *
 * @param quantity - Value to check the range between the list values
 * @param discountsList - Array to check the comparison
 * @param qtyIncrease - Value to compare for nextSuitable obj
 * @returns return matched discount with the product
 */
export function getSuitableDiscountByQuantity(
  quantity: number | string,
  discountsList: DiscountRange[],
  qtyIncrease: number | string
): DiscountResult {
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

interface QuantityValueResult {
  resultArr: DiscountRange[];
  nextSuitableDiscount: DiscountRange | undefined;
}

/**
 * Function that returns the ranges which lies between the quantity
 * @param quantity - Quantity to check the ranges between
 * @param arr - Array to check the comparison for the quantity
 * @param qtyIncrease - Value to compare for nextSuitable obj (currently unused)
 * @returns
 */
function getObjectsByQuantityValue(
  quantity: number,
  arr: DiscountRange[] = [],
  _qtyIncrease: number
): QuantityValueResult {
  const resultArr: DiscountRange[] = [];
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
    .filter((discount: DiscountRange) => {
      return discount.min_qty > quantity;
    })
    .sortBy("min_qty")
    .first()
    .value();
  return { resultArr, nextSuitableDiscount };
}
