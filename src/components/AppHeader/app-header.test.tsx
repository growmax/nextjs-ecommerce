import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next-intl BEFORE importing AppHeader to avoid ESM parsing issues
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
    number: (value: number) => value.toString(),
    relativeTime: (date: Date) => date.toISOString(),
  }),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock i18n config to avoid ESM parsing issues
jest.mock("@/i18n/config", () => ({
  getTranslations: jest.fn(),
  getLocale: jest.fn(() => "en"),
  getFormatter: jest.fn(),
}));

// Mock LanguageSwitcher to avoid next-intl dependency chain
jest.mock("@/components/LanguageSwitcher/LanguageSwitcher", () => ({
  LanguageSwitcher: () => (
    <div data-testid="language-switcher">Language Switcher</div>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import { AppHeader } from "./app-header";

jest.mock("@/components/ui/command", () => ({
  CommandDialog: ({ children, open }: any) =>
    open ? <div>{children}</div> : null,
  CommandInput: ({ onValueChange }: any) => (
    <input
      data-testid="command-input"
      onChange={e => onValueChange(e.target.value)}
    />
  ),
  CommandList: ({ children }: any) => <div>{children}</div>,
  CommandEmpty: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandItem: ({ children, onSelect }: any) => (
    <div data-testid="command-item" onClick={() => onSelect()}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: (props: any) => (
    <button aria-label="sidebar-trigger" {...props} />
  ),
  useSidebar: () => ({ state: "expanded" }),
}));

jest.mock("@/hooks/Profile/useUserProfile", () => ({
  __esModule: true,
  default: () => ({ userProfile: { displayName: "Test User", picture: "" } }),
}));

jest.mock("@/hooks/Auth/useLogout", () => ({
  __esModule: true,
  default: () => ({ isLoggingOut: false, handleLogout: jest.fn() }),
}));

jest.mock("@/contexts/UserDetailsContext", () => ({
  useUserDetails: () => ({ isAuthenticated: true }),
}));

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ cartCount: 2 }),
}));

jest.mock(
  "@/lib/api/services/ElacticQueryService/query-builder/query-builder",
  () => ({
    buildProductSearchQuery: jest
      .fn()
      .mockReturnValue({ query: { match: { name: "laptop" } } }),
  })
);

describe("AppHeader", () => {
  it("renders and opens the command dialog on Ctrl/Cmd+K shortcut", () => {
    render(<AppHeader />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByTestId("command-input")).toBeInTheDocument();
  });

  it("closes the dialog when selecting a suggestion", () => {
    render(<AppHeader />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    const item = screen.getAllByTestId("command-item")[0]!;
    fireEvent.click(item);

    expect(screen.queryByTestId("command-input")).not.toBeInTheDocument();
  });
});
