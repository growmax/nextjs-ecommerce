import { render, screen, fireEvent } from "@testing-library/react";
import SPRForm from "./SPRForm";
import {
  mockCompetitorDetails,
  mockSellerCompanyId,
  mockFormValues,
  mockCallbacks,
  mockTranslations,
} from "./SPRForm.mocks";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (params) {
      return mockTranslations[key as keyof typeof mockTranslations]?.replace(
        /\{(\w+)\}/g,
        (_, param) => params[param] || ""
      ) || key;
    }
    return mockTranslations[key as keyof typeof mockTranslations] || key;
  },
}));

// Mock useGetManufacturerCompetitors hook
jest.mock("@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    competitors: mockCompetitorDetails,
    competitorsLoading: false,
    competitorsError: undefined,
  })),
}));

// Mock UI components
jest.mock("@/components/ui/card", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    Card: ({ children, className }: any) =>
      React.createElement("div", { "data-testid": "card", className }, children),
    CardHeader: ({ children, className }: any) =>
      React.createElement("div", { "data-testid": "card-header", className }, children),
    CardTitle: ({ children, className }: any) =>
      React.createElement("h2", { "data-testid": "card-title", className }, children),
    CardContent: ({ children, className }: any) =>
      React.createElement("div", { "data-testid": "card-content", className }, children),
  };
});

jest.mock("@/components/ui/input", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const Input = React.forwardRef(
      ({ value, onChange, className, id, type, placeholder, ...props }: any, ref: any) =>
        React.createElement("input", {
          ref,
          id,
          type,
          value,
          onChange,
          className,
          placeholder,
          "data-testid": id,
          ...props,
        })
  );
  Input.displayName = "Input";
  return {
    Input,
  };
});

jest.mock("@/components/ui/label", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const Label = ({ children, htmlFor, className }: any) =>
    React.createElement("label", { htmlFor, className, "data-testid": `label-${htmlFor}` }, children);
  Label.displayName = "Label";
  return {
    Label,
  };
});

jest.mock("@/components/ui/textarea", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const Textarea = React.forwardRef(
      ({ value, onChange, className, id, placeholder, ...props }: any, ref: any) =>
        React.createElement("textarea", {
          ref,
          id,
          value,
          onChange,
          className,
          placeholder,
          "data-testid": id,
          ...props,
        })
    );
  Textarea.displayName = "Textarea";
  return {
    Textarea,
  };
});

