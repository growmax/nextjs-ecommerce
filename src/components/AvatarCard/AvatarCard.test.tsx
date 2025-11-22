import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { AvatarCard } from "./AvatarCard";
import { AvatarCardProps } from "./Avatarcard.types";

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

type DropdownContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

jest.mock("@/components/ui/dropdown-menu", () => {
  const ActualReact = jest.requireActual("react");

  const { useState, useMemo, useContext } = ActualReact;
  const createContextTyped =
    ActualReact.createContext as typeof React.createContext;

  const DropdownContext = createContextTyped<DropdownContextType>({
    open: false,
    setOpen: (_value: React.SetStateAction<boolean>) => {},
  });

  const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const value = useMemo(() => ({ open, setOpen }), [open]);
    return (
      <DropdownContext.Provider value={value}>
        <div data-testid="dropdown-menu">{children}</div>
      </DropdownContext.Provider>
    );
  };

  const DropdownMenuTrigger = ({
    children,
  }: {
    children: React.ReactElement<any>;
  }) => {
    const { setOpen } = useContext(DropdownContext);
    const originalOnClick = children.props.onClick;

    return ActualReact.cloneElement(children, {
      onClick: (e: any) => {
        setOpen((o: boolean) => !o);
        if (originalOnClick) {
          originalOnClick(e);
        }
      },
    });
  };

  const DropdownMenuContent = (props: any) => {
    const { open } = useContext(DropdownContext);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children, forceMount, ...rest } = props;
    return (
      <div
        data-testid="dropdown-content"
        {...rest}
        data-state={open ? "open" : "closed"}
        data-align={props.align}
        data-side={props.side}
      >
        {children}
      </div>
    );
  };

  const DropdownMenuLabel = ({ children, className }: any) => (
    <div className={className} data-testid="dropdown-label">
      {children}
    </div>
  );
  const DropdownMenuItem = ({
    children,
    onClick,
    disabled,
    className,
  }: any) => (
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
  );
  const DropdownMenuSeparator = () => <hr data-testid="dropdown-separator" />;

  return {
    __esModule: true,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
  };
});

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
      const trigger = screen.getByTestId("avatar-trigger");
      await user.click(trigger);

      // Wait for dropdown to open and content to appear
      await waitFor(() => {
        expect(screen.getByText("loadingUser")).toBeInTheDocument();
      });

      expect(screen.getByText("pleaseWait")).toBeInTheDocument();
      expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
    }, 10000);
  });

  describe("Error State", () => {
    it("should render error state when isError is true", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard {...defaultProps} isError={true} onRetry={mockOnRetry} />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("failedToLoadUser")).toBeInTheDocument();
      expect(screen.getByText("pleaseTryAgain")).toBeInTheDocument();
      expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
    });

    it("should call onRetry when retry button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <AvatarCard {...defaultProps} isError={true} onRetry={mockOnRetry} />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      const retryButton = screen.getByText("retry");
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

    it("should display user avatar image when provided", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      const avatarImage = screen.getByTestId("avatar-image");
      expect(avatarImage).toHaveAttribute(
        "src",
        "https://example.com/avatar.jpg"
      );
      expect(avatarImage).toHaveAttribute("alt", "John Doe");
    });

    it("should show fallback initials when no image provided", async () => {
      const user = userEvent.setup();
      const userWithoutImage = {
        ...mockUser,
        picture: null,
      };
      render(<AvatarCard {...defaultProps} user={userWithoutImage} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument();
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

    it("should handle very long names with truncation", async () => {
      const user = userEvent.setup();
      const longName =
        "This is an extremely long display name that should be truncated";
      render(
        <AvatarCard
          {...defaultProps}
          user={{ ...mockUser, displayName: longName }}
        />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      const displayNameElement = screen.getByText(longName);
      expect(displayNameElement).toHaveClass("truncate");
      expect(displayNameElement).toBeInTheDocument();
    });

    it("should handle special characters in names", async () => {
      const user = userEvent.setup();
      const specialName = "José María Ñoño-Pérez";
      render(
        <AvatarCard
          {...defaultProps}
          user={{ ...mockUser, displayName: specialName }}
        />
      );

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText(specialName)).toBeInTheDocument();
      expect(screen.getByText("JM")).toBeInTheDocument(); // Initials from José María
    });
  });

  describe("Menu Items", () => {
    it("should render all default menu items", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("profile")).toBeInTheDocument();
      expect(screen.getByText("companySettings")).toBeInTheDocument();
      expect(screen.getByText("orders")).toBeInTheDocument();
      expect(screen.getByText("quotes")).toBeInTheDocument();
      expect(screen.getByText("logOut")).toBeInTheDocument();
    });

    it("should have correct href attributes for navigation links", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      // Check Profile link
      const profileLink = screen.getByText("profile").closest("a");
      expect(profileLink).toHaveAttribute("href", "/settings/profile");

      // Check Company Settings link
      const companyLink = screen.getByText("companySettings").closest("a");
      expect(companyLink).toHaveAttribute("href", "/settings/company");

      // Check Orders link
      const ordersLink = screen.getByText("orders").closest("a");
      expect(ordersLink).toHaveAttribute("href", "/landing/orderslanding");

      // Check Quotes link
      const quotesLink = screen.getByText("quotes").closest("a");
      expect(quotesLink).toHaveAttribute("href", "/landing/quoteslanding");
    });

    it("should open and close dropdown menu on trigger click", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      const dropdownTrigger = screen.getByTestId("avatar-trigger");
      const dropdownContent = screen.getByTestId("dropdown-content");

      // Initially dropdown should be closed (check data-state attribute)
      expect(dropdownContent).toHaveAttribute("data-state", "closed");

      // Click trigger to open dropdown
      await user.click(dropdownTrigger);

      // Wait for dropdown to open
      await waitFor(() => {
        expect(dropdownContent).toHaveAttribute("data-state", "open");
      });

      // Verify content is accessible when open
      expect(screen.getByText("profile")).toBeInTheDocument();

      // Click trigger again to close dropdown
      await user.click(dropdownTrigger);

      // Wait for dropdown to close
      await waitFor(() => {
        expect(dropdownContent).toHaveAttribute("data-state", "closed");
      });

      // The content is still in DOM but hidden (this is normal behavior for many dropdown components)
      // We verify the state instead of checking for element presence
      expect(dropdownContent).toHaveAttribute("data-state", "closed");
    });
  });
  describe("Logout Functionality", () => {
    it("should call onLogout when logout button is clicked", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      const logoutButton = screen.getByText("logOut");
      await user.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it("should show loading state during logout", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} isLoggingOut={true} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("loggingOut")).toBeInTheDocument();
      expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
    });

    it("should disable logout button during logout", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} isLoggingOut={true} />);

      // Click trigger to open dropdown
      await user.click(screen.getByTestId("avatar-trigger"));

      // Find the logout menu item (which is a button-like element)
      const logoutMenuItem = screen
        .getByText("loggingOut")
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

    it("should use default align value of 'end' when not specified", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      await user.click(screen.getByTestId("avatar-trigger"));

      const dropdownContent = screen.getByTestId("dropdown-content");
      expect(dropdownContent).toHaveAttribute("data-align", "end");
    });

    it("should apply custom align prop", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} align="start" />);

      await user.click(screen.getByTestId("avatar-trigger"));

      const dropdownContent = screen.getByTestId("dropdown-content");
      expect(dropdownContent).toHaveAttribute("data-align", "start");
    });

    it("should apply side positioning prop", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} side="bottom" />);

      await user.click(screen.getByTestId("avatar-trigger"));

      const dropdownContent = screen.getByTestId("dropdown-content");
      expect(dropdownContent).toHaveAttribute("data-side", "bottom");
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

    it("should handle user with only displayName", async () => {
      const user = userEvent.setup();
      const userWithOnlyName = {
        displayName: "John Doe",
        email: null,
        companyName: null,
        picture: null,
      };

      render(<AvatarCard {...defaultProps} user={userWithOnlyName} />);

      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText(/\.com/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Corp/)).not.toBeInTheDocument();
    });

    it("should handle user with only email", async () => {
      const user = userEvent.setup();
      const userWithOnlyEmail = {
        displayName: null,
        email: "user@example.com",
        companyName: null,
        picture: null,
      };

      render(<AvatarCard {...defaultProps} user={userWithOnlyEmail} />);

      await user.click(screen.getByTestId("avatar-trigger"));

      expect(screen.getByText("user@example.com")).toBeInTheDocument();
      expect(screen.getByText("U")).toBeInTheDocument(); // Fallback initial
    });

    it("should handle empty user object gracefully", async () => {
      const user = userEvent.setup();
      const emptyUser = {
        displayName: null,
        email: null,
        companyName: null,
        picture: null,
      };

      render(<AvatarCard {...defaultProps} user={emptyUser} />);

      await user.click(screen.getByTestId("avatar-trigger"));

      // Should show fallback initial 'U' and still render menu
      expect(screen.getByText("U")).toBeInTheDocument();
      expect(screen.getByText("profile")).toBeInTheDocument();
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
    afterEach(() => {
      cleanup();
    });

    it("should have proper ARIA labels for different states", async () => {
      const user = userEvent.setup();

      // Test normal state
      const { unmount: unmountNormal } = render(
        <AvatarCard {...defaultProps} />
      );
      const normalTriggers = screen.getAllByTestId("avatar-trigger");
      if (normalTriggers.length > 0) {
        await user.click(normalTriggers[0]!);
        expect(screen.getByLabelText("User account menu")).toBeInTheDocument();
      } else {
        fail("No avatar trigger found for normal state");
      }
      unmountNormal();

      // Test loading state
      const { unmount: unmountLoading } = render(
        <AvatarCard {...defaultProps} user={null} />
      );
      const loadingTriggers = screen.getAllByTestId("avatar-trigger");
      if (loadingTriggers.length > 0) {
        await user.click(loadingTriggers[0]!);
        expect(
          screen.getByLabelText("User account menu - Loading")
        ).toBeInTheDocument();
      } else {
        fail("No avatar trigger found for loading state");
      }
      unmountLoading();

      // Test error state
      render(<AvatarCard {...defaultProps} isError={true} user={null} />);
      const errorTriggers = screen.getAllByTestId("avatar-trigger");
      if (errorTriggers.length > 0) {
        await user.click(errorTriggers[0]!);
        expect(
          screen.getByLabelText("User account menu - Error")
        ).toBeInTheDocument();
      } else {
        fail("No avatar trigger found for error state");
      }
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      // Focus on trigger and press Enter to open
      await user.tab(); // Assuming trigger is first tabbable element
      await user.keyboard("{Enter}");

      // Menu should be open
      expect(screen.getByText("profile")).toBeInTheDocument();
    });

    it("should have proper menu item roles and attributes", async () => {
      const user = userEvent.setup();

      // Test normal state first
      const { unmount } = render(<AvatarCard {...defaultProps} />);
      await user.click(screen.getByTestId("avatar-trigger"));

      // Check that menu items have proper role
      const menuItems = screen.getAllByRole("menuitem");
      expect(menuItems.length).toBeGreaterThan(0);

      // Close dropdown and unmount
      await user.keyboard("{Escape}");
      unmount();

      // Now test logout state separately
      render(<AvatarCard {...defaultProps} isLoggingOut={true} />);
      await user.click(screen.getByTestId("avatar-trigger"));

      const disabledItem = screen
        .getByText("loggingOut")
        .closest('[role="menuitem"]');
      expect(disabledItem).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Avatar Display", () => {
    it("should apply correct CSS classes to avatar elements", async () => {
      const user = userEvent.setup();
      render(<AvatarCard {...defaultProps} />);

      await user.click(screen.getByTestId("avatar-trigger"));

      const avatar = screen.getByTestId("avatar");
      expect(avatar).toHaveClass("h-8", "w-8", "shrink-0");

      const avatarImage = screen.getByTestId("avatar-image");
      expect(avatarImage).toHaveClass("aspect-square", "object-cover");
    });

    it("should show correct avatar fallback with proper styling", async () => {
      const user = userEvent.setup();
      const userWithoutPicture = {
        ...mockUser,
        picture: null,
      };
      render(<AvatarCard {...defaultProps} user={userWithoutPicture} />);

      await user.click(screen.getByTestId("avatar-trigger"));

      const avatarFallback = screen.getByTestId("avatar-fallback");
      expect(avatarFallback).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });
});
