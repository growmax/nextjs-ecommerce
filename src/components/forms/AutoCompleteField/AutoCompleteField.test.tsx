/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { AutoCompleteField } from "./AutoCompleteField";
import { options } from "./AutoCompleteField.mocks";

// Mock Button, Popover, Command and icons used by the component
jest.mock("@/components/ui/button", () => {
  const React = require("react");
  const Button = React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement("button", { ref, ...props }, children)
  );
  Button.displayName = "Button";
  return { Button };
});

jest.mock("@/components/ui/popover", () => {
  const React = require("react");
  return {
    Popover: ({ children }: any) => React.createElement("div", null, children),
    PopoverTrigger: ({ children }: any) => children,
    PopoverContent: ({ children }: any) =>
      React.createElement(
        "div",
        { "data-testid": "popover-content" },
        children
      ),
  };
});

jest.mock("@/components/ui/command", () => {
  const React = require("react");
  return {
    Command: ({ children }: any) => React.createElement("div", null, children),
    CommandGroup: ({ children }: any) =>
      React.createElement("div", null, children),
    CommandItem: ({ children, onSelect }: any) =>
      React.createElement(
        "div",
        { role: "option", onClick: () => onSelect && onSelect() },
        children
      ),
    CommandList: ({ children }: any) =>
      React.createElement("div", null, children),
  };
});

jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    Check: () => React.createElement("span", { "data-testid": "icon-check" }),
    ChevronDown: () =>
      React.createElement("span", { "data-testid": "icon-chevron" }),
  };
});

// Mock FormField wrapper
jest.mock("../FormField/FormField", () => ({
  FormField: ({ label, required, children }: any) => {
    const React = require("react");
    return React.createElement(
      "label",
      null,
      React.createElement("div", null, label, required ? " *" : null),
      children
    );
  },
}));

describe("AutoCompleteField", () => {
  it("renders placeholder when no value is selected", () => {
    const handle = jest.fn();
    render(
      <AutoCompleteField
        label="Test"
        value=""
        onChange={handle}
        options={options}
        placeholder="Pick one"
      />
    );

    // Placeholder shown
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("shows selected label when value is provided", () => {
    const handle = jest.fn();
    render(
      <AutoCompleteField
        label="Test"
        value="opt2"
        onChange={handle}
        options={options}
        placeholder="Pick one"
      />
    );

    // The trigger (combobox) should display the selected label
    expect(screen.getByRole("combobox")).toHaveTextContent("Option 2");
  });

  it("renders options and calls onChange when an option is selected", () => {
    const handle = jest.fn();
    render(
      <AutoCompleteField
        label="Test"
        value=""
        onChange={handle}
        options={options}
        placeholder="Pick one"
      />
    );

    // open popover by clicking the trigger (button has role combobox in component)
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // options rendered inside mocked PopoverContent
    expect(screen.getByTestId("popover-content")).toBeInTheDocument();
    // Click first option
    const firstOption = screen.getByText("Option 1");
    fireEvent.click(firstOption);

    expect(handle).toHaveBeenCalledWith("opt1");
  });
});
