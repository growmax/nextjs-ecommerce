import getProductIds from "./getProductIds";

describe("getProductIds", () => {
  it("returns empty array for undefined or non-array", () => {
    expect(getProductIds(undefined)).toEqual([]);
    expect(getProductIds([])).toEqual([]);
  });

  it("extracts numeric ids from common fields", () => {
    const products = [
      { productId: 10 },
      { id: 20 },
      { dbProductId: 30 },
      { product_id: 40 },
      { productId: "50" }, // string should be ignored
      { someOther: 60 },
    ];

    expect(getProductIds(products)).toEqual([10, 20, 30, 40]);
  });

  it("ignores non-finite numbers", () => {
    const products = [
      { productId: NaN },
      { productId: Infinity },
      { productId: -Infinity },
    ];
    expect(getProductIds(products)).toEqual([]);
  });
});
