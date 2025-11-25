// Mocks for ModuleService
// These mocks are for testing the service in isolation.

import type { Module } from "@/lib/api/services/ModuleService/ModuleService";

export const mockModuleParams: Module = {
  userId: "123",
  companyId: "456",
};

export const mockModuleParamsWithNumbers: Module = {
  userId: 123,
  companyId: 456,
};

export const mockModuleResponse = {
  success: true,
  data: [
    {
      moduleId: "module-1",
      moduleName: "Orders",
      isEnabled: true,
    },
    {
      moduleId: "module-2",
      moduleName: "Quotes",
      isEnabled: true,
    },
  ],
};
