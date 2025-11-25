import { homePageClient } from "@/lib/api/client";
import { BaseService } from "@/lib/api/services/BaseService";

// Country Data Interface
export interface CountryData {
  id: number;
  name: string;
  alpha2Code: string;
  alpha3Code: string;
  capital: string;
  numericCode: number;
  region: string;
  subregion: string;
  countryCode: string;
}

// State Data Interface
export interface StateData {
  countryCode: string;
  countryId: number;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  stateCode: string;
}

// District Data Interface
export interface DistrictData {
  id: number;
  name: string;
  stateId: number;
}

// Response Interfaces
export interface LocationResponse<T> {
  data: T[];
  message: string;
  status: string;
}

export class LocationService extends BaseService<LocationService> {
  protected defaultClient = homePageClient;

  async getAllCountries(): Promise<LocationResponse<CountryData>> {
    return this.call("/getCountry", {}, "GET") as Promise<
      LocationResponse<CountryData>
    >;
  }

  async getAllStates(): Promise<LocationResponse<StateData>> {
    return this.call("/getAllState", {}, "GET") as Promise<
      LocationResponse<StateData>
    >;
  }

  async getAllDistricts(): Promise<LocationResponse<DistrictData>> {
    return this.call("/getAllDistrict", {}, "GET") as Promise<
      LocationResponse<DistrictData>
    >;
  }

  async getStatesByCountry(
    countryId: number
  ): Promise<LocationResponse<StateData>> {
    const response = await this.getAllStates();
    // Filter states by countryId
    const filteredData = response.data.filter(
      state => state.countryId === countryId
    );
    return {
      ...response,
      data: filteredData,
    };
  }

  async getDistrictsByState(
    stateId: number
  ): Promise<LocationResponse<DistrictData>> {
    const response = await this.getAllDistricts();
    // Filter districts by stateId
    const filteredData = response.data.filter(
      district => district.stateId === stateId
    );
    return {
      ...response,
      data: filteredData,
    };
  }
}

export default LocationService.getInstance();
