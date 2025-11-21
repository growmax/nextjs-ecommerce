import "@testing-library/jest-dom";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import SummaryActions from "./SummaryActions";

// Wrapper component to provide form context
const FormWrapper = ({ children, defaultValues = {} }: any) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("SummaryActions", () => {
  describe("Rendering", () => {
    it("should render submit and cancel buttons", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /request quote/i })).toBeInTheDocument();
    });

    it("should render order-specific labels when isOrder is true", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isOrder={true} />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /place order/i })).toBeInTheDocument();
    });

    it("should render quote-specific labels when isOrder is false", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isOrder={false} />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /request quote/i })).toBeInTheDocument();
    });

    it("should render custom submit label when provided", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions submitLabel="Custom Submit" />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /custom submit/i })).toBeInTheDocument();
    });

    it("should render custom cancel label when provided", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions cancelLabel="Custom Cancel" />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /custom cancel/i })).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      // Arrange & Act
      const { container } = render(
        <FormWrapper>
          <SummaryActions className="custom-class" />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onSubmit when submit button is clicked", () => {
      // Arrange
      const handleSubmit = jest.fn();
      render(
        <FormWrapper>
          <SummaryActions onSubmit={handleSubmit} />
        </FormWrapper>
      );

      // Act
      fireEvent.click(screen.getByRole("button", { name: /request quote/i }));

      // Assert
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it("should call onCancel when cancel button is clicked", () => {
      // Arrange
      const handleCancel = jest.fn();
      render(
        <FormWrapper>
          <SummaryActions onCancel={handleCancel} />
        </FormWrapper>
      );

      // Act
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      // Assert
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it("should not call handlers when buttons are disabled", () => {
      // Arrange
      const handleSubmit = jest.fn();
      const handleCancel = jest.fn();
      render(
        <FormWrapper>
          <SummaryActions
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            disabled={true}
          />
        </FormWrapper>
      );

      // Act
      fireEvent.click(screen.getByRole("button", { name: /request quote/i }));
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      // Assert
      expect(handleSubmit).not.toHaveBeenCalled();
      expect(handleCancel).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("should show loading state when isSubmitting is true for orders", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isOrder={true} isSubmitting={true} />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByText(/placing order.../i)).toBeInTheDocument();
    });

    it("should show loading state when isSubmitting is true for quotes", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isOrder={false} isSubmitting={true} />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByText(/creating quote.../i)).toBeInTheDocument();
    });

    it("should disable buttons when isSubmitting is true", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isSubmitting={true} />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /creating quote.../i })).toBeDisabled();
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("should show spinner icon when isSubmitting is true", () => {
      // Arrange & Act
      const { container } = render(
        <FormWrapper>
          <SummaryActions isSubmitting={true} />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  describe("Button States", () => {
    it("should disable buttons when disabled prop is true", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions disabled={true} />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /request quote/i })).toBeDisabled();
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("should enable buttons when disabled prop is false", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions disabled={false} />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /request quote/i })).not.toBeDisabled();
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /cancel/i })).not.toBeDisabled();
    });

    it("should disable buttons when both isSubmitting and disabled are true", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isSubmitting={true} disabled={true} />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /creating quote.../i })).toBeDisabled();
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });
  });

  describe("Icons", () => {
    it("should show ShoppingCart icon for orders when not submitting", () => {
      // Arrange & Act
      const { container } = render(
        <FormWrapper>
          <SummaryActions isOrder={true} isSubmitting={false} />
        </FormWrapper>
      );

      // Assert
      // ShoppingCart icon should be present
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should show FileText icon for quotes when not submitting", () => {
      // Arrange & Act
      const { container } = render(
        <FormWrapper>
          <SummaryActions isOrder={false} isSubmitting={false} />
        </FormWrapper>
      );

      // Assert
      // FileText icon should be present
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper button roles", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions />
        </FormWrapper>
      );

      // Assert
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("should be keyboard accessible", () => {
      // Arrange
      render(
        <FormWrapper>
          <SummaryActions />
        </FormWrapper>
      );

      const submitButton = screen.getByRole("button", { name: /request quote/i });
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      // Act & Assert - buttons should be focusable
      submitButton.focus();
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(submitButton).toHaveFocus();

      cancelButton.focus();
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(cancelButton).toHaveFocus();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing onSubmit handler", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions />
        </FormWrapper>
      );

      // Assert - should not throw error
      expect(() => {
        fireEvent.click(screen.getByRole("button", { name: /request quote/i }));
      }).not.toThrow();
    });

    it("should handle missing onCancel handler", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions />
        </FormWrapper>
      );

      // Assert - should not throw error
      expect(() => {
        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      }).not.toThrow();
    });

    it("should render with default props", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions />
        </FormWrapper>
      );

      // Assert
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /request quote/i })).toBeInTheDocument();
      // @ts-expect-error - jest-dom matchers are available at runtime
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });
  });
});
