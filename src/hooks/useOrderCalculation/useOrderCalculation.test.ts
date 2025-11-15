import { renderHook } from "@testing-library/react";
import useOrderCalculation from "./useOrderCalculation";
import { mockOrderCalculationInput } from "./useOrderCalculation.mocks";

describe("useOrderCalculation", () => {
  it("calculates order data correctly for basic input", () => {
    const { result } = renderHook(() =>
      useOrderCalculation(mockOrderCalculationInput)
    );
    const { calculatedData, isCalculating } = result.current;

    expect(isCalculating).toBe(false);
    expect(calculatedData.products.length).toBe(1);
    expect(calculatedData.cartValue.totalItems).toBeGreaterThanOrEqual(0);
    expect(calculatedData.cartValue.grandTotal).toBeGreaterThan(0);
    expect(calculatedData.metadata.totalProducts).toBe(1);
    expect(calculatedData.warnings.length).toBe(0);
  });

  it("returns empty products and zero totals for empty input", () => {
    const emptyInput = { ...mockOrderCalculationInput, products: [] };
    const { result } = renderHook(() => useOrderCalculation(emptyInput));
    const { calculatedData } = result.current;
    expect(calculatedData.products).toEqual([]);
    expect(calculatedData.cartValue.grandTotal).toBe(0);
  });
});
