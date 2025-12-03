/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";

import ProfilePageClient from "./ProfilePageClient";
import createUseProfileDataMock from "./ProfilePageClient.mocks";
import { UserDetailsProvider } from "@/contexts/UserDetailsContext";
import { TenantProvider } from "@/contexts/TenantContext";

// Mock window.matchMedia for Sonner
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock AuthStorage for UserDetailsContext
jest.mock("@/lib/auth", () => ({
  AuthStorage: {
    isAuthenticated: jest.fn(() => false),
    getAccessToken: jest.fn(() => null),
    clearAuth: jest.fn(),
  },
}));

// Mock the hook used by the component by requiring the mock inside the factory.
jest.mock("@/hooks/Profile/useProfileData", () => {
  const m = require("./ProfilePageClient.mocks");
  return { useProfileData: () => m.default() };
});

// Child component mocks: require React inside factories to avoid out-of-scope variable access
jest.mock("@/components/Global/HeaderBar/HeaderBar", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ title }: any) => React.createElement("header", null, title),
  };
});

jest.mock("@/components/custom/save-cancel-toolbar", () => {
  const React = require("react");
  return {
    SaveCancelToolbar: ({ show, onSave, onCancel }: any) =>
      React.createElement(
        "div",
        { "data-testid": "save-toolbar", "data-show": show ? "true" : "false" },
        React.createElement(
          "button",
          { "data-testid": "save-btn", onClick: onSave },
          "Save"
        ),
        React.createElement(
          "button",
          { "data-testid": "cancel-btn", onClick: onCancel },
          "Cancel"
        )
      ),
  };
});

jest.mock("@/components/ui/button", () => {
  const React = require("react");
  return {
    Button: (props: any) =>
      React.createElement("button", { ...props }, props.children),
  };
});

jest.mock("@/components/SettingsProfile/ProfileCard/ProfileCard", () => {
  const React = require("react");
  return {
    ProfileCard: (props: any) =>
      React.createElement(
        "div",
        { "data-testid": "profile-card" },
        props.headerActions,
        React.createElement(
          "button",
          {
            "data-testid": "simulate-profile-change",
            onClick: () => props.onChange && props.onChange("name", "New Name"),
          },
          "change"
        )
      ),
  };
});

jest.mock(
  "@/components/SettingsProfile/UserPreferencesCard/UserPreferencesCard",
  () => {
    const React = require("react");
    return {
      UserPreferencesCard: (props: any) =>
        React.createElement(
          "div",
          { "data-testid": "preferences-card" },
          React.createElement(
            "button",
            {
              "data-testid": "simulate-pref-change",
              onClick: () =>
                props.onChange && props.onChange("timeZone", "UTC"),
            },
            "pref-change"
          )
        ),
    };
  }
);

jest.mock("@/components/SettingsProfile/OTPDialog/OTPDialog", () => {
  const React = require("react");
  return {
    OTPDialog: ({ open }: any) =>
      React.createElement("div", {
        "data-testid": "otp-dialog",
        "data-open": open ? "true" : "false",
      }),
  };
});

jest.mock(
  "@/components/SettingsProfile/PasswordChangeDialog/PasswordChangeDialog",
  () => {
    const React = require("react");
    return {
      PasswordChangeDialog: ({ open }: any) =>
        React.createElement("div", {
          "data-testid": "password-dialog",
          "data-open": open ? "true" : "false",
        }),
    };
  }
);

jest.mock("@/components/ui/sonner", () => {
  return {
    Toaster: () => null,
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    },
  };
});

// Mock toast from sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock CompanyService
const mockUpdateProfileFn = jest.fn().mockResolvedValue({ success: true });
const mockSaveUserPreferencesFn = jest
  .fn()
  .mockResolvedValue({ success: true });

jest.mock("@/lib/api", () => ({
  CompanyService: {
    get updateProfile() {
      return mockUpdateProfileFn;
    },
    get saveUserPreferences() {
      return mockSaveUserPreferencesFn;
    },
  },
  AuthService: {},
}));

// Mock useCurrentUser
jest.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    user: {
      userId: 1,
      defaultCountryCallingCode: "+1",
      defaultCountryCodeIso: "US",
    },
  }),
}));

// Mock AuthStorage
jest.mock("@/lib/auth", () => ({
  AuthStorage: {
    getAccessToken: jest.fn().mockReturnValue("mock-token"),
  },
}));

// Mock JWTService
const mockDecodeToken = jest.fn(() => ({ sub: "test-user-id" }));
const mockJWTInstance = {
  decodeToken: mockDecodeToken,
};
const mockGetInstance = jest.fn(() => mockJWTInstance);

