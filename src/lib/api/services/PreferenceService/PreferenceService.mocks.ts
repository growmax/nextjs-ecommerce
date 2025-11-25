// Mocks for PreferenceService
// These mocks are for testing the service in isolation.

import type {
  FilterPreferenceResponse,
  OrderPreferencesRequest,
  OrderPreferencesResponse,
  PreferenceData,
  UserPreference,
} from "@/lib/api/services/PreferenceService/PreferenceService";

export const mockUserPreference: UserPreference = {
  id: "pref-1",
  userId: "123",
  module: "order",
  preferences: {
    theme: "dark",
    language: "en",
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

export const mockFilterPreferenceResponse: FilterPreferenceResponse = {
  id: 1,
  userId: 123,
  companyId: 456,
  isMobile: false,
  module: "order",
  preference: {
    filters: [
      {
        filter_index: 0,
        filter_name: "Default",
        accountId: [1, 2],
        accountOwners: [],
        approvalAwaiting: [],
        endDate: "",
        endCreatedDate: "",
        endValue: null,
        endTaxableAmount: null,
        endGrandTotal: null,
        identifier: "",
        limit: 20,
        offset: 0,
        name: "",
        pageNumber: 1,
        startDate: "",
        startCreatedDate: "",
        startValue: null,
        startTaxableAmount: null,
        startGrandTotal: null,
        status: [],
        quoteUsers: [],
        tagsList: [],
        options: [],
        branchId: [],
        businessUnitId: [],
        selectedColumns: [],
        columnWidth: [],
        columnPosition: "",
      },
    ],
    selected: 0,
  },
};

export const mockOrderPreferencesRequest: OrderPreferencesRequest = {
  userId: 123,
  companyId: 456,
  tenantCode: "tenant-1",
  module: "order",
  isMobile: false,
};

export const mockOrderPreferencesResponse: OrderPreferencesResponse = {
  data: {
    id: 1,
    userId: 123,
    companyId: 456,
    isMobile: false,
    module: "order",
    preferences: {
      theme: "dark",
      language: "en",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  message: "Success",
  status: "success",
};

export const mockPreferenceData: PreferenceData = {
  filters: [
    {
      filter_index: 0,
      filter_name: "Default",
      accountId: [1, 2],
      accountOwners: [],
      approvalAwaiting: [],
      endDate: "",
      endCreatedDate: "",
      endValue: null,
      endTaxableAmount: null,
      endGrandTotal: null,
      identifier: "",
      limit: 20,
      offset: 0,
      name: "",
      pageNumber: 1,
      startDate: "",
      startCreatedDate: "",
      startValue: null,
      startTaxableAmount: null,
      startGrandTotal: null,
      status: [],
      quoteUsers: [],
      tagsList: [],
      options: [],
      branchId: [],
      businessUnitId: [],
      selectedColumns: [],
      columnWidth: [],
      columnPosition: "",
    },
  ],
  selected: 0,
};

export const mockJwtPayload = {
  userId: 123,
  companyId: 456,
  tenantId: "tenant-1",
  elasticCode: "elastic-1",
};

export const mockAccessToken = "mock-access-token";

export const mockContext = {
  accessToken: "mock-access-token",
  companyId: 456,
  isMobile: false,
  userId: 123,
  tenantCode: "tenant-1",
};
