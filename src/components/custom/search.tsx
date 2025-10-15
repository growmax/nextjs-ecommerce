"use client";

import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Initial search value */
  defaultValue?: string;
  /** Custom CSS classes */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Search input variant */
  variant?: "default" | "filled" | "outlined";
  /** Minimum characters required before search */
  minLength?: number;
  /** Maximum characters allowed */
  maxLength?: number;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Show clear button */
  showClear?: boolean;
  /** Custom search icon */
  searchIcon?: React.ReactNode;
  /** Custom clear icon */
  clearIcon?: React.ReactNode;
  /** Search function - if provided, overrides default router navigation */
  onSearch?: (query: string) => void | Promise<void>;
  /** Change handler for controlled usage */
  onChange?: (value: string) => void;
  /** Custom search route - defaults to '/search' */
  searchRoute?: string;
  /** Additional query parameters */
  searchParams?: Record<string, string>;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Form props */
  formProps?: React.FormHTMLAttributes<HTMLFormElement>;
  /** Input props */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  (
    {
      placeholder,
      defaultValue = "",
      className,
      size = "md",
      variant = "default",
      minLength = 1,
      maxLength = 100,
      loading = false,
      disabled = false,
      showClear = true,
      searchIcon,
      clearIcon,
      onSearch,
      onChange,
      searchRoute = "/search",
      searchParams = {},
      autoFocus = false,
      formProps,
      inputProps,
    },
    ref
  ) => {
    const t = useTranslations();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(defaultValue);
    const [isSearching, setIsSearching] = useState(false);

    // Size variants - mobile-first responsive
    const sizeClasses = useMemo(() => {
      const sizes = {
        sm: {
          container: "w-full",
          input: "h-8 text-sm pr-8 px-3",
          button: "h-6 w-6 right-1",
          icon: "h-3.5 w-3.5",
        },
        md: {
          container: "w-full",
          input: "h-9 sm:h-10 text-sm sm:text-base pr-9 sm:pr-10 px-3 sm:px-4",
          button: "h-7 w-7 right-1.5",
          icon: "h-4 w-4",
        },
        lg: {
          container: "w-full",
          input:
            "h-10 sm:h-11 lg:h-12 text-base lg:text-lg pr-10 sm:pr-12 px-4",
          button: "h-8 w-8 right-2",
          icon: "h-4 w-4 sm:h-5 sm:w-5",
        },
      };
      return sizes[size];
    }, [size]);

    // Variant classes
    const variantClasses = useMemo(() => {
      const variants = {
        default: "",
        filled: "bg-muted/50 border-transparent",
        outlined: "border-2 border-border bg-transparent",
      };
      return variants[variant];
    }, [variant]);

    // Handle search with validation
    const handleSearch = useCallback(
      async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const trimmedQuery = searchQuery.trim();

        // Validation
        if (trimmedQuery.length === 0 || trimmedQuery.length < minLength) {
          return;
        }

        if (trimmedQuery.length > maxLength) {
          return;
        }

        setIsSearching(true);

        try {
          if (onSearch) {
            await onSearch(trimmedQuery);
          } else {
            // Build search URL with parameters
            const params = new URLSearchParams({
              query: trimmedQuery,
              ...searchParams,
            });
            router.push(`${searchRoute}?${params.toString()}`);
          }
        } catch {
          // Handle search error silently or use proper error handling
        } finally {
          setIsSearching(false);
        }
      },
      [
        searchQuery,
        minLength,
        maxLength,
        onSearch,
        router,
        searchRoute,
        searchParams,
      ]
    );

    // Handle input change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onChange?.(value);
      },
      [onChange]
    );

    // Handle clear
    const handleClear = useCallback(() => {
      setSearchQuery("");
      onChange?.("");
    }, [onChange]);

    // Handle key press
    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          handleSearch();
        }
        if (e.key === "Escape") {
          handleClear();
        }
      },
      [handleSearch, handleClear]
    );

    const isLoading = loading || isSearching;
    const showClearButton = showClear && searchQuery.length > 0 && !isLoading;
    const hasValue = searchQuery.length > 0;

    return (
      <form
        onSubmit={handleSearch}
        className={cn("relative", sizeClasses.container, className)}
        {...formProps}
      >
        <Input
          ref={ref}
          type="text"
          placeholder={placeholder || t("search.placeholder")}
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          disabled={disabled || isLoading}
          autoFocus={autoFocus}
          maxLength={maxLength}
          className={cn(
            sizeClasses.input,
            variantClasses,
            showClearButton && "pr-14 sm:pr-16",
            "transition-all duration-200 w-full",
            hasValue && "ring-1 ring-primary/20",
            "focus:ring-2 focus:ring-primary/30"
          )}
          aria-label={placeholder || t("search.button")}
          {...inputProps}
        />

        {/* Clear Button */}
        {showClearButton && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 p-0 hover:bg-muted",
              sizeClasses.button,
              "right-8"
            )}
            aria-label="Clear search"
          >
            {clearIcon || <X className={sizeClasses.icon} />}
          </Button>
        )}

        {/* Search Button */}
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={
            disabled || isLoading || searchQuery.trim().length < minLength
          }
          className={cn(
            "absolute top-1/2 -translate-y-1/2 p-0",
            sizeClasses.button,
            "hover:bg-primary/10 disabled:opacity-50"
          )}
          aria-label="Search"
        >
          {isLoading ? (
            <Loader2 className={cn(sizeClasses.icon, "animate-spin")} />
          ) : (
            searchIcon || <Search className={sizeClasses.icon} />
          )}
        </Button>
      </form>
    );
  }
);

SearchBox.displayName = "SearchBox";

export default SearchBox;
