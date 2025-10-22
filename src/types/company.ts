// src/types/company.ts
export interface SubIndustry {
  id: string;
  name: string;
  description: string;
}

export interface CompanyData {
  id: string;
  name: string;
  website?: string;
  addressId?: {
    gst: string;
  };
  subIndustryId?: SubIndustry;
  businessTypeId?: {
    id: string;
    name: string;
  };
  accountTypeId?: {
    id: string;
    name: string;
  };
  currencyId?: {
    currencyCode: string;
  };
}
