// Mocks for useGetManufacturerCompetitors
// These mocks are for testing the hook in isolation.

import type { CompetitorDetail } from "@/lib/api";

export const mockSellerCompanyId = 123;
export const mockSellerCompanyIdString = "123";

export const mockCompetitorDetails: CompetitorDetail[] = [
  {
    id: 1,
    name: "Competitor 1",
    competitorName: "Competitor One",
    manufacturerCompanyId: 123,
    createdDate: "2024-01-01",
    lastUpdatedDate: "2024-01-02",
  },
  {
    id: 2,
    name: "Competitor 2",
    competitorName: "Competitor Two",
    manufacturerCompanyId: 123,
    createdDate: "2024-01-01",
    lastUpdatedDate: "2024-01-02",
  },
];

export const mockFetchCompetitorsResponse = {
  data: {
    competitorDetails: mockCompetitorDetails,
  },
};

export const mockEmptyResponse = {
  data: {
    competitorDetails: [],
  },
};

export const mockError = new Error("Failed to fetch competitors");

export const mockManufacturerCompetitorService = {
  fetchCompetitors: jest.fn(),
};
