/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen } from "@testing-library/react";
import FormInput from "./FormInput";

// Mock form primitives used by the component
jest.mock("@/components/ui/form", () => {
  const React = require("react");
  const FormFieldComponent = ({ render, control, name }: any) => {
    if (render && typeof render === "function") {
      const renderResult = render({ 
        field: { value: "", onChange: () => {}, name: name || "test", onBlur: () => {}, ref: () => {} },
        fieldState: {}
      });
      return React.isValidElement(renderResult) 
        ? renderResult 
        : React.createElement(React.Fragment, {}, renderResult);
    }
    return null;
  };
  return {
    FormControl: ({ children }: any) =>
      React.createElement("div", { "data-testid": "form-control" }, children),
    FormItem: ({ children }: any) => React.createElement("div", {}, children),
    FormLabel: ({ children }: any) =>
      React.createElement("label", {}, children),
    FormMessage: () => null,
    FormField: FormFieldComponent,
  };
});

jest.mock("@/components/ui/input", () => {
  const React = require("react");
  return {
    __esModule: true,
    Input: (props: any) =>
      React.createElement("input", { "data-testid": "input", ...props }),
  };
});

jest.mock("@/components/ui/skeleton", () => {
  const React = require("react");
  return {
    Skeleton: (props: any) =>
      React.createElement("div", { "data-testid": "skeleton", ...props }),
  };
});

describe("FormInput", () => {
  test("renders label and input with placeholder when not loading", () => {
    render(
      <FormInput
        control={{} as any}
        name="firstName"
        label="First name"
        placeholder="Enter name"
      />
    );

    // label is rendered by mocked FormLabel
    const label = screen.getByText("First name");
    expect(label).toBeTruthy();

    const input = screen.getByTestId("input");
    expect(input).toBeTruthy();
    expect(input.getAttribute("placeholder")).toBe("Enter name");
  });

  test("renders skeleton when loading is true", () => {
    render(
      <FormInput
        control={{} as any}
        name="foo"
        label="L"
        placeholder="p"
        loading={true}
      />
    );

    expect(screen.getByTestId("skeleton")).toBeTruthy();
  });

  test("input element receives disabled prop when disabled is true", () => {
    render(
      <FormInput
        control={{} as any}
        name="email"
        label="Email"
        placeholder="you@x"
        disabled={true}
      />
    );

    const input = screen.getByTestId("input");
    expect(input).toBeTruthy();
    expect(input.getAttribute("disabled")).not.toBeNull();
  });

  test("does not show required indicator in label when required prop is true", () => {
    render(
      <FormInput
        control={{} as any}
        name="n"
        label={"Name"}
        placeholder="p"
        required={true}
      />
    );

    const label = screen.getByText("Name");
    expect(label).toBeTruthy();
    // label textContent should not contain an asterisk since required indicator was removed
    expect(label.textContent).not.toContain("*");
    expect(label.textContent).toBe("Name");
  });
});
