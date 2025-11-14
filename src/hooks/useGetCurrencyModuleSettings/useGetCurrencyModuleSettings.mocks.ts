// Mock data for useGetCurrencyModuleSettings tests

export const mockUser = {
  userId: "user-123",
  companyId: "company-456",
  currency: {
    currencyCode: "USD",
  },
};

export const mockBuyerCurrency = {
  currencyCode: "USD",
};

export const mockCurrencyModuleResponse = {
  data: {
    orderCurrencySec: [
      {
        sectionDetailName: "ORDER_VALUE_USD",
        sectionDetailValue: "100",
      },
      {
        sectionDetailName: "ORDER_VALUE_EUR",
        sectionDetailValue: "90",
      },
    ],
    quoteCurrencySec: [
      {
        sectionDetailName: "QUOTE_VALUE_USD",
        sectionDetailValue: "50",
      },
      {
        sectionDetailName: "QUOTE_VALUE_EUR",
        sectionDetailValue: "45",
      },
    ],
  },
};

export const mockEmptyCurrencyModuleResponse = {
  data: {
    orderCurrencySec: [],
    quoteCurrencySec: [],
  },
};
