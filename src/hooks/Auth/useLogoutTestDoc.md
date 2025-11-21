### useLogout Hook Tests

This document outlines the tests covering the `useLogout` custom hook.

- **Successful Logout Flow**:
  - The hook successfully completes the logout process when the logout context method succeeds.
  - The hook redirects to the home page ("/") after a successful logout.
  - The redirectTo utility is called with the correct home page path.
  - The logout context method is invoked exactly once per logout action.

- **Error Handling**:
  - The hook gracefully handles logout errors from the context method.
  - The hook does not redirect when logout fails on the server.
  - The redirectTo utility is not called if the logout process encounters an error.
  - The user remains on the current page when logout fails.

- **Loading State Management**:
  - The hook exposes an `isLoggingOut` state that reflects the logout process status.
  - The `isLoggingOut` state is set to true when logout begins.
  - The `isLoggingOut` state is set back to false after logout completes (success or failure).
  - The loading state properly indicates when the async logout operation is in progress.

- **Double-Click Prevention**:
  - The hook prevents multiple simultaneous logout requests by checking `isLoggingOut` state.
  - If handleLogout is called while already logging out, the duplicate call is ignored.
  - The logout context method is called only once even if handleLogout is called multiple times.
  - The redirect is triggered only once per logout action.

- **State Transitions**:
  - The `isLoggingOut` state transitions from false to true when logout starts.
  - The `isLoggingOut` state transitions from true back to false when logout completes.
  - State transitions occur correctly regardless of success or failure.
  - The state accurately reflects the current logout operation status.

- **Hook API**:
  - The hook returns an object with `handleLogout` function and `isLoggingOut` state.
  - The handleLogout function is accessible and callable from component code.
  - The hook properly exposes its state and methods for component integration.

- **Context and Router Integration**:
  - The hook integrates with the UserDetailsContext to access the logout method.
  - The hook uses the next/navigation router for page navigation.
  - The hook utilizes the navigation utility (redirectTo) for post-logout redirection.
  - All external dependencies are properly mocked in tests.

- **Async Operation Handling**:
  - The hook properly handles asynchronous logout operations.
  - Promise resolution and rejection are correctly processed.
  - The hook waits for the logout operation to complete before changing state.
  - State updates occur after async operations complete.
