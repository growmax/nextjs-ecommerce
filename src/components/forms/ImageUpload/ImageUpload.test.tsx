/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { ImageUpload } from "./ImageUpload";
import { sampleImageUrl } from "./ImageUpload.mocks.js";

// Mock Button and Avatar primitives
jest.mock("@/components/ui/button", () => {
  const React = require("react");
  return {
    Button: ({ children, ...props }: any) =>
      React.createElement("button", { ...props }, children),
  };
});

jest.mock("@/components/ui/avatar", () => {
  const React = require("react");
  return {
    Avatar: ({ children, className }: any) =>
      React.createElement(
        "div",
        { "data-testid": "avatar", className },
        children
      ),
    AvatarImage: ({ src, alt }: any) =>
      React.createElement("img", { "data-testid": "avatar-image", src, alt }),
    AvatarFallback: ({ children }: any) =>
      React.createElement(
        "div",
        { "data-testid": "avatar-fallback" },
        children
      ),
  };
});

// Mock lucide icons
jest.mock("lucide-react", () => {
  const React = require("react");
  return {
    Plus: () =>
      React.createElement("span", { "data-testid": "icon-plus" }, "+"),
    Upload: () =>
      React.createElement("span", { "data-testid": "icon-upload" }, "U"),
  };
});

// Mock next/image to render a plain img
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require("react");
    // render a normal img so tests can query src
    return React.createElement("img", {
      "data-testid": "next-image",
      ...props,
    });
  },
}));

describe("ImageUpload component", () => {
  beforeEach(() => {
    // ensure consistent createObjectURL for tests
    global.URL.createObjectURL = jest.fn(() => "blob:mock");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders placeholder icon and upload hint when no currentImage (square layout)", () => {
    const { container } = render(<ImageUpload onImageChange={jest.fn()} />);

    // In square layout we render the plus icon inside the drop area and an input
    expect(screen.getByTestId("icon-plus")).toBeTruthy();
    const input = container.querySelector("#image-upload");
    expect(input).toBeTruthy();
    // Hint text describing allowed formats is shown
    expect(screen.getByText(/JPG, PNG up to/)).toBeTruthy();
  });

  it("calls onImageChange with object URL when a file is selected", () => {
    const onImageChange = jest.fn();
    const { container } = render(<ImageUpload onImageChange={onImageChange} />);

    const input = container.querySelector("#image-upload") as HTMLInputElement;
    // File constructor's FilePropertyBag does not include size in typings; create a Blob and set a name
    const file = new File(["abc"], "test.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      (global.URL.createObjectURL as jest.Mock).mock.calls.length
    ).toBeGreaterThan(0);
    expect(onImageChange).toHaveBeenCalledWith("blob:mock");
  });

  it("renders provided currentImage via next/image mock", () => {
    render(
      <ImageUpload currentImage={sampleImageUrl} onImageChange={jest.fn()} />
    );

    const img = screen.getByTestId("next-image") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain(sampleImageUrl);
  });

  it("shows error when file exceeds maxSizeMB", () => {
    const onImageChange = jest.fn();
    const { container } = render(
      <ImageUpload onImageChange={onImageChange} maxSizeMB={0.0001} />
    );
    const input = container.querySelector("#image-upload") as HTMLInputElement;
    // Create a large blob to simulate big file; size property is not part of constructor typing
    const bigBlob = new Blob([new ArrayBuffer(1024 * 1024 * 2)], {
      type: "image/png",
    });
    const bigFile = new File([bigBlob], "big.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [bigFile] } });

    expect(screen.getByText(/File size must be less than/)).toBeTruthy();
    expect(onImageChange).not.toHaveBeenCalled();
  });

  it("disables input when disabled prop is true and hides upload button for square layout", () => {
    const { container } = render(
      <ImageUpload onImageChange={jest.fn()} disabled={true} />
    );
    const input = container.querySelector("#image-upload") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    // In square layout there's no 'Upload Photo' button; ensure it's not present
    expect(screen.queryByText(/Upload Photo/i)).toBeNull();
    // the inner drop area should indicate disabled state via class (opacity-50)
    const inner = container.querySelector("label > div");
    expect(inner).toBeTruthy();
    expect((inner as HTMLElement).className).toContain("opacity-50");
  });
});
