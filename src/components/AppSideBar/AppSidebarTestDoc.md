### App Sidebar Tests

This document outlines the tests covering the `AppSidebar` component.

- **Unauthenticated User Navigation**:
  - The sidebar renders only the "Home" item in the main navigation when the user is not authenticated.
  - The NavMain component receives exactly one navigation item for unauthenticated users.
  - The "Home" item is the only primary navigation option available to unauthenticated users.

- **Unauthenticated User Components**:
  - The NavUser component is not rendered when the user is not authenticated.
  - The TeamSwitcher component is still displayed even when the user is not authenticated.
  - The sidebar is accessible to unauthenticated users with limited navigation options.

- **Authenticated User Navigation**:
  - The sidebar renders all navigation items when the user is authenticated.
  - All four primary navigation items are displayed: "Home," "Dashboard," "Sales," and "Settings."
  - NavMain receives exactly four navigation items for authenticated users.
  - The navigation structure is properly populated with all available options.

- **Authenticated User Sub-Navigation**:
  - The "Sales" menu item contains sub-items for "Orders" and "Quotes."
  - The "Settings" menu item contains sub-items for "Company" and "Profile."
  - Sub-navigation items are correctly organized under their parent items.
  - All sub-items are accessible and properly linked.

- **Authenticated User Components**:
  - The NavUser component is rendered when the user is authenticated.
  - The TeamSwitcher component is displayed when the user is authenticated.
  - All sidebar components are visible to authenticated users.

- **Mobile Navigation Behavior**:
  - The sidebar detects when the application is running on a mobile device.
  - The setOpenMobile callback is triggered when navigation occurs on mobile.
  - The sidebar closes automatically (setOpenMobile(false)) after a user navigates on mobile.
  - The onNavigate handler properly communicates with the sidebar's mobile state management.

- **Sidebar Context Integration**:
  - The component correctly integrates with the SidebarProvider context.
  - The useSidebar hook provides mobile state information to the component.
  - The sidebar state (isMobile, setOpenMobile) is properly utilized.

- **User Context Integration**:
  - The component receives user authentication status from the UserDetailsContext.
  - User authentication state determines which navigation items and components are rendered.
  - The component reacts to changes in user authentication status.

- **Mock Setup and Data Handling**:
  - User details are properly mocked with authentication status and user information.
  - Default mock implementations provide baseline sidebar behavior.
  - The component handles both authenticated and unauthenticated user contexts.
  - Mock restoration ensures test isolation between executions.
