/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

// Mock UI primitives and icons used by PasswordChangeDialog
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

jest.mock("@/components/ui/drawer", () => {
  const React = require("react");
  return {
    Drawer: ({ children, open }: any) =>
      React.createElement(
        "div",
        { "data-testid": "drawer", "data-open": open },
        children
      ),
    DrawerContent: ({ children }: any) =>
      React.createElement("div", { "data-testid": "drawer-content" }, children),
    DrawerDescription: ({ children }: any) =>
      React.createElement("div", { "data-testid": "drawer-desc" }, children),
    DrawerHeader: ({ children }: any) =>
      React.createElement("div", { "data-testid": "drawer-header" }, children),
    DrawerTitle: ({ children }: any) =>
      React.createElement("h2", null, children),
    DrawerFooter: ({ children }: any) =>
      React.createElement("div", { "data-testid": "drawer-footer" }, children),
    DrawerClose: ({ children }: any) =>
      React.createElement(
        "button",
        { "data-testid": "drawer-close" },
        children
      ),
  };
});

jest.mock("@/hooks/use-media-query", () => ({
  useMediaQuery: jest.fn(() => true), // Default to desktop (use Dialog)
}));

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
    Eye: () => React.createElement("svg", { "data-testid": "eye-icon" }),
    EyeOff: () => React.createElement("svg", { "data-testid": "eyeoff-icon" }),
    Lock: () => React.createElement("svg", { "data-testid": "lock-icon" }),
    Shield: () => React.createElement("svg", { "data-testid": "shield-icon" }),
  };
});

import { PasswordChangeDialog } from "./PasswordChangeDialog";
import { defaultProps } from "./PasswordChangeDialog.mocks";