jest.mock("@/components/ui/select", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  
  // Store onValueChange in a way that SelectItem can access it
  let globalOnValueChange: ((value: string) => void) | undefined;
  let globalDisabled: boolean = false;

  const MockSelect = ({
    onValueChange,
    disabled,
    children,
  }: {
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => {
    globalOnValueChange = onValueChange;
    globalDisabled = disabled || false;
    
    return React.createElement(
      "div",
      { "data-testid": "select", "data-disabled": disabled },
      children
    );
  };
  MockSelect.displayName = "Select";

  const MockSelectTrigger = ({ children, id, className }: any) =>
    React.createElement(
      "button",
      { "data-testid": `select-trigger-${id}`, className },
      children
    );
  MockSelectTrigger.displayName = "SelectTrigger";

  const MockSelectValue = ({ placeholder }: any) =>
    React.createElement("span", { "data-testid": "select-value" }, placeholder);
  MockSelectValue.displayName = "SelectValue";

  const MockSelectContent = ({ children }: any) =>
    React.createElement("div", { "data-testid": "select-content" }, children);
  MockSelectContent.displayName = "SelectContent";

  const MockSelectItem = ({ children, value, disabled }: any) =>
    React.createElement(
      "button",
      {
        "data-testid": `select-item-${value}`,
        disabled: disabled || globalDisabled,
        onClick: () => {
          if (!disabled && !globalDisabled && value !== "no-competitors" && globalOnValueChange) {
            globalOnValueChange(value);
          }
        },
      },
      children
    );
  MockSelectItem.displayName = "SelectItem";

  return {
    Select: MockSelect,
    SelectTrigger: MockSelectTrigger,
    SelectValue: MockSelectValue,
    SelectContent: MockSelectContent,
    SelectItem: MockSelectItem,
  };
});

describe("SPRForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component with all fields", () => {
      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toHaveTextContent("Customer Information");
      expect(screen.getByTestId("customer-name")).toBeInTheDocument();
      expect(screen.getByTestId("project-name")).toBeInTheDocument();
      expect(screen.getByTestId("select")).toBeInTheDocument();
      expect(screen.getByTestId("price-justification")).toBeInTheDocument();
    });

    it("should render with initial values", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
          customerName={mockFormValues.customerName}
          projectName={mockFormValues.projectName}
          competitors={mockFormValues.competitors}
          priceJustification={mockFormValues.priceJustification}
        />
      );

      expect(screen.getByTestId("customer-name")).toHaveValue(mockFormValues.customerName);
      expect(screen.getByTestId("project-name")).toHaveValue(mockFormValues.projectName);
      expect(screen.getByTestId("price-justification")).toHaveValue(
        mockFormValues.priceJustification
      );
    });

    it("should render with empty values by default", () => {
      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      expect(screen.getByTestId("customer-name")).toHaveValue("");
      expect(screen.getByTestId("project-name")).toHaveValue("");
      expect(screen.getByTestId("price-justification")).toHaveValue("");
    });

    it("should display selected competitors", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
          competitors={["Competitor 1", "Competitor 2"]}
        />
      );

      // Check for competitors in the badges (selected competitors section)
      // Use getAllByText and filter for the ones in badges (not in select dropdown)
      const competitor1Elements = screen.getAllByText("Competitor 1");
      const competitor2Elements = screen.getAllByText("Competitor 2");
      
      // Should have at least one instance (in the badge)
      expect(competitor1Elements.length).toBeGreaterThan(0);
      expect(competitor2Elements.length).toBeGreaterThan(0);
      
      // Verify badges are rendered by checking for remove buttons
      const removeButtons = screen.getAllByLabelText(/Remove Competitor/);
      expect(removeButtons.length).toBe(2);
    });

    it("should not display competitors section when no competitors selected", () => {
      const { container } = render(
        <SPRForm sellerCompanyId={mockSellerCompanyId} competitors={[]} />
      );

      // The select dropdown will still show competitor options
      // But the badges section (selected competitors) should not be rendered
      const removeButtons = screen.queryAllByLabelText(/Remove Competitor/);
      expect(removeButtons.length).toBe(0);
      
      // Verify no badges container is rendered (the flex-wrap div for selected competitors)
      const badgesContainer = container.querySelector(".flex.flex-wrap.gap-2.mt-2");
      expect(badgesContainer).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onCustomerNameChange when customer name input changes", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
          onCustomerNameChange={mockCallbacks.onCustomerNameChange}
        />
      );

      const customerNameInput = screen.getByTestId("customer-name");
      fireEvent.change(customerNameInput, { target: { value: "New Customer" } });

      expect(mockCallbacks.onCustomerNameChange).toHaveBeenCalledWith("New Customer");
    });

    it("should call onProjectNameChange when project name input changes", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
          onProjectNameChange={mockCallbacks.onProjectNameChange}
        />
      );

      const projectNameInput = screen.getByTestId("project-name");
      fireEvent.change(projectNameInput, { target: { value: "New Project" } });

      expect(mockCallbacks.onProjectNameChange).toHaveBeenCalledWith("New Project");
    });

    it("should call onPriceJustificationChange when textarea changes", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
          onPriceJustificationChange={mockCallbacks.onPriceJustificationChange}
        />
      );

      const textarea = screen.getByTestId("price-justification");
      fireEvent.change(textarea, { target: { value: "New justification" } });

      expect(mockCallbacks.onPriceJustificationChange).toHaveBeenCalledWith("New justification");
    });

    it("should call onCompetitorsChange when a competitor is selected", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
          competitors={[]}
          onCompetitorsChange={mockCallbacks.onCompetitorsChange}
        />
      );

      // Find and click a competitor option (SelectContent is always rendered in our mock)
      const competitorItem = screen.getByTestId("select-item-Competitor 1");
      fireEvent.click(competitorItem);

      expect(mockCallbacks.onCompetitorsChange).toHaveBeenCalledWith(["Competitor 1"]);
    });

    it("should not add duplicate competitors", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
          competitors={["Competitor 1"]}
          onCompetitorsChange={mockCallbacks.onCompetitorsChange}
        />
      );

      // Try to add the same competitor again
      const competitorItem = screen.getByTestId("select-item-Competitor 1");
      fireEvent.click(competitorItem);

      // Should not be called since competitor already exists (handled in component)
      // The component checks if competitor exists before calling onCompetitorsChange
      expect(mockCallbacks.onCompetitorsChange).not.toHaveBeenCalled();
    });

    it("should call onCompetitorsChange when a competitor is removed", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
          competitors={["Competitor 1", "Competitor 2"]}
          onCompetitorsChange={mockCallbacks.onCompetitorsChange}
        />
      );

      // Find the remove button for Competitor 1 using aria-label
      const removeButton = screen.getByLabelText("Remove Competitor 1");
      fireEvent.click(removeButton);
      
      expect(mockCallbacks.onCompetitorsChange).toHaveBeenCalledWith(["Competitor 2"]);
    });
  });

  describe("Competitors Loading State", () => {
    it("should show loading state when competitors are loading", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const useGetManufacturerCompetitors = require("@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors").default;
      useGetManufacturerCompetitors.mockReturnValueOnce({
        competitors: [],
        competitorsLoading: true,
        competitorsError: undefined,
      });

      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      expect(screen.getByText("Loading competitors...")).toBeInTheDocument();
    });

    it("should disable select when competitors are loading", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const useGetManufacturerCompetitors = require("@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors").default;
      useGetManufacturerCompetitors.mockReturnValueOnce({
        competitors: [],
        competitorsLoading: true,
        competitorsError: undefined,
      });

      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      const select = screen.getByTestId("select");
      expect(select).toHaveAttribute("data-disabled", "true");
    });
  });

  describe("Competitors List", () => {
    it("should display competitors list when available", () => {
      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      // Competitors should be available in the select
      expect(screen.getByTestId("select-item-Competitor 1")).toBeInTheDocument();
      expect(screen.getByTestId("select-item-Competitor 2")).toBeInTheDocument();
    });

    it("should show no competitors message when list is empty", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const useGetManufacturerCompetitors = require("@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors").default;
      useGetManufacturerCompetitors.mockReturnValueOnce({
        competitors: [],
        competitorsLoading: false,
        competitorsError: undefined,
      });

      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      expect(screen.getByText("No competitors available")).toBeInTheDocument();
    });

    it("should handle competitor with only name field", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const useGetManufacturerCompetitors = require("@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors").default;
      useGetManufacturerCompetitors.mockReturnValueOnce({
        competitors: [
          {
            id: 1,
            name: "Name Only Competitor",
            manufacturerCompanyId: 123,
          },
        ],
        competitorsLoading: false,
        competitorsError: undefined,
      });

      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      expect(screen.getByTestId("select-item-Name Only Competitor")).toBeInTheDocument();
    });

    it("should handle competitor with only competitorName field", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const useGetManufacturerCompetitors = require("@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors").default;
      useGetManufacturerCompetitors.mockReturnValueOnce({
        competitors: [
          {
            id: 1,
            competitorName: "Competitor Name Only",
            manufacturerCompanyId: 123,
          },
        ],
        competitorsLoading: false,
        competitorsError: undefined,
      });

      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      expect(screen.getByTestId("select-item-Competitor Name Only")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined sellerCompanyId", () => {
      render(<SPRForm />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("should handle null callbacks gracefully", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
        />
      );

      const customerNameInput = screen.getByTestId("customer-name");
      
      // When callback is undefined, the input value won't update (it's controlled by props)
      // But it should not throw an error
      expect(() => {
        fireEvent.change(customerNameInput, { target: { value: "Test" } });
      }).not.toThrow();
      
      // The input should still be rendered
      expect(customerNameInput).toBeInTheDocument();
    });

    it("should handle empty competitor name gracefully", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const useGetManufacturerCompetitors = require("@/hooks/useGetManufacturerCompetitors/useGetManufacturerCompetitors").default;
      useGetManufacturerCompetitors.mockReturnValueOnce({
        competitors: [
          {
            id: 1,
            name: "",
            competitorName: "",
            manufacturerCompanyId: 123,
          },
        ],
        competitorsLoading: false,
        competitorsError: undefined,
      });

      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      // Should render "Unknown" for competitor with no name
      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for all inputs", () => {
      render(<SPRForm sellerCompanyId={mockSellerCompanyId} />);

      expect(screen.getByTestId("label-customer-name")).toBeInTheDocument();
      expect(screen.getByTestId("label-project-name")).toBeInTheDocument();
      expect(screen.getByTestId("label-competitors")).toBeInTheDocument();
      expect(screen.getByTestId("label-price-justification")).toBeInTheDocument();
    });

    it("should have proper aria-label for remove competitor button", () => {
      render(
        <SPRForm
          sellerCompanyId={mockSellerCompanyId}
          competitors={["Competitor 1"]}
        />
      );

      // Use aria-label to find the remove button directly
      const removeButton = screen.getByLabelText("Remove Competitor 1");
      
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveAttribute("aria-label", "Remove Competitor 1");
    });
  });
});

