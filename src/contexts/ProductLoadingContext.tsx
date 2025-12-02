"use client";

import { createContext, ReactNode, useContext } from "react";

interface ProductLoadingContextValue {
  isLoading: boolean;
}

const ProductLoadingContext = createContext<ProductLoadingContextValue>({
  isLoading: false,
});

export const useProductLoading = () => useContext(ProductLoadingContext);

export const ProductLoadingProvider = ({
  value,
  children,
}: {
  value: ProductLoadingContextValue;
  children: ReactNode;
}) => (
  <ProductLoadingContext.Provider value={value}>
    {children}
  </ProductLoadingContext.Provider>
);