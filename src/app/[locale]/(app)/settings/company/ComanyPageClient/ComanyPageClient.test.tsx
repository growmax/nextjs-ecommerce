/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";

import ComanyPageClient from "./ComanyPageClient";

// Mock HeaderBar (use require inside factory to avoid referencing out-of-scope React)
jest.mock("@/components/Global/HeaderBar/HeaderBar", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ title }: any) =>
      React.createElement("header", { "data-testid": "header" }, title),
  };
});

// Mock CompanyDetail
jest.mock(
  "../../../../../../components/SettingsCompany/CompanyDetail/CompanyDetail",
  () => {
    const React = require("react");
    return {
      __esModule: true,
      default: () =>
        React.createElement(
          "div",
          { "data-testid": "company-detail" },
          "detail"
        ),
    };
  }
);

// Mock CompanyBranchTable
jest.mock(
  "../../../../../../components/SettingsCompany/CompanyBranchTable/CompanyBranchTable",
  () => {
    const React = require("react");
    return {
      __esModule: true,
      default: () =>
        React.createElement(
          "div",
          { "data-testid": "company-branch-table" },
          "branches"
        ),
    };
  }
);

describe("ComanyPageClient", () => {
  test("renders header and composed company components", () => {
    render(React.createElement(ComanyPageClient));

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Company Settings")).toBeInTheDocument();

    // Child components should be present (mocked)
    expect(screen.getByTestId("company-detail")).toBeInTheDocument();
    expect(screen.getByTestId("company-branch-table")).toBeInTheDocument();
  });
});
