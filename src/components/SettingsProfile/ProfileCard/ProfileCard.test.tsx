/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

// Mock SectionCard to expose the title and headerActions areas
jest.mock("@/components/custom/SectionCard", () => {
  const React = require("react");
  const SectionCard = (props: any) =>
    React.createElement(
      "section",
      null,
      React.createElement("h1", null, props.title),
      props.headerActions
        ? React.createElement(
            "div",
            { "data-testid": "header-actions" },
            props.headerActions
          )
        : null,
      props.children
    );
  SectionCard.displayName = "SectionCard";
  return SectionCard;
});

// Mock form primitives used inside ProfileCard
jest.mock("@/components/forms/FormField/FormField", () => {
  const React = require("react");
  return {
    FormField: ({ children, label }: any) =>
      React.createElement(
        "div",
        null,
        React.createElement("label", null, label),
        children
      ),
  };
});

jest.mock("@/components/forms/ImageUpload/ImageUpload", () => {
  const React = require("react");
  return {
    ImageUpload: ({ currentImage, onImageChange, alt }: any) =>
      React.createElement(
        "div",
        null,
        // avoid rendering empty src which triggers a React console warning in tests
        React.createElement("img", { src: currentImage ?? null, alt }),
        React.createElement(
          "button",
          {
            "data-testid": "image-upload-btn",
            onClick: () => onImageChange && onImageChange("new-image.png"),
          },
          "Upload"
        )
      ),
  };
});

jest.mock("@/components/forms/PhoneInput/PhoneInput", () => {
  const React = require("react");
  return {
    PhoneInput: ({
      label,
      value,
      onChange,
      onVerify,
      verified,
      disabled,
    }: any) =>
      React.createElement(
        "div",
        null,
        React.createElement("label", null, label),
        React.createElement("input", {
          "aria-label": label,
          value: value ?? "",
          onChange: (e: any) => onChange && onChange(e.target.value),
          disabled,
        }),
        onVerify
          ? React.createElement(
              "button",
              {
                "data-testid": "verify-btn",
                onClick: () => onVerify && onVerify(value),
              },
              verified ? "Verified" : "Verify"
            )
          : null
      ),
  };
});

jest.mock("@/components/ui/input", () => {
  const React = require("react");
  return { Input: (props: any) => React.createElement("input", props) };
});

jest.mock("@/components/ui/skeleton", () => {
  const React = require("react");
  return {
    Skeleton: () =>
      React.createElement("div", { "data-testid": "skeleton" }, null),
  };
});

import { ProfileCard } from "./ProfileCard";
import { defaultProps, sampleProfile } from "./ProfileCard.mocks";

describe("ProfileCard", () => {
  it("renders skeleton when loading or profile missing", () => {
    render(
      React.createElement(ProfileCard, {
        ...defaultProps,
        profile: null,
        dataLoading: true,
      })
    );

    expect(screen.getByText("profile Information")).toBeInTheDocument();
    // skeleton placeholder present
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("renders profile fields and responds to interactions", () => {
    const onChange = jest.fn();
    const onImageChange = jest.fn();
    const onVerifyPhone = jest.fn();

    render(
      React.createElement(ProfileCard, {
        ...defaultProps,
        profile: sampleProfile,
        onChange,
        onImageChange,
        onVerifyPhone,
      })
    );

    // Title
    expect(screen.getByText("profile Information")).toBeInTheDocument();

    // Name input should display current value
    const nameInput = screen.getByDisplayValue(
      sampleProfile.name
    ) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();

    // Change name
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    expect(onChange).toHaveBeenCalledWith("name", "New Name");

    // Email is read-only input
    expect(screen.getByDisplayValue(sampleProfile.email)).toBeDisabled();

    // Image upload button triggers onImageChange
    const uploadBtn = screen.getByTestId("image-upload-btn");
    fireEvent.click(uploadBtn);
    expect(onImageChange).toHaveBeenCalledWith("new-image.png");

    // Phone verify button available and clicking invokes onVerifyPhone
    const verifyBtns = screen.getAllByTestId("verify-btn");
    const firstVerifyBtn = verifyBtns[0]!;
    fireEvent.click(firstVerifyBtn);
    expect(onVerifyPhone).toHaveBeenCalledWith(sampleProfile.phone);
  });
});
