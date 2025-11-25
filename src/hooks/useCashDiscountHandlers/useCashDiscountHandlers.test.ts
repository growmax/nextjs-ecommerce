import { renderHook, act } from "@testing-library/react";
import { toast } from "sonner";
import useCashDiscountHandlers from "@/hooks/useCashDiscountHandlers/useCashDiscountHandlers";
import {
  mockProducts,
  mockPaymentTerms,
  mockSetProducts,
} from "@/hooks/useCashDiscountHandlers/useCashDiscountHandlers.mocks";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useCashDiscountHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetProducts.mockClear();
  });

  it("should apply cash discount to products", () => {
    const { result } = renderHook(() =>
      useCashDiscountHandlers({
        products: mockProducts,
        setProducts: mockSetProducts,
      })
    );

    act(() => {
      result.current.handleCDApply(5, false);
    });

    expect(mockSetProducts).toHaveBeenCalledTimes(1);
    const updatedProducts = mockSetProducts.mock.calls[0][0];
    expect(updatedProducts[0].cashdiscountValue).toBe(5);
    expect(updatedProducts[1].cashdiscountValue).toBe(5);
    expect(toast.success).toHaveBeenCalledWith(
      "Cash discount applied successfully"
    );
  });

  it("should apply cash discount with payment terms", () => {
    const { result } = renderHook(() =>
      useCashDiscountHandlers({
        products: mockProducts,
        setProducts: mockSetProducts,
      })
    );

    act(() => {
      result.current.handleCDApply(5, true, mockPaymentTerms);
    });

    expect(mockSetProducts).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      "Payment terms updated with cash discount successfully"
    );
  });

  it("should preserve originalUnitPrice when applying discount", () => {
    const productsWithoutOriginal = mockProducts.map(p => ({
      ...p,
      originalUnitPrice: undefined,
    })) as any;

    const { result } = renderHook(() =>
      useCashDiscountHandlers({
        products: productsWithoutOriginal as any,
        setProducts: mockSetProducts,
      })
    );

    act(() => {
      result.current.handleCDApply(5, false);
    });

    const updatedProducts = mockSetProducts.mock.calls[0][0];
    expect(updatedProducts[0].originalUnitPrice).toBe(100);
    expect(updatedProducts[1].originalUnitPrice).toBe(50);
  });

  it("should remove cash discount from products", () => {
    const productsWithDiscount = mockProducts.map(p => ({
      ...p,
      cashdiscountValue: 5,
    }));

    const { result } = renderHook(() =>
      useCashDiscountHandlers({
        products: productsWithDiscount,
        setProducts: mockSetProducts,
      })
    );

    act(() => {
      result.current.handleRemoveCD();
    });

    expect(mockSetProducts).toHaveBeenCalledTimes(1);
    const updatedProducts = mockSetProducts.mock.calls[0][0];
    expect(updatedProducts[0].cashdiscountValue).toBe(0);
    expect(updatedProducts[1].cashdiscountValue).toBe(0);
    expect(toast.success).toHaveBeenCalledWith(
      "Payment terms removed with cash discount successfully"
    );
  });

  it("should restore original unit price when removing discount", () => {
    const productsWithDiscount = mockProducts.map(p => ({
      ...p,
      unitPrice: 95, // Discounted price
      originalUnitPrice: 100,
      cashdiscountValue: 5,
    }));

    const { result } = renderHook(() =>
      useCashDiscountHandlers({
        products: productsWithDiscount,
        setProducts: mockSetProducts,
      })
    );

    act(() => {
      result.current.handleRemoveCD();
    });

    const updatedProducts = mockSetProducts.mock.calls[0][0];
    expect(updatedProducts[0].unitPrice).toBe(100);
    expect(updatedProducts[0].cashdiscountValue).toBe(0);
  });

  it("should handle zero cash discount value", () => {
    const { result } = renderHook(() =>
      useCashDiscountHandlers({
        products: mockProducts,
        setProducts: mockSetProducts,
      })
    );

    act(() => {
      result.current.handleCDApply(0, false);
    });

    const updatedProducts = mockSetProducts.mock.calls[0][0];
    expect(updatedProducts[0].cashdiscountValue).toBe(0);
    expect(updatedProducts[1].cashdiscountValue).toBe(0);
  });

  it("should memoize handlers to prevent unnecessary re-renders", () => {
    const { result, rerender } = renderHook(() =>
      useCashDiscountHandlers({
        products: mockProducts,
        setProducts: mockSetProducts,
      })
    );

    const firstHandleCDApply = result.current.handleCDApply;
    const firstHandleRemoveCD = result.current.handleRemoveCD;

    rerender();

    expect(result.current.handleCDApply).toBe(firstHandleCDApply);
    expect(result.current.handleRemoveCD).toBe(firstHandleRemoveCD);
  });
});
