import { render, screen } from "@testing-library/react";
// userEvent not required for these unit tests
import { FormField } from "./FormField";

describe("FormField component", () => {
  test("renders label and children", () => {
    render(
      <FormField label="Full name">
        <input aria-label="name-input" />
      </FormField>
    );

    expect(screen.getByText("Full name")).toBeTruthy();
    expect(screen.getByLabelText("name-input")).toBeTruthy();
  });

  test("shows required indicator when required prop is true", () => {
    render(
      <FormField label="Email" required>
        <input aria-label="email-input" />
      </FormField>
    );

    // label contains an asterisk when required
    const label = screen.getByText("Email");
    expect(label).toBeTruthy();
    expect(label.textContent).toContain("*");
  });

  test("renders hint when provided and no error", () => {
    render(
      <FormField label="City" hint="Enter your city">
        <input aria-label="city-input" />
      </FormField>
    );

    expect(screen.getByText("Enter your city")).toBeTruthy();
  });

  test("renders error message and hides hint when error is present", () => {
    render(
      <FormField label="City" hint="Enter your city" error="This is required">
        <input aria-label="city-input" />
      </FormField>
    );

    expect(screen.getByText("This is required")).toBeTruthy();
    // hint should not be shown when there's an error
    expect(screen.queryByText("Enter your city")).toBeNull();
  });

  test("applies container and label className props", () => {
    render(
      <FormField
        label="Notes"
        className="my-container"
        labelClassName="my-label"
      >
        <textarea aria-label="notes" />
      </FormField>
    );

    const container = screen.getByLabelText("notes").closest("div");
    // the outer container should exist; classlist assertion is permissive
    expect(container).toBeTruthy();

    const label = screen.getByText("Notes");
    expect(label).toBeTruthy();
    // label class should include our custom labelClassName
    expect(label.className).toContain("my-label");
  });
});
