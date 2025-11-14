// Mocks for useCheckVolumeDiscountEnabled
// These mocks are for testing the hook in isolation.

import axios from "axios";

export const mockCompanyId = 123;
export const mockCompanyIdString = "123";

export const mockAxiosResponseEnabled = {
  data: {
    data: true,
  },
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
};

export const mockAxiosResponseDisabled = {
  data: {
    data: false,
  },
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as any,
};

export const mockAxiosError = {
  message: "Network Error",
  response: {
    status: 500,
    data: {
      error: "Internal Server Error",
    },
  },
  isAxiosError: true,
};

export const mockAxios = axios as jest.Mocked<typeof axios>;
