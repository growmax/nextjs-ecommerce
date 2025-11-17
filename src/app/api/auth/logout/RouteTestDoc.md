### Logout Route Tests

This document outlines the tests covering the `POST /api/auth/logout` API route.

- **Token Handling**:
  - The route successfully logs out a user when tokens are provided in the request body.
  - The route successfully logs out a user when tokens are retrieved from cookies.
  - The route prioritizes tokens from the request body over cookies when both are present.
  - All authentication tokens (access_token, refresh_token, access_token_client, auth-token) are properly cleared from cookies.

- **Authentication Verification**:
  - The route returns a 401 status code if no access token is provided in either the request body or cookies.
  - An appropriate error message ("No access token provided") is returned when authentication fails.
  - The external auth service is not called when authentication validation fails.

- **External Service Communication**:
  - The route correctly forwards logout requests to the external authentication service.
  - The route sends tokens in the correct format to the auth service endpoint.
  - The route properly constructs the logout URL using the AUTH_URL environment variable.
  - HTTP method is correctly set to POST for the auth service call.

- **Error Handling**:
  - The route handles network failures gracefully when the external auth service is unreachable.
  - The route returns a 500 status code when logout fails on the backend.
  - An appropriate error message ("Failed to logout") is returned when the logout process encounters an error.
  - The user session cookies are still cleared even if the external logout fails.

- **Session Management**:
  - A new anonymous token is generated for each logout request.
  - Each anonymous token is unique and distinct from previous logout operations.
  - The anonymous token is properly set in the response cookies with the format "anon\_\*".
  - The token generation ensures new anonymous sessions for subsequent unauthenticated requests.

- **Environment Configuration**:
  - The route correctly uses the AUTH_URL environment variable for the auth service endpoint.
  - The route correctly uses the DEFAULT_ORIGIN environment variable for request context.
