/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { PhoneInput } from "./PhoneInput";

// Mock FormField wrapper
jest.mock("../FormField/FormField", () => ({
  FormField: ({ label, required, error, children }: any) => {
    const React = require("react");
    return React.createElement(
      "div",
      null,
      React.createElement("label", null, label, required ? " *" : null),
      error ? React.createElement("div", null, error) : null,
      children
    );
  },
}));

// Mock Input, Button, Badge
jest.mock("@/components/ui/input", () => {
  const React = require("react");
  return {
    Input: (props: any) =>
      React.createElement("input", { "data-testid": "phone-input", ...props }),
  };
});

jest.mock("@/components/ui/button", () => {
  const React = require("react");
  return {
    Button: ({ children, ...props }: any) =>
      React.createElement("button", { ...props }, children),
  };
});

jest.mock("@/components/ui/badge", () => ({
  Badge: (props: any) => {
    const React = require("react");
    return React.createElement(
      "span",
      { "data-testid": "badge", ...props },
      props.children
    );
  },
}));

jest.mock("lucide-react", () => ({
  Check: () => {
    const React = require("react");
    return React.createElement("svg", { "data-testid": "icon-check" });
  },
}));

// Mock validation hook to control validation behaviour
jest.mock("@/hooks/Forms/useFormValidation", () => ({
  useFormValidation: () => ({
    validatePhone: (phone: string) => {
      if (!phone) return null;
      return /^\d{10}$/.test(phone)
        ? null
        : "Phone number must be exactly 10 digits";
    },
  }),
}));

describe("PhoneInput component", () => {
  it("renders label and input and calls onChange with digits-only", () => {
    const onChange = jest.fn();
    render(<PhoneInput label="Phone" value="" onChange={onChange} />);

    const input = screen.getByTestId("phone-input") as HTMLInputElement;
    expect(screen.getByText("Phone")).toBeTruthy();

    fireEvent.change(input, { target: { value: "abc123def456" } });
    // component strips non-digits and limits length to 10
    expect(onChange).toHaveBeenCalled();
    const calledWith = (onChange.mock.calls[0] || [])[0];
    expect(calledWith).toMatch(/^[0-9]+$/);
  });

  it("shows Verify button when value is full length and different from initialValue, and clicking calls onVerify", () => {
    const onChange = jest.fn();
    const onVerify = jest.fn();
    // initial originalValue is different so canVerify becomes true
    const { rerender } = render(
      <PhoneInput
        label="Phone"
        value="1234567890"
        originalValue="0987654321"
        onChange={onChange}
        onVerify={onVerify}
      />
    );

    // effect sets initialValueRef after mount; force a rerender so canVerify recalculates
    rerender(
      <PhoneInput
        label="Phone"
        value="1234567890"
        originalValue="0987654321"
        onChange={onChange}
        onVerify={onVerify}
      />
    );

    const verifyBtn = screen.getByRole("button", { name: /Verify/i });
    expect(verifyBtn).toBeTruthy();
    fireEvent.click(verifyBtn);
    expect(onVerify).toHaveBeenCalledWith("1234567890");
  });

  it("shows Verified badge when verified prop is true", () => {
    render(
      <PhoneInput
        label="Phone"
        value="1234567890"
        onChange={() => {}}
        verified={true}
      />
    );
    expect(screen.getByTestId("badge")).toBeTruthy();
    expect(screen.getByTestId("icon-check")).toBeTruthy();
  });

  it("respects disabled prop: input disabled and verify button disabled", () => {
    const onChange = jest.fn();
    const onVerify = jest.fn();
    const { rerender } = render(
      <PhoneInput
        label="Phone"
        value="1234567890"
        onChange={onChange}
        onVerify={onVerify}
        disabled={true}
        originalValue="0000000000"
      />
    );
    // force rerender so effect runs and canVerify recalculated
    rerender(
      <PhoneInput
        label="Phone"
        value="1234567890"
        onChange={onChange}
        onVerify={onVerify}
        disabled={true}
        originalValue="0000000000"
      />
    );

    const input = screen.getByTestId("phone-input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    const verifyBtn = screen.getByRole("button", { name: /Verify/i });
    expect(verifyBtn).toBeTruthy();
    expect(verifyBtn).toHaveAttribute("disabled");
  });
});
