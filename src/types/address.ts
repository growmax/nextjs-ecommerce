export interface Country {
  id: number;
  name: string;
  iso2?: string | null;
  iso3?: string | null;
  callingCodes?: string | string[] | number | null;
  flag?: string | null;
  numericCode?: string | null;
  region?: string | null;
  subregion?: string | null;
}

export interface CountryPhoneCode {
  iso2: string;
  name: string;
  callingCode: string;
  flag: string;
}

export interface State {
  id: number;
  name: string;
  countryId: number;
  countryCode?: string | null;
  stateCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface District {
  id: number;
  name: string;
  stateId: number;
  districtCode?: string | null;
}

export interface AddressAPIResponse<T> {
  data: T[];
  message: string;
  status: string;
}

export interface SelectOption {
  value: string;
  label: string;
}