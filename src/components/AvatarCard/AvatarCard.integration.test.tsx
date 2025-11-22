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

      const trigger = screen.getByTestId("integration-avatar-trigger");
      await user.click(trigger);

      // Wait for dropdown to open and content to appear
      expect(
        await screen.findByText("loadingUser", {}, { timeout: 5000 })
      ).toBeInTheDocument();
      expect(screen.getByText("pleaseWait")).toBeInTheDocument();
    }, 10000);

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

      expect(screen.getByText("failedToLoadUser")).toBeInTheDocument();
      expect(screen.getByText("retry")).toBeInTheDocument();

      await user.click(screen.getByText("retry"));
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

      expect(screen.getByText("loggingOut")).toBeInTheDocument();
      expect(screen.getByText("pleaseWait")).toBeInTheDocument();
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
      expect(screen.getByText("profile")).toBeInTheDocument();
      expect(screen.getByText("companySettings")).toBeInTheDocument();
      expect(screen.getByText("orders")).toBeInTheDocument();
      expect(screen.getByText("quotes")).toBeInTheDocument();
      expect(screen.getByText("logOut")).toBeInTheDocument();

      // Test logout functionality
      await user.click(screen.getByText("logOut"));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("displays menu items correctly", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          user={mockUser}
          onLogout={mockLogout}
          trigger={mockTrigger}
        />
      );

      await user.click(screen.getByTestId("integration-avatar-trigger"));

      expect(screen.getByText("orders")).toBeInTheDocument();
      expect(screen.getByText("profile")).toBeInTheDocument();
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
      const profileLink = screen.getByText("profile").closest("a");
      expect(profileLink).toHaveAttribute("href", "/settings/profile");

      const companyLink = screen.getByText("companySettings").closest("a");
      expect(companyLink).toHaveAttribute("href", "/settings/company");

      const ordersLink = screen.getByText("orders").closest("a");
      expect(ordersLink).toHaveAttribute("href", "/landing/orderslanding");

      const quotesLink = screen.getByText("quotes").closest("a");
      expect(quotesLink).toHaveAttribute("href", "/landing/quoteslanding");
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
