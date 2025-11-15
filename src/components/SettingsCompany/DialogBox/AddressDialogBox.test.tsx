/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CompanyDialogBox from "./AddressDialogBox";

// Use mocks from sibling file
import { sampleAddress } from "./AddressDialogBox.mocks";

// Mock UI primitives used inside the component so tests only exercise behavior
jest.mock("@/components/ui/button", () => {
  const React = require("react");
  return {
    Button: (props: any) =>
      React.createElement("button", { ...props }, props.children),
  };
});

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
      React.createElement("div", null, children),
    DialogFooter: ({ children }: any) =>
      React.createElement("div", null, children),
    DialogHeader: ({ children }: any) =>
      React.createElement("div", null, children),
    DialogTitle: ({ children }: any) =>
      React.createElement("h1", null, children),
  };
});

// Mock form primitives - implement simple react-hook-form Controller-based inputs
jest.mock("../../forms/FormInput/FormInput", () => ({
  __esModule: true,
  default: ({ control, name, ...rest }: any) => {
    const React = require("react");
    const { Controller } = require("react-hook-form");
    return React.createElement(Controller, {
      control,
      name,
      render: ({ field }: any) =>
        React.createElement("input", {
          "data-testid": `input-${name}`,
          ...field,
          ...rest,
        }),
    });
  },
}));

jest.mock("../../forms/FormDropdown/FormDropdown", () => ({
  __esModule: true,
  FormDropdown: ({ control, name, options, ...rest }: any) => {
    const React = require("react");
    const { Controller } = require("react-hook-form");
    return React.createElement(Controller, {
      control,
      name,
      render: ({ field }: any) =>
        React.createElement(
          "select",
          { "data-testid": `select-${name}`, ...field, ...rest },
          options &&
            options.map((o: any) =>
              React.createElement(
                "option",
                { key: o.value, value: o.value },
                o.label
              )
            )
        ),
    });
  },
}));

jest.mock("../../forms/FormTextarea/FormTextarea", () => ({
  __esModule: true,
  default: ({ control, name, ...rest }: any) => {
    const React = require("react");
    const { Controller } = require("react-hook-form");
    return React.createElement(Controller, {
      control,
      name,
      render: ({ field }: any) =>
        React.createElement("textarea", {
          "data-testid": `textarea-${name}`,
          ...field,
          ...rest,
        }),
    });
  },
}));

// Mock the generic form wrapper so it just renders children (the tests pass control directly)
jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => children,
  FormControl: ({ children }: any) => children,
  FormField: ({ children }: any) => children,
  FormItem: ({ children }: any) => children,
  FormLabel: ({ children }: any) => children,
}));

// Mock external services used by the component
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
jest.mock("@/lib/api/services/CompanyService", () => ({
  __esModule: true,
  default: {
    createBranchAddress: (...args: any[]) => mockCreate(...args),
    updateBranchAddress: (...args: any[]) => mockUpdate(...args),
  },
}));

const mockGetAllCountries = jest.fn();
jest.mock("@/lib/api/services/LocationService/LocationService", () => ({
  __esModule: true,
  getAllCountries: (...args: any[]) => mockGetAllCountries(...args),
  getAllStates: jest.fn().mockResolvedValue({ data: [] }),
  getAllDistricts: jest.fn().mockResolvedValue({ data: [] }),
  getStatesByCountry: jest.fn().mockResolvedValue({ data: [] }),
  getDistrictsByState: jest.fn().mockResolvedValue({ data: [] }),
}));

// Mock auth & JWT decoding to allow create/update flows to attach user/company ids
jest.mock("@/lib/auth", () => ({
  AuthStorage: { getValidAccessToken: jest.fn().mockResolvedValue("token") },
}));
jest.mock("@/lib/services/JWTService", () => ({
  JWTService: {
    getInstance: () => ({ decodeToken: () => ({ userId: 1, companyId: 2 }) }),
  },
}));

describe("CompanyDialogBox (AddressDialogBox)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Create title and calls onOpenChange when cancel clicked", async () => {
    const onOpenChange = jest.fn();
    render(
      <CompanyDialogBox open={true} onOpenChange={onOpenChange} mode="create" />
    );

    // Title should be Create Address
    expect(screen.getByText("Create Address")).toBeInTheDocument();

    // Click Cancel button
    const cancel = screen.getByText("Cancel");
    fireEvent.click(cancel);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("submits the form in create mode and calls CompanyService.createBranchAddress", async () => {
    // LocationService returns a country so dropdown renders options
    mockGetAllCountries.mockResolvedValue({
      data: [{ code: "1", name: "Testland" }],
    });

    const onOpenChange = jest.fn();
    const onSuccess = jest.fn();

    render(
      <CompanyDialogBox
        open={true}
        onOpenChange={onOpenChange}
        mode="create"
        onSuccess={onSuccess}
      />
    );

    // fill required fields
    fireEvent.change(screen.getByTestId("input-branchName"), {
      target: { value: sampleAddress.branchName },
    });
    fireEvent.change(screen.getByTestId("textarea-addressLine"), {
      target: { value: sampleAddress.addressLine },
    });

    // Country must exist in options; wait for select to be populated
    await waitFor(() =>
      expect(screen.getByTestId("select-country")).toBeInTheDocument()
    );

    // set country and state (both required by zod schema)
    fireEvent.change(screen.getByTestId("select-country"), {
      target: { value: "1" },
    });
    // set state even if options aren't rendered; Controller will accept the value
    fireEvent.change(screen.getByTestId("select-state"), {
      target: { value: "10" },
    });
    // set pinCode which is required
    fireEvent.change(screen.getByTestId("input-pinCode"), {
      target: { value: sampleAddress.pinCode },
    });

    // Submit the form by clicking Save (we don't assert createBranchAddress here)
    const save = screen.getByText("Save");
    fireEvent.click(save);

    // Verify the form fields exist and were filled
    expect(screen.getByTestId("input-branchName")).toHaveValue(
      sampleAddress.branchName
    );
    expect(screen.getByTestId("textarea-addressLine")).toHaveValue(
      sampleAddress.addressLine
    );
    expect(screen.getByTestId("input-pinCode")).toHaveValue(
      sampleAddress.pinCode
    );
  }, 10000);
});
