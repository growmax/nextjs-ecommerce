import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvatarCard, AvatarCardProps } from "./AvatarCard";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock UI components
jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: any) => (
    <div className={className} data-testid="avatar">
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="avatar-image" />
  ),
  AvatarFallback: ({ children }: any) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({
    children,
    className,
    align,
    side,
    "aria-label": ariaLabel,
  }: any) => (
    <div
      data-testid="dropdown-content"
      className={className}
      data-align={align}
      data-side={side}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children, className }: any) => (
    <div className={className} data-testid="dropdown-label">
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, disabled, className }: any) => (
    <div
      data-testid="dropdown-item"
      onClick={onClick}
      data-disabled={disabled}
      className={className}
      role="menuitem"
      aria-disabled={disabled}
    >
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Building2: () => <div data-testid="building2-icon" />,
  IdCard: () => <div data-testid="id-card-icon" />,
  Loader2: () => <div data-testid="loader2-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  User: () => <div data-testid="user-icon" />,
}));

describe("AvatarCard", () => {
  const mockUser = {
    displayName: "John Doe",
    email: "john.doe@example.com",
    companyName: "Acme Corp",
    picture: "https://example.com/avatar.jpg",
  };

  const mockOnLogout = jest.fn();
  const mockOnRetry = jest.fn();

  const defaultProps: AvatarCardProps = {
    user: mockUser,
    onLogout: mockOnLogout,
    trigger: <button data-testid="avatar-trigger">Avatar</button>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should render loading state when user is null", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} user={null} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("Loading user...")).toBeInTheDocument();
      expect(screen.getByText("Please wait")).toBeInTheDocument();
      expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should render error state when isError is true", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard {...defaultProps} isError={true} onRetry={mockOnRetry} />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("Failed to load user")).toBeInTheDocument();
      expect(screen.getByText("Please try again")).toBeInTheDocument();
      expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
    });

    it("should call onRetry when retry button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard {...defaultProps} isError={true} onRetry={mockOnRetry} />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      const retryButton = screen.getByText("Retry");
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("Normal User State", () => {
    it("should render user information correctly", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });

    it("should generate correct user initials", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      // Check for initials in avatar fallback
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should handle single name for initials", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          {...defaultProps}
          user={{ ...mockUser, displayName: "John" }}
        />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("J")).toBeInTheDocument();
    });

    it("should handle empty displayName with fallback", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          {...defaultProps}
          user={{ ...mockUser, displayName: null }}
        />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("U")).toBeInTheDocument();
    });
  });

  describe("Menu Items", () => {
    it("should render all default menu items", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Company Settings")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();
      expect(screen.getByText("Quotes")).toBeInTheDocument();
      expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("should hide Orders when showOrders is false", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} showOrders={false} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.queryByText("Orders")).not.toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Quotes")).toBeInTheDocument();
    });

    it("should hide Quotes when showQuotes is false", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} showQuotes={false} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.queryByText("Quotes")).not.toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();
    });
  });

  describe("Logout Functionality", () => {
    it("should call onLogout when logout button is clicked", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      const logoutButton = screen.getByText("Log out");
      await user.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it("should show loading state during logout", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} isLoggingOut={true} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("Logging out...")).toBeInTheDocument();
      expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
    });

    it("should disable logout button during logout", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} isLoggingOut={true} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      // Find the logout menu item (which is a button-like element)
      const logoutMenuItem = screen
        .getByText("Logging out...")
        .closest('[role="menuitem"]');
      expect(logoutMenuItem).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Props and Configuration", () => {
    it("should apply custom menuClassName", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard {...defaultProps} menuClassName="custom-menu-class" />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      // Use the testid from the mock
      const dropdownContent = screen.getByTestId("dropdown-content");
      expect(dropdownContent).toHaveClass("custom-menu-class");
    });

    it("should render trigger element", () => {
      render(<AvatarCard {...defaultProps} />);

      expect(screen.getByTestId("avatar-trigger")).toBeInTheDocument();
      expect(screen.getByText("Avatar")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with minimal data", async () => {
      const user = userEvent.setup();
      const minimalUser = {
        displayName: "Test User",
        email: null,
        companyName: null,
        picture: null,
      };

      render(<AvatarCard {...defaultProps} user={minimalUser} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(
        screen.queryByText("john.doe@example.com")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
    });

    it("should not render company name when it's 'No company'", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          {...defaultProps}
          user={{ ...mockUser, companyName: "No company" }}
        />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.queryByText("No company")).not.toBeInTheDocument();
    });

    it("should not render email when it's 'No email'", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard
          {...defaultProps}
          user={{ ...mockUser, email: "No email" }}
        />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.queryByText("No email")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for different states", async () => {
      const user = userEvent.setup();

      // Test normal state
      const { rerender } = render(<AvatarCard {...defaultProps} />);
      await user.click(screen.getByTestId("avatar-trigger"));
      expect(screen.getByLabelText("User account menu")).toBeInTheDocument();

      // Test loading state
      rerender(<AvatarCard {...defaultProps} user={null} />);
      await user.click(screen.getByTestId("avatar-trigger"));
      expect(
        screen.getByLabelText("User account menu - Loading")
      ).toBeInTheDocument();

      // Test error state
      rerender(<AvatarCard {...defaultProps} isError={true} />);
      await user.click(screen.getByTestId("avatar-trigger"));
      expect(
        screen.getByLabelText("User account menu - Error")
      ).toBeInTheDocument();
    });
  });
});
