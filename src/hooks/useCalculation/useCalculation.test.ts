import { renderHook } from "@testing-library/react";
import { useCalculation } from "./useCalculation";
import {
  mockCalculationParams,
  mockEmptyProducts,
  mockExpectedEmptyResult,
  mockProductWithoutHsn,
} from "./useCalculation.mocks";

// Mock the calculation utilities
jest.mock("@/utils/calculation/cartCalculation", () => ({
  cartCalculation: jest.fn(products => ({
    totalItems: products.length,
    totalLP: 120,
    totalValue: 200,
    totalTax: 36,
    totalShipping: 20,
    pfRate: 0,
    taxableAmount: 200,
    grandTotal: 256,
  })),
  discountDetails: jest.fn(products => products),
}));

jest.mock("@/utils/calculation/tax-breakdown", () => ({
  calculateShippingTax: jest.fn((shipping, cartValue, products) => ({
    cartValue: {
      ...cartValue,
      totalShipping: shipping,
    },
    products,
    breakup: [{ label: "Shipping Tax", value: 3.6 }],
  })),
}));

describe("useCalculation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return globalCalc function", () => {
    const { result } = renderHook(() => useCalculation());

    expect(result.current.globalCalc).toBeDefined();
    expect(typeof result.current.globalCalc).toBe("function");
  });

  it("should return empty result when no products provided", () => {
    const { result } = renderHook(() => useCalculation());
    const calculationResult = result.current.globalCalc(mockEmptyProducts);

    expect(calculationResult).toEqual(mockExpectedEmptyResult);
  });

  it("should calculate cart values for products with HSN details", () => {
    const { result } = renderHook(() => useCalculation());
    const calculationResult = result.current.globalCalc(mockCalculationParams);

    expect(calculationResult.cartValue).toBeDefined();
    expect(calculationResult.products).toBeDefined();
    expect(calculationResult.breakup).toBeDefined();
    expect(calculationResult.cartValue.totalItems).toBe(1);
  });

  it("should calculate cart values for products without HSN details", () => {
    const { result } = renderHook(() => useCalculation());
    const paramsWithoutHsn = {
      ...mockCalculationParams,
      products: [mockProductWithoutHsn],
    };

    const calculationResult = result.current.globalCalc(paramsWithoutHsn);

    expect(calculationResult.cartValue).toBeDefined();
    expect(calculationResult.products).toBeDefined();
    expect(calculationResult.breakup).toEqual([]);
  });

  it("should normalize product properties", () => {
    const { result } = renderHook(() => useCalculation());
    const productWithMissingProps = {
      productId: 3,
      // Missing many properties
    };

    const params = {
      products: [productWithMissingProps],
      isInter: true,
    };

    const calculationResult = result.current.globalCalc(params);

    expect(calculationResult.products).toBeDefined();
    expect(calculationResult.products.length).toBeGreaterThan(0);
  });

  it("should use default values for optional parameters", () => {
    const { result } = renderHook(() => useCalculation());
    const minimalParams = {
      products: mockCalculationParams.products,
      isInter: true,
    };

    const calculationResult = result.current.globalCalc(minimalParams);

    expect(calculationResult.cartValue).toBeDefined();
    expect(calculationResult.products).toBeDefined();
  });

  it("should handle calculation errors gracefully", () => {
    const { result } = renderHook(() => useCalculation());

    // Mock cartCalculation to throw an error
    const { cartCalculation } = jest.requireMock(
      "@/utils/calculation/cartCalculation"
    );
    cartCalculation.mockImplementationOnce(() => {
      throw new Error("Calculation error");
    });

    const calculationResult = result.current.globalCalc(mockCalculationParams);

    expect(calculationResult.cartValue).toBeDefined();
    expect(calculationResult.cartValue.totalItems).toBe(1);
    expect(calculationResult.products).toBeDefined();
  });

  it("should memoize the globalCalc function", () => {
    const { result, rerender } = renderHook(() => useCalculation());
    const firstGlobalCalc = result.current.globalCalc;

    rerender();

    expect(result.current.globalCalc).toBe(firstGlobalCalc);
  });
});
