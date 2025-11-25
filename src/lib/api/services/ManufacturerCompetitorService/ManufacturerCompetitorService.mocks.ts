// Mocks for ManufacturerCompetitorService
// These mocks are for testing the service in isolation.

import type {
  CompetitorDetail,
  FetchCompetitorsResponse,
} from "@/lib/api/services/ManufacturerCompetitorService/ManufacturerCompetitorService";

export const mockCompanyId = 123;

export const mockCompetitorDetails: CompetitorDetail[] = [
  {
    id: 1,
    name: "Competitor 1",
    competitorName: "Competitor 1",
    manufacturerCompanyId: 123,
    createdDate: "2024-01-01",
    lastUpdatedDate: "2024-01-02",
  },
  {
    id: 2,
    name: "Competitor 2",
    competitorName: "Competitor 2",
    manufacturerCompanyId: 123,
    createdDate: "2024-01-01",
    lastUpdatedDate: "2024-01-02",
  },
];

export const mockFetchCompetitorsResponse: FetchCompetitorsResponse = {
  success: true,
  data: {
    competitorDetails: mockCompetitorDetails,
  },
};

export const mockFetchCompetitorsResponseEmpty: FetchCompetitorsResponse = {
  success: true,
  data: {
    competitorDetails: [],
  },
};
