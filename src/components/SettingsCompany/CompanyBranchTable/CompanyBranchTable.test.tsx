/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

// Mock UI primitives
jest.mock("@/components/custom/SectionCard", () => {
  const React = require("react");
  const SectionCard = (props: any) =>
    React.createElement(
      "section",
      null,
      React.createElement("h1", null, props.title),
      props.headerActions,
      props.children
    );
  SectionCard.displayName = "SectionCard";
  return SectionCard;
});

jest.mock("@/components/ui/button", () => {
  const React = require("react");
  return {
    Button: (props: any) =>
      React.createElement("button", props, props.children),
  };
});

jest.mock("@/components/ui/input", () => {
  const React = require("react");
  return { Input: (props: any) => React.createElement("input", props) };
});

jest.mock("@/components/ui/badge", () => {
  const React = require("react");
  return {
    Badge: (props: any) => React.createElement("span", props, props.children),
  };
});

// Mock Toaster so it doesn't render heavy UI
jest.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));

// Mock CompanyService
const mockGetAll = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/lib/api/services/CompanyService", () => ({
  getAllBranchesWithPagination: (...args: any[]) => mockGetAll(...args),
  deleteRecordBranchesWithPagination: (...args: any[]) => mockDelete(...args),
}));

// Mock DataTable to render simple rows and invoke renderRowActions
jest.mock("@/components/Global/DataTable", () => {
  const React = require("react");
  return {
    DataTable: ({ data, renderRowActions, onRowClick }: any) =>
      React.createElement(
        "table",
        null,
        data?.map((row: any, idx: number) =>
          React.createElement(
            "tbody",
            { key: idx },
            React.createElement(
              "tr",
              { onClick: () => onRowClick && onRowClick({ original: row }) },
              React.createElement("td", null, row.name || row.branchName || "-")
            ),
            React.createElement(
              "tr",
              null,
              React.createElement(
                "td",
                null,
                renderRowActions && renderRowActions({ original: row })
              )
            )
          )
        )
      ),
  };
});

// Mock icons (not used directly in assertions)
jest.mock("lucide-react", () => ({
  Search: () => null,
  Plus: () => null,
  Loader2: () => null,
  Trash2: () => null,
}));

// Mock CompanyDialogBox to expose props so tests can assert open/mode/initialData
const dialogProps: any = {};
jest.mock("../DialogBox/AddressDialogBox", () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require("react");
    // save latest props for assertions
    Object.assign(dialogProps, props);
    return React.createElement(
      "div",
      { "data-testid": "company-dialog" },
      props.open ? "OPEN" : "CLOSED"
    );
  },
}));

import CompanyBranchTable from "./CompanyBranchTable";
import { sampleBranches } from "./CompanyBranchTable.mocks";

describe("CompanyBranchTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // default mock get returns sample data structure
    mockGetAll.mockResolvedValue({
      data: {
        branchResponse: sampleBranches,
        totalCount: sampleBranches.length,
      },
    });
    mockDelete.mockResolvedValue({ success: true });
    // reset dialog props
    for (const k of Object.keys(dialogProps)) delete dialogProps[k];
  });

  it("renders and displays branches", async () => {
    render(React.createElement(CompanyBranchTable));

    // wait for async load to complete and rows to render
    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());

    // sample branch name should be visible
    expect(screen.getByText(sampleBranches[0]?.name || "")).toBeInTheDocument();
  });

  it("opens create dialog when Add Branch clicked", async () => {
    render(React.createElement(CompanyBranchTable));
    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());

    const addBtn = screen.getByRole("button", { name: /addBranch/i });
    fireEvent.click(addBtn);

    // CompanyDialogBox should have been passed open true and mode 'create'
    expect(dialogProps?.open).toBe(true);
    expect(dialogProps?.mode).toBe("create");
  });

  it("opens edit dialog when row clicked", async () => {
    render(React.createElement(CompanyBranchTable));
    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());

    // clicking the first row (DataTable's onRowClick will call handleEdit)
    const rowCell = screen.getByText(sampleBranches[0]?.name || "");
    fireEvent.click(rowCell);

    expect(dialogProps?.open).toBe(true);
    expect(dialogProps?.mode).toBe("edit");
    // initialData should be set when editing
    expect(dialogProps?.initialData).toBeDefined();
  });

  it("calls delete API when delete action clicked", async () => {
    render(React.createElement(CompanyBranchTable));
    await waitFor(() => expect(mockGetAll).toHaveBeenCalled());

    // The mocked DataTable renders the renderRowActions output which includes a button; find and click it
    const buttons = screen.getAllByRole("button");
    // prefer a button that contains an accessible name 'deleteBranch' (sr-only)
    const btnToClick =
      buttons.find(
        b => b.querySelector("span")?.textContent === "deleteBranch"
      ) || buttons[1];
    // assert btnToClick exists
    const btn = btnToClick!;
    fireEvent.click(btn);

    await waitFor(() => expect(mockDelete).toHaveBeenCalled());
  });
});
