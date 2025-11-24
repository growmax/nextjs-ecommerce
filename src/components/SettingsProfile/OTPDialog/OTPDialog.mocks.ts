// Mock data and functions for OTPDialog component testing

export const mockOTPDialogProps = {
  open: true,
  onOpenChange: jest.fn(),
  onVerify: jest.fn(),
  onResend: jest.fn(),
  title: "Verify Your Account",
  description:
    "Please enter the 6-digit OTP sent to your registered email address",
  isLoading: false,
};

export const mockOTPDialogPropsWithResend = {
  ...mockOTPDialogProps,
  onResend: jest.fn().mockResolvedValue(undefined),
};

export const mockOTPDialogPropsLoading = {
  ...mockOTPDialogProps,
  isLoading: true,
};

export const mockOTPDialogPropsWithoutDescription = {
  open: true,
  onOpenChange: jest.fn(),
  onVerify: jest.fn(),
  title: "OTP Verification",
  isLoading: false,
};

// Mock OTP values for testing
export const validOTP = "123456";
export const invalidOTP = "12345";
export const nonNumericOTP = "abc123";
export const longOTP = "123456789";

// Mock functions for different scenarios
export const mockOnVerifySuccess = jest.fn().mockResolvedValue(undefined);
export const mockOnVerifyFailure = jest
  .fn()
  .mockRejectedValue(new Error("Invalid OTP"));
export const mockOnResendSuccess = jest.fn().mockResolvedValue(undefined);
export const mockOnResendFailure = jest
  .fn()
  .mockRejectedValue(new Error("Failed to resend OTP"));
export const mockOnOpenChange = jest.fn();

// Mock verification scenarios
export const createMockVerifyScenario = (shouldSucceed: boolean) => ({
  onVerify: shouldSucceed ? mockOnVerifySuccess : mockOnVerifyFailure,
  onResend: mockOnResendSuccess,
  onOpenChange: mockOnOpenChange,
});

// Mock user interactions
export const mockUserInput = {
  validOTP: { target: { value: validOTP } },
  invalidOTP: { target: { value: invalidOTP } },
  nonNumericInput: { target: { value: nonNumericOTP } },
  longInput: { target: { value: longOTP } },
  emptyInput: { target: { value: "" } },
};
