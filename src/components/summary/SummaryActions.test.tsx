import "@testing-library/jest-dom";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import SummaryActions from "@/components/summary/SummaryActions";

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
      expect(screen.getByRole("button", { name: /cancel/i })).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /requestQuote/i })
      ).toBeTruthy();
    });

    it("should render order-specific labels when isOrder is true", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isOrder={true} />
        </FormWrapper>
      );

      // Assert
      expect(screen.getByRole("button", { name: /placeOrder/i })).toBeTruthy();
    });

    it("should render quote-specific labels when isOrder is false", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isOrder={false} />
        </FormWrapper>
      );

      // Assert
      expect(
        screen.getByRole("button", { name: /requestQuote/i })
      ).toBeTruthy();
    });

    it("should render custom submit label when provided", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions submitLabel="Custom Submit" />
        </FormWrapper>
      );

      // Assert
      expect(
        screen.getByRole("button", { name: /custom submit/i })
      ).toBeTruthy();
    });

    it("should render custom cancel label when provided", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions cancelLabel="Custom Cancel" />
        </FormWrapper>
      );

      // Assert
      expect(
        screen.getByRole("button", { name: /custom cancel/i })
      ).toBeTruthy();
    });

    it("should apply custom className", () => {
      // Arrange & Act
      const { container } = render(
        <FormWrapper>
          <SummaryActions className="custom-class" />
        </FormWrapper>
      );

      // Assert
      expect(container.querySelector(".custom-class")).toBeTruthy();
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
      fireEvent.click(screen.getByRole("button", { name: /requestQuote/i }));

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
      fireEvent.click(screen.getByRole("button", { name: /requestQuote/i }));
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
      expect(screen.getByText(/placingOrder/i)).toBeTruthy();
    });

    it("should show loading state when isSubmitting is true for quotes", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isOrder={false} isSubmitting={true} />
        </FormWrapper>
      );

      // Assert
      expect(screen.getByText(/creatingQuote/i)).toBeTruthy();
    });

    it("should disable buttons when isSubmitting is true", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isSubmitting={true} />
        </FormWrapper>
      );

      // Assert
      const creatingBtn = screen.getByRole("button", {
        name: /creatingQuote/i,
      }) as HTMLButtonElement;
      const cancelBtn = screen.getByRole("button", {
        name: /cancel/i,
      }) as HTMLButtonElement;
      expect(creatingBtn).toBeTruthy();
      expect(creatingBtn.disabled).toBe(true);
      expect(cancelBtn).toBeTruthy();
      expect(cancelBtn.disabled).toBe(true);
    });

    it("should show spinner icon when isSubmitting is true", () => {
      // Arrange & Act
      const { container } = render(
        <FormWrapper>
          <SummaryActions isSubmitting={true} />
        </FormWrapper>
      );

      // Assert
      expect(container.querySelector(".animate-spin")).toBeTruthy();
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
      const requestBtn = screen.getByRole("button", {
        name: /requestQuote/i,
      }) as HTMLButtonElement;
      const cancelBtn2 = screen.getByRole("button", {
        name: /cancel/i,
      }) as HTMLButtonElement;
      expect(requestBtn).toBeTruthy();
      expect(requestBtn.disabled).toBe(true);
      expect(cancelBtn2).toBeTruthy();
      expect(cancelBtn2.disabled).toBe(true);
    });

    it("should enable buttons when disabled prop is false", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions disabled={false} />
        </FormWrapper>
      );

      // Assert
      const requestBtn2 = screen.getByRole("button", {
        name: /requestQuote/i,
      }) as HTMLButtonElement;
      const cancelBtn3 = screen.getByRole("button", {
        name: /cancel/i,
      }) as HTMLButtonElement;
      expect(requestBtn2).toBeTruthy();
      expect(requestBtn2.disabled).toBe(false);
      expect(cancelBtn3).toBeTruthy();
      expect(cancelBtn3.disabled).toBe(false);
    });

    it("should disable buttons when both isSubmitting and disabled are true", () => {
      // Arrange & Act
      render(
        <FormWrapper>
          <SummaryActions isSubmitting={true} disabled={true} />
        </FormWrapper>
      );

      // Assert
      const creatingBtn2 = screen.getByRole("button", {
        name: /creatingQuote/i,
      }) as HTMLButtonElement;
      const cancelBtn4 = screen.getByRole("button", {
        name: /cancel/i,
      }) as HTMLButtonElement;
      expect(creatingBtn2).toBeTruthy();
      expect(creatingBtn2.disabled).toBe(true);
      expect(cancelBtn4).toBeTruthy();
      expect(cancelBtn4.disabled).toBe(true);
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
      expect(container.querySelector("svg")).toBeTruthy();
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
      expect(container.querySelector("svg")).toBeTruthy();
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

      const submitButton = screen.getByRole("button", {
        name: /requestQuote/i,
      });
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      // Act & Assert - buttons should be focusable
      submitButton.focus();
      expect(document.activeElement).toBe(submitButton);

      cancelButton.focus();
      expect(document.activeElement).toBe(cancelButton);
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
        fireEvent.click(screen.getByRole("button", { name: /requestQuote/i }));
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
      const reqBtn = screen.getByRole("button", { name: /requestQuote/i });
      const cancelBtn5 = screen.getByRole("button", { name: /cancel/i });
      expect(reqBtn).toBeTruthy();
      expect(cancelBtn5).toBeTruthy();
    });
  });
});
