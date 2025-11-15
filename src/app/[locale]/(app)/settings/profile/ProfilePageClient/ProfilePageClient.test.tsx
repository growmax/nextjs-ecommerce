/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import ProfilePageClient from "./ProfilePageClient";
import createUseProfileDataMock from "./ProfilePageClient.mocks";

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

describe("ProfilePageClient", () => {
  test("renders header and child cards", () => {
    render(React.createElement(ProfilePageClient));
    expect(screen.getByText("Profile Settings")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card")).toBeInTheDocument();
    expect(screen.getByTestId("preferences-card")).toBeInTheDocument();
  });

  test("shows save toolbar after profile change and triggers save on click", async () => {
    // Replace the mocked hook with a controllable mock that exposes spies
    const mock = createUseProfileDataMock();
    jest
      .spyOn(require("@/hooks/Profile/useProfileData"), "useProfileData")
      .mockImplementation(() => mock as any);

    render(React.createElement(ProfilePageClient));

    // Initially toolbar hidden
    expect(screen.getByTestId("save-toolbar")).toHaveAttribute(
      "data-show",
      "false"
    );

    // Simulate a profile change via the mocked ProfileCard
    fireEvent.click(screen.getByTestId("simulate-profile-change"));

    // Toolbar should now be shown
    expect(screen.getByTestId("save-toolbar")).toHaveAttribute(
      "data-show",
      "true"
    );

    // Click save
    fireEvent.click(screen.getByTestId("save-btn"));

    await waitFor(() => expect(mock.saveProfile).toHaveBeenCalled());
  });

  test("opens password dialog when header action is clicked", async () => {
    // Use mock that will render headerActions (ProfileCard passes the Button)
    const mock = createUseProfileDataMock();
    jest
      .spyOn(require("@/hooks/Profile/useProfileData"), "useProfileData")
      .mockImplementation(() => mock as any);

    render(React.createElement(ProfilePageClient));

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
