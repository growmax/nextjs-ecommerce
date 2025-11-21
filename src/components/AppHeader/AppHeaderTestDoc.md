### App Header Tests

This document outlines the tests covering the `AppHeader` component.

- **Unauthenticated User State**:
  - The component renders a Login button when the user is not authenticated.
  - The Avatar card is not displayed when the user is not authenticated.
  - The Login button is properly visible and accessible to unauthenticated users.
  - The component correctly identifies when no user is logged in.

- **Navigation Behavior**:
  - Clicking the Login button navigates the user to the `/login` page.
  - The router's push method is called with the correct login route.
  - Navigation occurs immediately upon button click without delay.
  - The correct navigation path is passed to the routing system.

- **Authenticated User State**:
  - The component renders the Avatar card when the user is authenticated.
  - The Login button is not displayed when a user is authenticated.
  - The Avatar card is properly visible to authenticated users.
  - The component correctly identifies when a user is logged in.

- **User Profile Data Integration**:
  - The component receives and displays user profile information from the useUserProfile hook.
  - User data including name, email, and company information is accessible to child components.
  - The component properly handles user profile objects with all required fields.
  - Profile data updates are reflected in the component rendering.

- **Shopping Cart Integration**:
  - The component receives cart count information from the CartContext hook.
  - The cart count is initialized and available for display.
  - The component properly integrates with the shopping cart functionality.

- **Search Integration**:
  - The component integrates with the search functionality via the useSearch hook.
  - Search data, loading state, and error states are properly handled.
  - The component supports search feature availability.

- **Logout Functionality**:
  - The component integrates with the logout hook (useLogout).
  - Logout state (isLoggingOut) is properly tracked and available.
  - The logout handler is accessible from the component.

- **Sidebar Integration**:
  - The component is properly wrapped within a SidebarProvider context.
  - The sidebar state is correctly maintained during component rendering.
  - The header functions correctly within the sidebar layout context.

- **Mock Setup and Cleanup**:
  - All hooks are properly mocked before each test execution.
  - Mocks are cleared between tests to prevent test pollution.
  - Default mock states are established for hooks used by the component.
  - Mock restoration occurs after each test to ensure isolation.
