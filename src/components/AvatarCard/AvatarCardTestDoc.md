# AvatarCard Component Test Documentation

## Overview

This document details the comprehensive testing approach for the AvatarCard component, a critical UI element that handles user profile information display and account management functionality across our e-commerce platform.

The AvatarCard component serves as the main entry point for user account interactions including profile access, company settings, orders, quotes, and logout functionality. Given its importance in the authentication flow and user experience, we've implemented both isolated unit tests and integration tests to ensure robust functionality.

## Test Structure

Our testing approach follows a two-tiered strategy:

1. **Unit Tests** (`AvatarCard.test.tsx`): Focused on isolated component functionality
2. **Integration Tests** (`AvatarCard.integration.test.tsx`): Testing the component within realistic application contexts

## Unit Test Coverage

### Loading States

- **Null User Handling**: Verifies proper loading indicator when user data is null
- **Appropriate Loading Messages**: Confirms "Loading user..." message and spinner are displayed

### Error States

- **Error UI Display**: Tests that error messages appear correctly when API calls fail
- **Error Recovery**: Verifies that retry functionality works as expected
- **Visual Indicators**: Confirms error icons and messaging meet design requirements

### User Information Display

- **Profile Data Rendering**: Validates correct display of user name, email, and company
- **Avatar Initialization**: Tests the fallback initials generation algorithm
- **Empty Value Handling**: Confirms appropriate behavior when user fields are null/empty

### Menu Items

- **Default Navigation**: Tests presence of all standard navigation options
- **Conditional Menu Items**: Verifies that Orders and Quotes can be conditionally displayed
- **Link Functionality**: Ensures navigation links have correct href attributes

### Logout Functionality

- **Logout Action**: Verifies onLogout callback fires correctly on button click
- **Logout UI States**: Tests the visual indicators during logout process
- **Disabled Controls**: Confirms buttons are appropriately disabled during logout

### Props and Configuration

- **Custom Styling**: Tests that menuClassName is properly applied
- **Positioning Options**: Validates align and side props affect dropdown positioning
- **Custom Triggers**: Ensures custom trigger elements render correctly

### Edge Cases

- **Minimal User Data**: Tests behavior with partial user information
- **Special Values**: Validates handling of placeholder values like "No company" or "No email"

### Accessibility

- **ARIA Attributes**: Validates proper aria-labels for different component states
- **Keyboard Navigation**: Ensures component is usable with keyboard interactions
- **State Communication**: Tests that loading/error states are properly communicated

## Integration Test Coverage

### Real Data Flow

- **Context Integration**: Tests component with actual UserDetailsContext data
- **Profile Updates**: Verifies component reacts correctly to changes in user profile
- **Authentication State**: Tests component behavior during authentication state transitions

### User Journey Scenarios

- **Login to Logout Flow**: Simulates complete user authentication lifecycle
- **Session Expiration**: Tests handling of expired user sessions
- **Error Recovery Flow**: Validates the full error-retry-success path

### Layout Integration

- **Header Integration**: Tests AvatarCard within app header context
- **Responsive Behavior**: Validates component appearance across screen sizes
- **Complex UI Interactions**: Tests interaction with other header elements (search, cart)

### Performance and Stability

- **Rapid State Changes**: Tests resilience during frequent state updates
- **Memory Management**: Verifies no memory leaks during repeated rendering
- **Large Data Handling**: Tests with extended user profile information

### Cross-Component Synchronization

- **Multiple Instances**: Validates consistent behavior across multiple AvatarCard instances
- **Shared State Updates**: Tests that state changes propagate correctly
- **Component Hierarchy**: Verifies proper integration with parent components

## Testing Best Practices Implemented

1. **Mock Isolation**: Critical dependencies are mocked for predictable testing
2. **User Event Simulation**: Realistic user interactions via `@testing-library/user-event`
3. **Accessibility Testing**: Validation of ARIA attributes and keyboard navigation
4. **Responsive Testing**: Simulating different viewport sizes for UI consistency
5. **Error Path Testing**: Equal attention to happy and error paths
6. **Edge Case Coverage**: Testing boundary conditions and unusual data scenarios
7. **Performance Considerations**: Testing for efficiency and memory leaks

## Test Data Strategy

We use realistic mock data that represents actual application states:

```typescript
// Unit test mock user
const mockUser = {
  displayName: "John Doe",
  email: "john.doe@example.com",
  companyName: "Acme Corp",
  picture: "https://example.com/avatar.jpg",
};

// Integration test mock user
const mockUserData = {
  displayName: "Sarah Johnson",
  email: "sarah.johnson@techcorp.com",
  companyName: "TechCorp Solutions",
  picture: "https://api.example.com/avatars/sarah-johnson.jpg",
  role: "admin",
  accountRole: "company_admin",
  lastLogin: "2024-11-13T10:00:00Z",
};
```

## Component State Matrix

| User State | isLoggingOut | isError | Expected Display               |
| ---------- | ------------ | ------- | ------------------------------ |
| null       | false        | false   | Loading indicator              |
| null       | false        | true    | Error message with retry       |
| null       | true         | false   | Logout in progress             |
| populated  | false        | false   | User profile and menu items    |
| populated  | true         | false   | Logout in progress             |
| populated  | false        | true    | Error message (rare edge case) |

## Future Test Enhancements

1. **Visual Regression Tests**: Add screenshot comparison for UI consistency
2. **End-to-End Testing**: Expand to include Cypress tests for full user journeys
3. **Internationalization Testing**: Validate component with different locale strings
4. **Performance Benchmarking**: Add render time metrics for performance monitoring
5. **Accessibility Compliance**: Expand tests for complete WCAG compliance

## Environment Setup

All tests use the following test environment:

- Jest test runner
- React Testing Library
- User Event library for interaction simulation
- MSW (Mock Service Worker) for API mocking
- Custom mock implementations for Next.js components and UI libraries

## Continuous Integration

These tests are run automatically on:

- Pull requests to main branch
- Pre-deployment verification
- Nightly builds

## Writing New Tests

When adding new functionality to the AvatarCard component:

1. Add unit tests for isolated behavior in `AvatarCard.test.tsx`
2. Add integration tests for user flows in `AvatarCard.integration.test.tsx`
3. Follow the existing patterns for mocking and assertions
4. Test both success and failure paths
5. Consider edge cases and accessibility requirements

---

_Last updated: November 13, 2024_
