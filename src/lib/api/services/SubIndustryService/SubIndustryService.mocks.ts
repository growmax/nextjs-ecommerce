// Mocks for SubIndustryService
// These mocks are for testing the service in isolation.

export const mockSubIndustryResponse = [
  {
    id: 1,
    name: "Sub Industry 1",
    description: "Description 1",
    industryId: {
      id: 1,
      name: "Industry 1",
      tenantId: 1,
    },
    tenantId: 1,
  },
  {
    id: 2,
    name: "Sub Industry 2",
    description: "Description 2",
    industryId: {
      id: 2,
      name: "Industry 2",
      tenantId: 1,
    },
    tenantId: 1,
  },
];
