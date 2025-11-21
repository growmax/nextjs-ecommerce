import * as yup from "yup";
import { containsXSS } from "../sanitization/sanitization.utils";

/**
 * Buyer Quote Summary Validation Schema
 * Migrated from buyer-fe/src/validations/Sales/sales.validation.js
 *
 * Validates:
 * - customerRequiredDate (conditional based on isCustomerDateRequired)
 * - buyerReferenceNumber (XSS validation, max 35 chars)
 * - comment (XSS validation, max 2000 chars)
 * - sprDetails (conditional validation when SPR is enabled)
 * - products (quantity validation, MOQ, packaging multiples, target price)
 */
export const BuyerQuoteSummaryValidations = yup.object().shape({
  customerRequiredDate: yup.date().when("isCustomerDateRequired", {
    is: true,
    then: (schema: any) =>
      schema
        .typeError("Provide required delivery date")
        .required("Provide required delivery date")
        .nullable(),
    otherwise: (schema: any) => schema.notRequired().nullable(),
  }),
  buyerReferenceNumber: yup
    .string()
    .nullable()
    .max(35, "Invalid content")
    .test(
      "validation",
      "Invalid content",
      (value: any) => !value || !containsXSS(value)
    ),
  comment: yup
    .string()
    .nullable()
    .max(2000, "Invalid content")
    .test(
      "validation",
      "Invalid content",
      (value: any) => !value || !containsXSS(value)
    ),
  sprDetails: yup.object().shape({
    spr: yup.boolean(),
    companyName: yup
      .string()
      .test(
        "xss-validation",
        "Invalid content",
        (value: any) => !value || !containsXSS(value)
      )
      .when("spr", {
        is: true,
        then: (schema: any) =>
          schema.required("Invalid content").max(250, "Invalid content"),
        otherwise: (schema: any) => schema.notRequired(),
      }),
    projectName: yup
      .string()
      .test(
        "xss-validation",
        "Invalid content",
        (value: any) => !value || !containsXSS(value)
      )
      .when("spr", {
        is: true,
        then: (schema: any) =>
          schema.required("Invalid content").max(250, "Invalid content"),
        otherwise: (schema: any) => schema.notRequired(),
      }),
    competitorNames: yup
      .array()
      .test("xss-validation", "Invalid content", (value: any) => {
        if (!value) return true;
        return !value.some(
          (name: unknown) => typeof name === "string" && containsXSS(name)
        );
      })
      .when("spr", {
        is: true,
        then: (schema: any) => schema.min(1, "Invalid content"),
        otherwise: (schema: any) => schema.notRequired(),
      }),
    priceJustification: yup
      .string()
      .test(
        "xss-validation",
        "Invalid content",
        (value: any) => !value || !containsXSS(value)
      )
      .when("spr", {
        is: true,
        then: (schema: any) =>
          schema.required("Invalid content").max(1000, "Invalid content"),
        otherwise: (schema: any) => schema.notRequired(),
      }),
  }),
  products: yup.array().of(
    yup.lazy((value: any) => {
      const productValue = value as {
        askedQuantity?: number;
        packagingQuantity?: number;
        minOrderQuantity?: number;
        stepCheck?: boolean;
      };

      const packagingQuantity = parseFloat(
        String(productValue.packagingQuantity || 1)
      );
      const minOrderQuantity = productValue.minOrderQuantity
        ? parseFloat(String(productValue.minOrderQuantity))
        : packagingQuantity;

      productValue.stepCheck =
        (productValue.askedQuantity || 0) % packagingQuantity === 0;

      return yup.object().shape({
        askedQuantity: yup
          .number()
          .required("Quantity is required")
          .min(minOrderQuantity, `MOQ is ${minOrderQuantity}`)
          .max(9999999, "Quantity must be less than 9999999")
          .test(
            "is-multiple-of-packaging",
            `Enter in multiples of ${packagingQuantity}`,
            (val: any) => {
              if (val === undefined || val === null) return false;
              const tolerance = 0.001;
              return Math.abs((val / packagingQuantity) % 1) <= tolerance;
            }
          ),
        buyerRequestedPrice: yup
          .number()
          .required("Target price is required")
          .typeError("Must be a number"),
      });
    })
  ),
});

export type BuyerQuoteSummaryFormData = yup.InferType<
  typeof BuyerQuoteSummaryValidations
>;
