// Mock data for response-utils testing

export const mockValidSearchResponse = {
  body: {
    hits: {
      hits: [
        {
          _source: {
            id: 1,
            name: "Gaming Laptop Pro",
            brand_product_id: "GLP-001",
            brand_name: "TechBrand",
            product_short_description: "High-performance gaming laptop",
            price: 1299.99,
            is_published: 1,
          },
        },
        {
          _source: {
            id: 2,
            name: "Wireless Mouse",
            brand_product_id: "WM-002",
            brand_name: "TechBrand",
            product_short_description: "Ergonomic wireless mouse",
            price: 49.99,
            is_published: 1,
          },
        },
      ],
      total: { value: 2 },
    },
  },
};

export const mockEmptySearchResponse = {
  body: {
    hits: {
      hits: [],
      total: { value: 0 },
    },
  },
};

export const mockInvalidResponse = null;

export const mockMalformedResponse = {
  body: {},
};

export const mockPartialResponse = {
  body: {
    hits: {
      hits: [{ _source: { id: 1, name: "Test Product" } }],
      // Missing total
    },
  },
};

export const mockExpectedFormattedResponse = {
  success: true,
  data: [
    {
      id: 1,
      name: "Gaming Laptop Pro",
      brand_product_id: "GLP-001",
      brand_name: "TechBrand",
      product_short_description: "High-performance gaming laptop",
      price: 1299.99,
      is_published: 1,
    },
    {
      id: 2,
      name: "Wireless Mouse",
      brand_product_id: "WM-002",
      brand_name: "TechBrand",
      product_short_description: "Ergonomic wireless mouse",
      price: 49.99,
      is_published: 1,
    },
  ],
  total: 2,
};

export const mockErrorResponse = {
  success: false,
  data: [],
  total: 0,
};
