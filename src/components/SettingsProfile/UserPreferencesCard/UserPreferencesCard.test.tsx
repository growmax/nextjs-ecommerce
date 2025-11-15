/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

// Mock SectionCard
jest.mock("@/components/custom/SectionCard", () => {
  const React = require("react");
  const SectionCard = (props: any) =>
    React.createElement(
      "section",
      null,
      React.createElement("h1", null, props.title),
      props.children
    );
  SectionCard.displayName = "SectionCard";
  return SectionCard;
});

// Mock AutoCompleteField
jest.mock("@/components/forms/AutoCompleteField/AutoCompleteField", () => {
  const React = require("react");
  return {
    AutoCompleteField: ({ label, value, onChange, disabled }: any) =>
      React.createElement(
        "div",
        null,
        React.createElement("label", null, label),
        React.createElement("input", {
          "aria-label": label,
          value: value ?? "",
          onChange: (e: any) => onChange && onChange(e.target.value),
          disabled,
        })
      ),
  };
});

// Mock skeleton
jest.mock("@/components/ui/skeleton", () => {
  const React = require("react");
  return {
    Skeleton: () =>
      React.createElement("div", { "data-testid": "skeleton" }, null),
  };
});

// Mock icons
jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    Globe: () => React.createElement("svg", { "data-testid": "icon-globe" }),
    Calendar: () =>
      React.createElement("svg", { "data-testid": "icon-calendar" }),
    Clock: () => React.createElement("svg", { "data-testid": "icon-clock" }),
  };
});

import { UserPreferencesCard } from "./UserPreferencesCard";
import { defaultProps, samplePreferences } from "./UserPreferencesCard.mocks";

describe("UserPreferencesCard", () => {
  it("renders skeleton when dataLoading", () => {
    render(
      React.createElement(UserPreferencesCard, {
        ...defaultProps,
        dataLoading: true,
      })
    );
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    expect(screen.getByText("User Preferences")).toBeInTheDocument();
  });

  it("renders fields and calls onChange when values change", () => {
    const onChange = jest.fn();
    render(
      React.createElement(UserPreferencesCard, {
        ...defaultProps,
        preferences: samplePreferences,
        onChange,
      })
    );

    // Time Zone
    const tzInput = screen.getByLabelText("Time Zone") as HTMLInputElement;
    expect(tzInput.value).toBe(samplePreferences.timeZone);
    fireEvent.change(tzInput, { target: { value: "Asia/Kolkata" } });
    expect(onChange).toHaveBeenCalledWith("timeZone", "Asia/Kolkata");

    // Date Format
    const dfInput = screen.getByLabelText(
      "Date Display Format"
    ) as HTMLInputElement;
    expect(dfInput.value).toBe(samplePreferences.dateFormat);
    fireEvent.change(dfInput, { target: { value: "DD-MM-YYYY" } });
    expect(onChange).toHaveBeenCalledWith("dateFormat", "DD-MM-YYYY");

    // Time Format
    const tfInput = screen.getByLabelText("Time Format") as HTMLInputElement;
    expect(tfInput.value).toBe(samplePreferences.timeFormat);
    fireEvent.change(tfInput, { target: { value: "24hr" } });
    expect(onChange).toHaveBeenCalledWith("timeFormat", "24hr");

    // Preview header and icons present
    expect(screen.getByText("Preview")).toBeInTheDocument();
    // globe icon appears multiple times (header + timezone line)
    expect(screen.getAllByTestId("icon-globe").length).toBeGreaterThan(0);
    expect(screen.getByTestId("icon-calendar")).toBeInTheDocument();
    expect(screen.getByTestId("icon-clock")).toBeInTheDocument();
  });

  it("disables inputs when isLoading is true", () => {
    render(
      React.createElement(UserPreferencesCard, {
        ...defaultProps,
        preferences: samplePreferences,
        isLoading: true,
      })
    );

    expect(screen.getByLabelText("Time Zone")).toBeDisabled();
    expect(screen.getByLabelText("Date Display Format")).toBeDisabled();
    expect(screen.getByLabelText("Time Format")).toBeDisabled();
  });
});
