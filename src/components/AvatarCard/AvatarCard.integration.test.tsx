import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvatarCard } from "./AvatarCard";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

// Mock getUserInitials utility
jest.mock("@/utils/General/general", () => ({
  getUserInitials: (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  },
}));

describe("AvatarCard Integration Tests", () => {
  // Test data
  const mockUser = {
    displayName: "John Doe",
    email: "john.doe@example.com",
    companyName: "ACME Corp",
    picture: "https://example.com/avatar.png",
  };

  const mockTrigger = (
    <button data-testid="integration-avatar-trigger">Avatar</button>
  );
  const mockLogout = jest.fn();
  const mockRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User State Management", () => {
    it("shows loading state when user is null", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard user={null} onLogout={mockLogout} trigger={mockTrigger} />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("Loading user...")).toBeInTheDocument();
      expect(screen.getByText("Please wait")).toBeInTheDocument();
    });

    it("shows error state when isError=true", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          user={null}
          onLogout={mockLogout}
          trigger={mockTrigger}
          isError={true}
          onRetry={mockRetry}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("Failed to load user")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();

      await user.click(screen.getByText("Retry"));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it("shows logout state when isLoggingOut=true", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
          isLoggingOut={true}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("Logging out...")).toBeInTheDocument();
      expect(screen.getByText("Please wait")).toBeInTheDocument();
    });
  });

  describe("User Data Display", () => {
    it("displays user information correctly", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("ACME Corp")).toBeInTheDocument();
    });

    it("handles user with minimal data", async () => {
      const user = userEvent.setup();
      const minimalUser = {
        displayName: "Test User",
        email: null,
        companyName: null,
        picture: null,
      };

      render(
        <AvatarCard
          user={minimalUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(
        screen.queryByText("john.doe@example.com")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("ACME Corp")).not.toBeInTheDocument();
    });

    it("doesn't show 'No company' or 'No email'", async () => {
      const user = userEvent.setup();
      const userWithNoData = {
        displayName: "Test User",
        email: "No email",
        companyName: "No company",
        picture: null,
      };

      render(
        <AvatarCard
          user={userWithNoData}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.queryByText("No email")).not.toBeInTheDocument();
      expect(screen.queryByText("No company")).not.toBeInTheDocument();
    });
  });

  describe("Navigation & Menu Items", () => {
    it("renders all menu items and handles logout", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      // Check menu items exist
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Company Settings")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();
      expect(screen.getByText("Quotes")).toBeInTheDocument();
      expect(screen.getByText("Log out")).toBeInTheDocument();

      // Test logout functionality
      await user.click(screen.getByText("Log out"));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("respects showOrders and showQuotes props", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
          showOrders={false}
          showQuotes={false}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.queryByText("Orders")).not.toBeInTheDocument();
      expect(screen.queryByText("Quotes")).not.toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    it("has correct navigation links", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      // Check link hrefs
      const profileLink = screen.getByText("Profile").closest("a");
      expect(profileLink).toHaveAttribute("href", "/settings/profile");

      const companyLink = screen.getByText("Company Settings").closest("a");
      expect(companyLink).toHaveAttribute("href", "/settings/company");

      const ordersLink = screen.getByText("Orders").closest("a");
      expect(ordersLink).toHaveAttribute("href", "/orders");

      const quotesLink = screen.getByText("Quotes").closest("a");
      expect(quotesLink).toHaveAttribute("href", "/quotesummary");
    });
  });

  describe("Props and Configuration", () => {
    it("applies custom alignment and className", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
          align="start"
          menuClassName="custom-class"
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      const menuContent = screen.getByLabelText("User account menu");
      expect(menuContent).toHaveAttribute("data-align", "start");
      expect(menuContent).toHaveClass("custom-class");
    });

    it("applies side positioning", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
          side="bottom"
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      const menuContent = screen.getByLabelText("User account menu");
      expect(menuContent).toHaveAttribute("data-side", "bottom");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for different states", async () => {
      const user = userEvent.setup();

      // Normal state
      const { rerender } = render(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));
      expect(screen.getByLabelText("User account menu")).toBeInTheDocument();

      // Close dropdown before re-rendering to avoid pointer-events issue
      await user.keyboard("{Escape}");

      // Loading state
      rerender(
        <AvatarCard user={null} onLogout={mockLogout} trigger={mockTrigger} />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));
      expect(
        screen.getByLabelText("User account menu - Loading")
      ).toBeInTheDocument();

      // Close dropdown before re-rendering
      await user.keyboard("{Escape}");

      // Error state
      rerender(
        <AvatarCard
          user={null}
          onLogout={mockLogout}
          trigger={mockTrigger}
          isError={true}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));
      expect(
        screen.getByLabelText("User account menu - Error")
      ).toBeInTheDocument();

      // Close dropdown before re-rendering
      await user.keyboard("{Escape}");

      // Logout state
      rerender(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
          isLoggingOut={true}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));
      expect(
        screen.getByLabelText("User account menu - Logging out")
      ).toBeInTheDocument();
    });
  });

  describe("Avatar Fallback", () => {
    it("generates correct initials", async () => {
      const user = userEvent.setup();
      const userWithoutPicture = {
        ...mockUser,
        picture: null,
      };

      render(
        <AvatarCard
          user={userWithoutPicture}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("handles single name", async () => {
      const user = userEvent.setup();
      const userWithSingleName = {
        ...mockUser,
        picture: null,
        displayName: "John",
      };

      render(
        <AvatarCard
          user={userWithSingleName}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("J")).toBeInTheDocument();
    });

    it("handles empty name with fallback", async () => {
      const user = userEvent.setup();
      const userWithoutName = {
        ...mockUser,
        picture: null,
        displayName: null,
      };

      render(
        <AvatarCard
          user={userWithoutName}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("U")).toBeInTheDocument();
    });
  });
});
