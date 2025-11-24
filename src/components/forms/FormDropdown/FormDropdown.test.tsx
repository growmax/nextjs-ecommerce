/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormDropdown } from "./FormDropdown";
import { groups, options } from "./FormDropdown.mocks";

// Mock UI primitives
jest.mock("@/components/ui/button", () => {
  const React = require("react");
  const Button = React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement("button", { ref, ...props }, children)
  );
  Button.displayName = "Button";
  return { Button };
});

jest.mock("@/components/ui/dropdown-menu", () => {
  const React = require("react");
  return {
    DropdownMenu: ({ children }: any) =>
      React.createElement("div", null, children),
    DropdownMenuTrigger: ({ children }: any) => children,
    DropdownMenuContent: ({ children }: any) =>
      React.createElement(
        "div",
        { "data-testid": "dropdown-content" },
        children
      ),
    DropdownMenuGroup: ({ children }: any) =>
      React.createElement("div", null, children),
    DropdownMenuItem: ({ children, onSelect }: any) =>
      React.createElement(
        "div",
        { role: "option", onClick: () => onSelect && onSelect() },
        children
      ),
    DropdownMenuLabel: ({ children }: any) =>
      React.createElement("div", null, children),
    DropdownMenuSeparator: () => React.createElement("hr", null),
  };
});

jest.mock("@/components/ui/form", () => ({
  // We'll implement FormField to integrate with a test-provided `control` object.
  Form: ({ children }: any) => children,
  FormControl: ({ children }: any) => children,
  FormField: ({ control, name, render }: any) => {
    // control is expected to be a simple object with `mockValue` map
    const field = {
      value: control?.mockValue?.[name] ?? "",
      onChange: (v: any) => {
        if (control && control.mockValue) control.mockValue[name] = v;
      },
    };
    const fieldState = { error: undefined };
    return render({ field, fieldState });
  },
  FormItem: ({ children }: any) => children,
  FormLabel: ({ children }: any) => {
    const React = require("react");
    return React.createElement("label", null, children);
  },
  FormDescription: ({ children }: any) => children,
  FormMessage: () => null,
}));

// Mock icons
jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    Check: () => React.createElement("span", { "data-testid": "icon-check" }),
    ChevronDown: () =>
      React.createElement("span", { "data-testid": "icon-chevron" }),
  };
});

describe("FormDropdown", () => {
  it("shows placeholder when no value is selected", () => {
    const onValueChange = jest.fn();
    // pass a control mock with no values
    const control = { mockValue: {} };
    render(
      <FormDropdown
        control={control as any}
        name={"field1"}
        options={options}
        placeholder="Pick"
        onValueChange={onValueChange}
      />
    );

    expect(screen.getByRole("button")).toHaveTextContent("Pick");
  });

  it("shows selected label when control has a value", () => {
    const onValueChange = jest.fn();
    const control = { mockValue: { field1: "b" } };
    render(
      <FormDropdown
        control={control as any}
        name={"field1"}
        options={options}
        placeholder="Pick"
        onValueChange={onValueChange}
      />
    );

    // Button should display selected option label
    expect(screen.getByRole("button")).toHaveTextContent("Beta");
  });

  it("calls onValueChange when an option is selected", () => {
    const onValueChange = jest.fn();
    const control = { mockValue: { field1: "" } };
    render(
      <FormDropdown
        control={control as any}
        name={"field1"}
        options={options}
        placeholder="Pick"
        onValueChange={onValueChange}
      />
    );

    // Open dropdown (trigger is rendered as button)
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    // Click first option
    const firstOption = screen.getByText("Alpha");
    fireEvent.click(firstOption);

    expect(onValueChange).toHaveBeenCalledWith("a");
    // control mock updated
    expect(control.mockValue.field1).toBe("a");
  });

  it("renders grouped options when groups prop is provided", () => {
    const onValueChange = jest.fn();
    const control = { mockValue: { field1: "" } };
    render(
      <FormDropdown
        control={control as any}
        name={"field1"}
        groups={groups as any}
        placeholder="Pick"
        onValueChange={onValueChange}
      />
    );

    expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
    // group label appears
    expect(screen.getByText("Group 1")).toBeInTheDocument();
  });
});