jest.mock("@/lib/services/JWTService", () => ({
  JWTService: {
    getInstance: () => {
      return mockGetInstance();
    },
  },
}));

// Mock parsePhoneNumberFromString - must be defined before jest.mock
jest.mock("libphonenumber-js", () => {
  const mockParsePhoneNumber = jest.fn((phone: string, _country?: string) => ({
    countryCallingCode: "+1",
    country: "US",
    nationalNumber: phone || "1234567890",
  }));

  return {
    __esModule: true,
    default: mockParsePhoneNumber,
  };
});

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <TenantProvider
      initialData={
        {
          status: "success",
          data: {
            tenant: { tenantCode: "test-tenant", id: 1, name: "Test Tenant" },
            sellerCompanyId: null,
            sellerCurrency: null,
          },
        } as any
      }
    >
      <UserDetailsProvider
        initialAuthState={true}
        initialUserData={
          {
            userId: 1,
            defaultCountryCallingCode: "+1",
            defaultCountryCodeIso: "US",
          } as any
        }
      >
        {component}
      </UserDetailsProvider>
    </TenantProvider>
  );
};

describe("ProfilePageClient", () => {
  beforeEach(() => {
    mockUpdateProfileFn.mockClear();
    mockSaveUserPreferencesFn.mockClear();
    jest.clearAllMocks();
  });

  test("renders header and child cards", () => {
    renderWithProviders(React.createElement(ProfilePageClient));
    expect(screen.getByText("profileSettings")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card")).toBeInTheDocument();
    expect(screen.getByTestId("preferences-card")).toBeInTheDocument();
  });

  test("shows save toolbar after profile change and triggers save on click", async () => {
    // Clear previous mock calls
    mockUpdateProfileFn.mockClear();
    mockDecodeToken.mockClear();
    mockGetInstance.mockClear();

    // Replace the mocked hook with a controllable mock that exposes spies
    const mock = createUseProfileDataMock({
      profileDatas: {
        id: "123",
        email: "jane@example.com",
        phoneNumber: "+11234567890",
      },
    });
    jest
      .spyOn(require("@/hooks/Profile/useProfileData"), "useProfileData")
      .mockImplementation(() => mock as any);

    renderWithProviders(React.createElement(ProfilePageClient));

    // Wait for component to initialize and set sub from JWT token
    // The useEffect should run and decode the token
    await waitFor(
      () => {
        expect(mockGetInstance).toHaveBeenCalled();
        expect(mockDecodeToken).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    // Give a small delay for state updates to propagate
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Initially toolbar hidden
    expect(screen.getByTestId("save-toolbar")).toHaveAttribute(
      "data-show",
      "false"
    );

    // Simulate a profile change via the mocked ProfileCard
    await act(async () => {
      fireEvent.click(screen.getByTestId("simulate-profile-change"));
    });

    // Toolbar should now be shown
    await waitFor(
      () => {
        expect(screen.getByTestId("save-toolbar")).toHaveAttribute(
          "data-show",
          "true"
        );
      },
      { timeout: 3000 }
    );

    // Give a small delay for state updates to propagate
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Click save - the component should now have sub set from JWT token
    await act(async () => {
      fireEvent.click(screen.getByTestId("save-btn"));
    });

    // Wait for CompanyService.updateProfile to be called
    // The component needs sub to be set, which comes from JWTService mock
    // Also needs tenantId, profile, hasChanges, and changedSections to be set
    await waitFor(
      () => {
        expect(mockUpdateProfileFn).toHaveBeenCalled();
        expect(mockUpdateProfileFn).toHaveBeenCalledWith(
          "test-user-id",
          expect.objectContaining({
            tenantId: expect.any(String),
            displayName: expect.any(String),
            email: expect.any(String),
          })
        );
      },
      { timeout: 10000 }
    );
  }, 15000); // Increase test timeout to 15 seconds

  test("opens password dialog when header action is clicked", async () => {
    // Use mock that will render headerActions (ProfileCard passes the Button)
    const mock = createUseProfileDataMock();
    jest
      .spyOn(require("@/hooks/Profile/useProfileData"), "useProfileData")
      .mockImplementation(() => mock as any);

    renderWithProviders(React.createElement(ProfilePageClient));

    // The ProfileCard mock renders headerActions which includes a button with aria-label "Change Password"
    const changePwdButton = screen.getByLabelText("Change Password");
    fireEvent.click(changePwdButton);

    // Password dialog should be open
    expect(screen.getByTestId("password-dialog")).toHaveAttribute(
      "data-open",
      "true"
    );
  });
});
