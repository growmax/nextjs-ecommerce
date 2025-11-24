// Mock data for openElasticSearch testing

export const mockIdentifier = "test-product-123";

export const mockElasticIndex = "products";

export const mockElasticType = "pgproduct";

export const mockQueryType = "get";

export const mockRequestContext = {
  userId: 123,
  sessionId: "session456",
};

export const mockProductSearchOptions = {
  size: 10,
  from: 5,
};

export const mockSearchTerm = "laptop";

export const mockProductDetail = {
  id: "test-product-123",
  name: "Gaming Laptop",
  price: 1299.99,
  brand: "TechBrand",
};

export const mockProductSearchResponse = {
  success: true,
  data: [mockProductDetail],
  total: 1,
};

export const mockErrorResponse = {
  success: false,
  data: [],
  total: 0,
};

// Mock OpenSearch response
export const mockOpenSearchResponse = {
  body: {
    hits: {
      hits: [
        {
          _source: mockProductDetail,
        },
      ],
    },
  },
};

// Mock client and service instances
export const mockElasticClient = {
  callWith: jest.fn(),
  callWithSafe: jest.fn(),
};

export const mockBaseService = {
  callWith: jest.fn(),
  callWithSafe: jest.fn(),
  getInstance: jest.fn(),
};
