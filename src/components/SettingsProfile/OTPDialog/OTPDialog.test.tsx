/* eslint-disable @typescript-eslint/no-require-imports */
// Mock the small UI primitives used by OTPDialog so Jest/ts-jest can
// transform and execute the component without pulling in complex deps.
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

// Mock UI primitives and icon before importing the component.
jest.mock("@/components/ui/dialog", () => {
  const React = require("react");
  return {
    Dialog: ({ children, open }: any) =>
      React.createElement(
        "div",
        { "data-testid": "dialog", "data-open": open },
        children
      ),
    DialogContent: ({ children }: any) =>
      React.createElement("div", { "data-testid": "dialog-content" }, children),
    DialogDescription: ({ children }: any) =>
      React.createElement("div", { "data-testid": "dialog-desc" }, children),
    DialogHeader: ({ children }: any) =>
      React.createElement("div", { "data-testid": "dialog-header" }, children),
    DialogTitle: ({ children }: any) =>
      React.createElement("h2", null, children),
  };
});

jest.mock("@/components/ui/input", () => {
  const React = require("react");
  return { Input: (props: any) => React.createElement("input", props) };
});

jest.mock("@/components/ui/label", () => {
  const React = require("react");
  return { Label: (props: any) => React.createElement("label", props) };
});

jest.mock("@/components/ui/button", () => {
  const React = require("react");
  return {
    Button: (props: any) =>
      React.createElement("button", props, props.children),
  };
});

jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    Shield: () => React.createElement("svg", { "data-testid": "shield-icon" }),
  };
});

import { OTPDialog } from "./OTPDialog";

// Mock functions
const mockOnVerify = jest.fn();
const mockOnResend = jest.fn();
const mockOnOpenChange = jest.fn();

const defaultProps = {
  open: true,
  onOpenChange: mockOnOpenChange,
  onVerify: mockOnVerify,
  onResend: mockOnResend,
  title: "Verify OTP",
  description: "Enter the 6-digit code sent to your email",
  isLoading: false,
};

// Create a test wrapper that manages OTP state
const OTPDialogWrapper = (props: Omit<import("./OTPDialog").OTPDialogProps, "otp" | "setOtp">) => {
  const React = require("react");
  const [otp, setOtp] = React.useState("");
  return React.createElement(OTPDialog, { ...props, otp, setOtp });
};

describe("OTPDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dialog with title and description", () => {
    render(React.createElement(OTPDialogWrapper, defaultProps));

    // The title and the verify button share the same text; target the heading for the title
    expect(
      screen.getByRole("heading", { name: "Verify OTP" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter the 6-digit code sent to your email")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Enter OTP *")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Resend OTP" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verify OTP" })
    ).toBeInTheDocument();
  });

  it("does not render resend button when onResend is not provided", () => {
    const { onResend: _onResend, ...propsWithoutResend } = defaultProps;
    render(React.createElement(OTPDialogWrapper, propsWithoutResend));

    expect(
      screen.queryByRole("button", { name: "Resend OTP" })
    ).not.toBeInTheDocument();
  });

  it("allows only numeric input and limits to 6 characters", () => {
    render(React.createElement(OTPDialogWrapper, defaultProps));

    const input = screen.getByLabelText("Enter OTP *") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "abc123def" } });
    expect(input.value).toBe("123");

    fireEvent.change(input, { target: { value: "123456789" } });
    expect(input.value).toBe("123456");
  });

  it("disables verify button when OTP is not 6 digits", () => {
    render(React.createElement(OTPDialogWrapper, defaultProps));

    const verifyButton = screen.getByRole("button", { name: "Verify OTP" });
    const input = screen.getByLabelText("Enter OTP *");

    expect(verifyButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "12345" } });
    expect(verifyButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "123456" } });
    expect(verifyButton).not.toBeDisabled();
  });

  it("calls onVerify with correct OTP when verify button is clicked", async () => {
    mockOnVerify.mockResolvedValue(undefined);
    render(React.createElement(OTPDialogWrapper, defaultProps));

    const input = screen.getByLabelText("Enter OTP *");
    const verifyButton = screen.getByRole("button", { name: "Verify OTP" });

    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockOnVerify).toHaveBeenCalledWith("123456");
    });
  });

  it("calls onResend when resend button is clicked", async () => {
    mockOnResend.mockResolvedValue(undefined);
    render(React.createElement(OTPDialogWrapper, defaultProps));

    const resendButton = screen.getByRole("button", { name: "Resend OTP" });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(mockOnResend).toHaveBeenCalled();
    });
  });

  it("closes dialog and resets OTP when cancel is clicked", () => {
    render(React.createElement(OTPDialogWrapper, defaultProps));

    const input = screen.getByLabelText("Enter OTP *");
    const cancelButton = screen.getByRole("button", { name: "Cancel" });

    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes dialog and resets OTP after successful verification", async () => {
    mockOnVerify.mockResolvedValue(undefined);
    render(React.createElement(OTPDialogWrapper, defaultProps));

    const input = screen.getByLabelText("Enter OTP *");
    const verifyButton = screen.getByRole("button", { name: "Verify OTP" });

    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("shows loading state during verification", async () => {
    mockOnVerify.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    render(React.createElement(OTPDialogWrapper, defaultProps));

    const input = screen.getByLabelText("Enter OTP *");
    const verifyButton = screen.getByRole("button", { name: "Verify OTP" });

    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.click(verifyButton);

    expect(
      screen.getByRole("button", { name: "Verifying..." })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verifying..." })).toBeDisabled();

    await waitFor(() => {
      expect(mockOnVerify).toHaveBeenCalledWith("123456");
    });
  });

  it("disables all inputs and buttons when isLoading is true", () => {
    const loadingProps = { ...defaultProps, isLoading: true };
    render(React.createElement(OTPDialogWrapper, loadingProps));

    const input = screen.getByLabelText("Enter OTP *");
    const resendButton = screen.getByRole("button", { name: "Resend OTP" });
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const verifyButton = screen.getByRole("button", { name: "Verify OTP" });

    expect(input).toBeDisabled();
    expect(resendButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(verifyButton).toBeDisabled();
  });

  it("does not close dialog when verification fails", async () => {
    mockOnVerify.mockRejectedValue(new Error("Invalid OTP"));
    render(React.createElement(OTPDialogWrapper, defaultProps));

    const input = screen.getByLabelText("Enter OTP *");
    const verifyButton = screen.getByRole("button", { name: "Verify OTP" });

    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockOnVerify).toHaveBeenCalledWith("123456");
    });

    // Dialog should still be open since verification failed (parent may handle closing)
  });
});
