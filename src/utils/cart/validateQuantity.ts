/**
 * Validates quantity based on step, minimum, and maximum values
 * Migrated from buyer-fe/src/utils/productUtils.js
 *
 * @param step - Packaging quantity or step value
 * @param min - Minimum order quantity (MOQ)
 * @param max - Maximum allowed quantity
 * @param value - Quantity value to validate
 * @returns Error message string or false if valid
 */
export function ValidateQuantity(
  step: number,
  min: number,
  max: number,
  value: number
): string | false {
  let errMessage: string | false = false;
  const isStepValid = ValidateStep(step, min, value);

  if (value) {
    if (parseFloat(String(value)) < parseFloat(String(min))) {
      errMessage = `Enter minimum value of ${min}`;
    } else {
      if (isStepValid) {
        if (parseFloat(String(value)) > parseFloat(String(max))) {
          errMessage = `Enter maximum value of ${max}`;
        }
      } else {
        errMessage = `Enter in multiples of ${step}`;
      }
    }
  } else {
    errMessage = "Quantity Required";
  }

  return errMessage;
}

/**
 * Validates if value follows the step pattern from stepBase
 * Migrated from buyer-fe/src/utils/productUtils.js
 *
 * @param step - Step value
 * @param stepBase - Base step value (usually MOQ)
 * @param value - Value to validate
 * @returns true if valid step, false otherwise
 */
export function ValidateStep(
  step: number,
  stepBase: number,
  value: number
): boolean {
  const valueDecimals = countDecimals(value);
  const stepBaseDecimals = countDecimals(stepBase);
  const stepDecimals = countDecimals(step);
  const decimalCount = Math.max(valueDecimals, stepBaseDecimals, stepDecimals);
  const multiplier = Math.pow(10, decimalCount);
  const adjustedValue = value * multiplier;
  const adjustedStepBase = stepBase * multiplier;
  const adjustedStep = step * multiplier;
  return (adjustedValue - adjustedStepBase) % adjustedStep === 0;
}

/**
 * Counts decimal places in a number
 * Migrated from buyer-fe/src/utils/productUtils.js
 *
 * @param value - Number to count decimals for
 * @returns Number of decimal places
 */
export function countDecimals(value: number): number {
  const numString = value.toString();
  if (numString.indexOf(".") === -1) {
    return 0;
  }
  return numString.split(".")[1]?.length || 0;
}