describe("PasswordChangeDialog", () => {
  const mockOnPasswordChange = jest.fn();
  const mockOnSendOtp = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title, description and form fields", () => {
    render(
      React.createElement(PasswordChangeDialog, {
        ...defaultProps,
        onPasswordChange: mockOnPasswordChange,
        onSendOtp: mockOnSendOtp,
        onOpenChange: mockOnOpenChange,
      })
    );

    expect(
      screen.getByRole("heading", { name: "changePasswordTitle" })
    ).toBeInTheDocument();
    expect(screen.getByText("enterOtpAndSetPassword")).toBeInTheDocument();
    expect(screen.getByLabelText("enterOtp")).toBeInTheDocument();
    expect(screen.getByLabelText("newPassword")).toBeInTheDocument();
    expect(screen.getByLabelText("confirmPassword")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "changePasswordTitle" })
    ).toBeInTheDocument();
  });

  it("calls onSendOtp when Send OTP button is clicked", async () => {
    render(
      React.createElement(PasswordChangeDialog, {
        ...defaultProps,
        onPasswordChange: mockOnPasswordChange,
        onSendOtp: mockOnSendOtp,
        onOpenChange: mockOnOpenChange,
      })
    );

    const sendButton = screen.getByRole("button", { name: "sendOtp" });
    fireEvent.click(sendButton);

    await waitFor(() => expect(mockOnSendOtp).toHaveBeenCalled());
  });

  it("toggles password visibility", () => {
    render(
      React.createElement(PasswordChangeDialog, {
        ...defaultProps,
        onPasswordChange: mockOnPasswordChange,
        onSendOtp: mockOnSendOtp,
        onOpenChange: mockOnOpenChange,
      })
    );

    const newPasswordInput = screen.getByLabelText(
      "newPassword"
    ) as HTMLInputElement;
    // initially should be password
    expect(newPasswordInput.type).toBe("password");

    // find eye icon inside the toggle button and click it
    const eyeIcons = screen.getAllByTestId("eye-icon");
    // first icon corresponds to the newPassword toggle
    const eyeIcon = eyeIcons[0]!;
    const toggleButton = eyeIcon.closest("button") as HTMLButtonElement;
    fireEvent.click(toggleButton);
    expect(newPasswordInput.type).toBe("text");

    // click again to toggle back
    fireEvent.click(toggleButton);
    expect(newPasswordInput.type).toBe("password");
  });

  it("enables Change Password only when form is valid", () => {
    render(
      React.createElement(PasswordChangeDialog, {
        ...defaultProps,
        onPasswordChange: mockOnPasswordChange,
        onSendOtp: mockOnSendOtp,
        onOpenChange: mockOnOpenChange,
      })
    );

    const otpInput = screen.getByLabelText("enterOtp") as HTMLInputElement;
    const newPasswordInput = screen.getByLabelText(
      "newPassword"
    ) as HTMLInputElement;
    const confirmInput = screen.getByLabelText(
      "confirmPassword"
    ) as HTMLInputElement;
    const changeBtn = screen.getByRole("button", {
      name: "changePasswordTitle",
    });

    // initially invalid
    expect(changeBtn).toBeDisabled();

    // set partial values
    fireEvent.change(otpInput, { target: { value: "12345" } });
    fireEvent.change(newPasswordInput, { target: { value: "abcdef" } });
    fireEvent.change(confirmInput, { target: { value: "abcdef" } });
    expect(changeBtn).toBeDisabled();

    // now valid
    fireEvent.change(otpInput, { target: { value: "123456" } });
    expect(changeBtn).not.toBeDisabled();
  });

  it("calls onPasswordChange and closes on success", async () => {
    mockOnPasswordChange.mockResolvedValue(undefined);
    render(
      React.createElement(PasswordChangeDialog, {
        ...defaultProps,
        onPasswordChange: mockOnPasswordChange,
        onSendOtp: mockOnSendOtp,
        onOpenChange: mockOnOpenChange,
      })
    );

    const otpInput = screen.getByLabelText("enterOtp") as HTMLInputElement;
    const newPasswordInput = screen.getByLabelText(
      "newPassword"
    ) as HTMLInputElement;
    const confirmInput = screen.getByLabelText(
      "confirmPassword"
    ) as HTMLInputElement;
    const changeBtn = screen.getByRole("button", {
      name: "changePasswordTitle",
    });

    fireEvent.change(otpInput, { target: { value: "123456" } });
    fireEvent.change(newPasswordInput, { target: { value: "abcdef" } });
    fireEvent.change(confirmInput, { target: { value: "abcdef" } });

    fireEvent.click(changeBtn);

    await waitFor(() =>
      expect(mockOnPasswordChange).toHaveBeenCalledWith({
        otp: "123456",
        newPassword: "abcdef",
      })
    );
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows loading state while changing password and disables controls", async () => {
    mockOnPasswordChange.mockImplementation(
      () => new Promise(r => setTimeout(r, 50))
    );
    render(
      React.createElement(PasswordChangeDialog, {
        ...defaultProps,
        onPasswordChange: mockOnPasswordChange,
        onSendOtp: mockOnSendOtp,
        onOpenChange: mockOnOpenChange,
      })
    );

    const otpInput = screen.getByLabelText("enterOtp") as HTMLInputElement;
    const newPasswordInput = screen.getByLabelText(
      "newPassword"
    ) as HTMLInputElement;
    const confirmInput = screen.getByLabelText(
      "confirmPassword"
    ) as HTMLInputElement;

    fireEvent.change(otpInput, { target: { value: "123456" } });
    fireEvent.change(newPasswordInput, { target: { value: "abcdef" } });
    fireEvent.change(confirmInput, { target: { value: "abcdef" } });

    const changeBtn = screen.getByRole("button", {
      name: "changePasswordTitle",
    });
    fireEvent.click(changeBtn);

    // button should indicate loading (check if it's disabled, the text might be "changing" or similar)
    expect(changeBtn).toBeDisabled();

    await waitFor(() => expect(mockOnPasswordChange).toHaveBeenCalled());
  });

  it("calls onOpenChange(false) when Cancel is clicked", () => {
    render(
      React.createElement(PasswordChangeDialog, {
        ...defaultProps,
        onPasswordChange: mockOnPasswordChange,
        onSendOtp: mockOnSendOtp,
        onOpenChange: mockOnOpenChange,
      })
    );

    const cancelBtn = screen.getByRole("button", { name: "cancel" });
    fireEvent.click(cancelBtn);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
