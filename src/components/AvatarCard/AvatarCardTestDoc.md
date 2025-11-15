### Avatar Card Tests

This document outlines the tests covering the `AvatarCard` component.

- **Component States**:
  - It correctly shows a loading state while user data is being fetched.
  - It displays an error message if user data fails to load and provides a working "Retry" button.
  - It shows a "Logging out..." status when a user is signing out.

- **User Data Display**:
  - It properly displays the user's name, email, and company name.
  - It shows the user's profile picture if one is provided.
  - If there's no picture, it displays a fallback with the user's initials (e.g., "JD" for "John Doe").
  - It handles different name formats, like single names or names with special characters.
  - It avoids showing anything if email or company information is missing.

- **Menu and Navigation**:
  - A dropdown menu appears when the avatar is clicked.
  - The menu includes navigation links for "Profile," "Company Settings," "Orders," and "Quotes."
  - The "Orders" and "Quotes" menu items can be hidden if needed.
  - All links correctly point to their respective pages.

- **Actions**:
  - The "Log out" button successfully triggers the logout function.
  - The logout button is disabled during the sign-out process to prevent multiple clicks.

- **Accessibility and Configuration**:
  - The component is accessible via keyboard.
  - It uses proper ARIA labels for screen readers to announce its status (like "Loading" or "Error").
  - The menu's alignment and styling can be customized.
