export const sampleBranchResponse = {
  data: {
    id: 42,
    name: "Acme Corp",
    subIndustryId: { id: 7, name: "Widgets", description: "Makes widgets" },
    // include nested addressId shape used elsewhere
    addressId: { gst: "GST-ACME" },
  },
};

export const subIndustryOptions = [
  {
    id: 7,
    name: "Widgets",
    description: "Makes widgets",
    industryId: { name: "Manufacturing" },
  },
  {
    id: 8,
    name: "Gadgets",
    description: "Makes gadgets",
    industryId: { name: "Electronics" },
  },
];
