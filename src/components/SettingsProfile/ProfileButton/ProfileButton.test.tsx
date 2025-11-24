/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

// Mock UI primitives
jest.mock("@/components/ui/button", () => {
  const React = require("react");
  return {
    Button: (props: any) =>
      React.createElement("button", props, props.children),
  };
});

jest.mock("@/components/ui/dropdown-menu", () => {
  const React = require("react");
  return {
    DropdownMenu: ({ children }: any) =>
      React.createElement("div", null, children),
    DropdownMenuTrigger: ({ children }: any) =>
      React.createElement("div", null, children),
    DropdownMenuContent: ({ children }: any) =>
      React.createElement(
        "div",
        { "data-testid": "dropdown-content" },
        children
      ),
  };
});

jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    User: () => React.createElement("svg", { "data-testid": "user-icon" }),
  };
});

// Mock next/dynamic to synchronously return the loaded component so tests can render
jest.mock("next/dynamic", () => (loader: any) => {
  const React = require("react");
  const maybePromise = loader();
  if (maybePromise && typeof maybePromise.then === "function") {
    let Resolved: any = null;
    // resolve immediately (the loader in our component uses Promise.resolve)
    maybePromise.then((m: any) => {
      Resolved = m.default || m;
    });
    const DynamicComponent = (props: any) =>
      Resolved ? React.createElement(Resolved, props) : null;
    DynamicComponent.displayName = "DynamicComponent";
    return DynamicComponent;
  }
  const Comp = maybePromise.default || maybePromise;
  const DynamicComponent = (props: any) => React.createElement(Comp, props);
  DynamicComponent.displayName = "DynamicComponent";
  return DynamicComponent;
});

// Mock the ProfileMenu (child component)
jest.mock("../ProfileMenu/ProfileMenu", () => {
  const React = require("react");
  const ProfileMenu = () =>
    React.createElement("div", { "data-testid": "profile-menu" }, "menu");
  ProfileMenu.displayName = "ProfileMenu";
  return {
    __esModule: true,
    default: ProfileMenu,
  };
});

import ProfileButton from "./ProfileButton";

describe("ProfileButton", () => {
  it("renders trigger button and shows menu on click", () => {
    render(React.createElement(ProfileButton));

    // trigger button should exist (the mocked Button renders a button element)
    const trigger = screen.getByRole("button");
    expect(trigger).toBeInTheDocument();

    // user icon should be present inside the button
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();

    // click the trigger and expect dropdown content and profile menu to appear
    fireEvent.click(trigger);
    expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
    expect(screen.getByTestId("profile-menu")).toBeInTheDocument();
  });
});
