/**
 * Mock data and utilities for SPRForm component tests
 */

import type { CompetitorDetail } from "@/lib/api";

// Mock competitor details
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
  {
    id: 3,
    name: "Competitor 3",
    competitorName: "Competitor Three",
    manufacturerCompanyId: 123,
  },
];

// Mock seller company ID
export const mockSellerCompanyId = 123;

// Mock form values
export const mockFormValues = {
  customerName: "Test Customer",
  projectName: "Test Project",
  competitors: ["Competitor 1"],
  priceJustification: "Test justification text",
};

// Mock empty form values
export const mockEmptyFormValues = {
  customerName: "",
  projectName: "",
  competitors: [],
  priceJustification: "",
};

// Mock callback functions
export const mockCallbacks = {
  onCustomerNameChange: jest.fn(),
  onProjectNameChange: jest.fn(),
  onCompetitorsChange: jest.fn(),
  onPriceJustificationChange: jest.fn(),
};

// Mock translations
export const mockTranslations = {
  customerInformation: "Customer Information",
  endCustomerName: "End Customer Name",
  enterCustomerName: "Enter customer name",
  projectName: "Project Name",
  enterProjectName: "Enter project name",
  competitors: "Competitors",
  selectCompetitors: "Select competitors",
  loadingCompetitors: "Loading competitors...",
  noCompetitorsAvailable: "No competitors available",
  removeCompetitor: "Remove {competitor}",
  priceJustification: "Price Justification",
  enterPriceJustification: "Enter price justification",
};

