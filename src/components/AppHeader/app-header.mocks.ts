export const mockUserProfile = {
  displayName: "Test User",
  picture: "",
};

export const mockCartCount = 3;

export const mockBuildQueryResult = { query: { match: { name: "laptop" } } };

export const mockRouter = {
  push: jest.fn(),
};

export const mockLogout = {
  isLoggingOut: false,
  handleLogout: jest.fn(),
};

export const mockUserDetails = {
  isAuthenticated: true,
};

export const mockSidebar = {
  state: "expanded",
};
