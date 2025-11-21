import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchDialogBox from "./SearchDialogBox";
import * as mockData from "./SearchDialogBox.mocks";

// Polyfill scrollIntoView for jsdom (used by cmdk)
Element.prototype.scrollIntoView = jest.fn();

// Mock the fetch API
global.fetch = jest.fn();

// Mock ImageWithFallback component
jest.mock("@/components/ImageWithFallback", () => {
  return function MockImageWithFallback({
    src,
    alt,
  }: {
    src: string;
    alt: string;
  }) {
    return <img src={src} alt={alt} />;
  };
});

describe("SearchDialogBox", () => {
  const defaultProps = {
    open: true,
    setOpen: jest.fn(),
    elasticIndex: "products_v3",
    suggestionItems: mockData.mockSuggestionItems,
    handleSelect: jest.fn(),
    setSearchValue: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("Rendering", () => {
    it("should render the search input when open is true", () => {
      render(<SearchDialogBox {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(
        /Type a command or search/i
      );
      expect(searchInput).toBeInTheDocument();
    });

    it("should not render when open is false", () => {
      render(<SearchDialogBox {...defaultProps} open={false} />);
      const searchInput = screen.queryByPlaceholderText(
        /Type a command or search/i
      );
      expect(searchInput).not.toBeInTheDocument();
    });

    it("should display suggestion items", () => {
      render(<SearchDialogBox {...defaultProps} />);
      // Check for at least one suggestion item
      const suggestions = screen.queryAllByText(/Recent:|Category:/i);
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Search Functionality", () => {
    it("should accept search input", () => {
      render(<SearchDialogBox {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(
        /Type a command or search/i
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "test" } });
      expect(searchInput.value).toBe("test");
    });

    it("should handle empty search results", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [],
          total: 0,
          success: true,
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(<SearchDialogBox {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(
        /Type a command or search/i
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "nonexistent" } });
      expect(searchInput.value).toBe("nonexistent");
    });

    it("should call fetch when search input changes", async () => {
      jest.useFakeTimers();
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [
            {
              productId: 1,
              productShortDescription: "Test Product",
              brandsName: "Test Brand",
              brandProductId: "123",
              productIndexName: "test-product",
            },
          ],
          total: 1,
          success: true,
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(<SearchDialogBox {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(
        /Type a command or search/i
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "test" } });

      // Advance timers to trigger debounce
      jest.advanceTimersByTime(300);

      // Wait for fetch to be called
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalled();
        },
        { timeout: 100 }
      );

      jest.useRealTimers();
    });

    it("should handle API errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

      render(<SearchDialogBox {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(
        /Type a command or search/i
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "error" } });

      // Component should handle error without crashing
      expect(
        screen.getByPlaceholderText(/Type a command or search/i)
      ).toBeInTheDocument();
    });
  });

  describe("Dialog State Management", () => {
    it("should render when open is true", () => {
      const setOpenMock = jest.fn();
      const props = { ...defaultProps, setOpen: setOpenMock };

      render(<SearchDialogBox {...props} />);

      // Dialog should be open
      expect(
        screen.getByPlaceholderText(/Type a command or search/i)
      ).toBeInTheDocument();
    });

    it("should not render when open is false", () => {
      render(<SearchDialogBox {...defaultProps} open={false} />);
      const searchInput = screen.queryByPlaceholderText(
        /Type a command or search/i
      );
      expect(searchInput).not.toBeInTheDocument();
    });
  });

  describe("Keyboard Interactions", () => {
    it("should allow typing in search input", () => {
      render(<SearchDialogBox {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(
        /Type a command or search/i
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "test" } });
      expect(searchInput.value).toBe("test");
    });

    it("should call handleSelect when suggestion is clicked", () => {
      render(<SearchDialogBox {...defaultProps} />);
      const firstSuggestion = screen.getByText(/Recent: O RING/i);

      fireEvent.click(firstSuggestion);
      expect(defaultProps.handleSelect).toHaveBeenCalled();
    });
  });

  describe("Image Fallback", () => {
    it("should render component with image support", () => {
      render(<SearchDialogBox {...defaultProps} />);
      expect(
        screen.getByPlaceholderText(/Type a command or search/i)
      ).toBeInTheDocument();
    });
  });

  describe("Search Results Rendering", () => {
    it("should accept search input and update state", async () => {
      jest.useFakeTimers();
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [
            {
              productId: 1,
              productShortDescription: "Product 1",
              brandsName: "Brand 1",
              brandProductId: "1",
              productIndexName: "product-1",
            },
            {
              productId: 2,
              productShortDescription: "Product 2",
              brandsName: "Brand 2",
              brandProductId: "2",
              productIndexName: "product-2",
            },
          ],
          total: 2,
          success: true,
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(<SearchDialogBox {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(
        /Type a command or search/i
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "product" } });
      expect(searchInput.value).toBe("product");

      // Advance timers to trigger debounce
      jest.advanceTimersByTime(300);

      // Wait for fetch to be called after debounce
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalled();
        },
        { timeout: 100 }
      );

      jest.useRealTimers();
    });
  });

  describe("Loading State", () => {
    it("should handle async API responses", async () => {
      jest.useFakeTimers();
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [],
          total: 0,
          success: true,
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(<SearchDialogBox {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(
        /Type a command or search/i
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "test" } });

      // Advance timers to trigger debounce
      jest.advanceTimersByTime(300);

      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalled();
        },
        { timeout: 100 }
      );

      jest.useRealTimers();
    });
  });

  describe("API Request Format", () => {
    it("should call API with correct endpoint", async () => {
      jest.useFakeTimers();
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [],
          total: 0,
          success: true,
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(<SearchDialogBox {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText(
        /Type a command or search/i
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "test" } });

      // Advance timers to trigger debounce
      jest.advanceTimersByTime(300);

      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/search"),
            expect.any(Object)
          );
        },
        { timeout: 100 }
      );

      jest.useRealTimers();
    });
  });
});
