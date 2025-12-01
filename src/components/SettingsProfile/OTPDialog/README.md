# OTPDialog Component

A reusable React component for OTP (One-Time Password) verification dialogs.

## Overview

The `OTPDialog` component provides a modal dialog interface for users to enter and verify 6-digit OTP codes. It includes features like automatic input validation, resend functionality, and loading states.

## Props

| Prop           | Type                             | Required | Description                                     |
| -------------- | -------------------------------- | -------- | ----------------------------------------------- |
| `open`         | `boolean`                        | Yes      | Controls dialog visibility                      |
| `onOpenChange` | `(open: boolean) => void`        | Yes      | Callback when dialog open state changes         |
| `onVerify`     | `(otp: string) => Promise<void>` | Yes      | Callback when user submits OTP for verification |
| `onResend`     | `() => Promise<void>`            | No       | Callback when user requests OTP resend          |
| `title`        | `string`                         | Yes      | Dialog title text                               |
| `description`  | `string`                         | No       | Dialog description text                         |
| `isLoading`    | `boolean`                        | No       | Shows loading state, disables all interactions  |

## Features

- **Input Validation**: Accepts only numeric characters, limited to 6 digits
- **Auto-focus**: Input field is automatically focused when dialog opens
- **Loading States**: Disables all interactions during verification or loading
- **Resend Functionality**: Optional resend button with loading state
- **Error Handling**: Verification errors are handled by parent component
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage Example

```tsx
import { OTPDialog } from "./OTPDialog";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (otp: string) => {
    setIsLoading(true);
    try {
      await verifyOTP(otp);
      setIsOpen(false);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP();
      // Handle resend success
    } catch (error) {
      // Handle resend error
    }
  };

  return (
    <OTPDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onVerify={handleVerify}
      onResend={handleResend}
      title="Verify Your Email"
      description="Enter the 6-digit code sent to your email"
      isLoading={isLoading}
    />
  );
}
```

## Testing

The component includes comprehensive test coverage. Run tests with:

```bash
npm test OTPDialog.test.tsx
```

**Note**: The Jest configuration in this project may require additional setup for React component testing. If tests fail due to JSX parsing issues, you may need to:

1. Install `@next/jest` and configure it properly, or
2. Add a Jest setup file to configure JSX transformation

Test files include:

- `OTPDialog.test.tsx` - Unit tests covering all functionality
- `OTPDialog.mocks.ts` - Mock data and functions for testing

The tests cover:

- Component rendering with various prop combinations
- Input validation and character limits
- Button states and interactions
- Loading states
- Error handling
- Dialog open/close behavior

## Dependencies

- React
- Radix UI Dialog components
- Lucide React icons
- Tailwind CSS for styling
