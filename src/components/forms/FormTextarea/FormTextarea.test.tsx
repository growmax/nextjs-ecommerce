/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import FormTextarea from "./FormTextarea";

// Mock form primitives used by the component
jest.mock("@/components/ui/form", () => {
  const React = require("react");
  return {
    Form: ({ children }: any) => children,
    FormControl: ({ children }: any) => children,
    FormField: ({ render }: any) =>
      render({ 
        field: { value: "", onChange: () => {}, name: "test", onBlur: () => {}, ref: () => {} },
        fieldState: { error: undefined, isDirty: false, isTouched: false }
      }),
    FormItem: ({ children }: any) => children,
    FormLabel: ({ children }: any) =>
      React.createElement("label", null, children),
  };
});

// Mock Textarea and Skeleton
jest.mock("@/components/ui/textarea", () => {
  const React = require("react");
  return {
    Textarea: (props: any) =>
      React.createElement("textarea", { "data-testid": "textarea", ...props }),
  };
});

jest.mock("@/components/ui/skeleton", () => {
  const React = require("react");
  return {
    Skeleton: (props: any) =>
      React.createElement("div", { "data-testid": "skeleton", ...props }),
  };
});

describe("FormTextarea", () => {
  it("renders label and textarea when not loading", () => {
    render(
      <FormTextarea
        control={{} as any}
        name="notes"
        label="Notes"
        placeholder="Type..."
      />
    );

    expect(screen.getByText("Notes")).toBeTruthy();
    const ta = screen.getByTestId("textarea");
    expect(ta).toBeTruthy();
    expect(ta.getAttribute("placeholder")).toBe("Type...");
  });

  it("renders skeleton when loading is true", () => {
    render(
      <FormTextarea
        control={{} as any}
        name="desc"
        label="Desc"
        placeholder="p"
        loading={true}
      />
    );

    expect(screen.getByTestId("skeleton")).toBeTruthy();
  });

  it("passes disabled to textarea when disabled prop is true", () => {
    render(
      <FormTextarea
        control={{} as any}
        name="d"
        label="D"
        placeholder="p"
        disabled={true}
      />
    );
    const ta = screen.getByTestId("textarea");
    expect(ta).toBeTruthy();
    expect(ta.getAttribute("disabled")).not.toBeNull();
  });

  it("does not show required indicator in label when required prop is true", () => {
    render(
      <FormTextarea
        control={{} as any}
        name="r"
        label={"Label"}
        placeholder="p"
        required={true}
      />
    );
    const label = screen.getByText("Label");
    expect(label).toBeTruthy();
    // label textContent should not contain an asterisk since required indicator was removed
    expect(label.textContent).not.toContain("*");
    expect(label.textContent).toBe("Label");
  });
});
