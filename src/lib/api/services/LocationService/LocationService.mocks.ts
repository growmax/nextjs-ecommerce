// Mocks for LocationService
// These mocks are for testing the service in isolation.

import type {
  CountryData,
  DistrictData,
  LocationResponse,
  StateData,
} from "./LocationService";

export const mockCountriesResponse: LocationResponse<CountryData> = {
  data: [
    {
      id: 1,
      name: "United States",
      alpha2Code: "US",
      alpha3Code: "USA",
      capital: "Washington, D.C.",
      numericCode: 840,
      region: "Americas",
      subregion: "Northern America",
      countryCode: "US",
    },
    {
      id: 2,
      name: "India",
      alpha2Code: "IN",
      alpha3Code: "IND",
      capital: "New Delhi",
      numericCode: 356,
      region: "Asia",
      subregion: "Southern Asia",
      countryCode: "IN",
    },
  ],
  message: "Success",
  status: "success",
};

export const mockStatesResponse: LocationResponse<StateData> = {
  data: [
    {
      id: 1,
      name: "California",
      stateCode: "CA",
      countryCode: "US",
      countryId: 1,
      latitude: 36.7783,
      longitude: -119.4179,
    },
    {
      id: 2,
      name: "New York",
      stateCode: "NY",
      countryCode: "US",
      countryId: 1,
      latitude: 40.7128,
      longitude: -74.006,
    },
    {
      id: 3,
      name: "Maharashtra",
      stateCode: "MH",
      countryCode: "IN",
      countryId: 2,
      latitude: 19.7515,
      longitude: 75.7139,
    },
  ],
  message: "Success",
  status: "success",
};

export const mockDistrictsResponse: LocationResponse<DistrictData> = {
  data: [
    {
      id: 1,
      name: "Los Angeles",
      stateId: 1,
    },
    {
      id: 2,
      name: "San Francisco",
      stateId: 1,
    },
    {
      id: 3,
      name: "Manhattan",
      stateId: 2,
    },
    {
      id: 4,
      name: "Mumbai",
      stateId: 3,
    },
  ],
  message: "Success",
  status: "success",
};
