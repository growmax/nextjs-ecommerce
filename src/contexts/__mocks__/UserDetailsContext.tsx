import React, { createContext, useContext } from 'react';

// Minimal mock values required for SummaryPriceDetails and SummaryProductsTable
const mockUser = {
  userId: 'test-user-id',
  displayName: 'Test User',
  roleName: 'Tester',
  // add any other fields used by components
  currency: 'USD',
  taxExempted: false,
};

const UserDetailsContext = createContext({
  isAuthenticated: true,
  isLoading: false,
  user: mockUser,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(() => true),
});

export const useUserDetails = () => useContext(UserDetailsContext);
export const useUserId = () => mockUser.userId;
export const useUserDisplayName = () => mockUser.displayName;
export const useUserRole = () => mockUser.roleName;
export const useIsAuthenticated = () => true;

export const MockUserDetailsProvider = ({ children }: { children: React.ReactNode }) => {
  const contextValue = {
    isAuthenticated: true,
    isLoading: false,
    user: mockUser,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(() => true),
  };
  return (
    <UserDetailsContext.Provider value={contextValue}>
      {children}
    </UserDetailsContext.Provider>
  );
};
