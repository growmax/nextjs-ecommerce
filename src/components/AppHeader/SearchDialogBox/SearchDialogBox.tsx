"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import React, { useEffect, useRef, useState } from "react";

type SuggestionItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
};

type ProductAsset = {
  isDefault: number;
  width: string;
  source: string;
  type: string;
  height: string;
};

type ProductResult = {
  productId: number;
  productShortDescription: string;
  brandProductId: string;
  brandsName: string;
  productIndexName: string;
  productAssetss?: ProductAsset[];
  b2CUnitListPrice?: number | null;
};

type SearchResponse = {
  success: boolean;
  data: ProductResult[];
  total: number;
};

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  elasticIndex?: string;
  suggestionItems: SuggestionItem[];
  handleSelect: (href: string) => void;
  setSearchValue: (v: string) => void;
};

export function SearchDialogBox({
  open,
  setOpen,
  elasticIndex = "",
  suggestionItems,
  handleSelect,
  setSearchValue,
}: Props) {
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Clear state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchResults([]);
      setSearchTerm("");
      setIsLoading(false);
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    }
  }, [open]);

  // Effect: perform search when searchTerm changes (debounced + cancellable)
  useEffect(() => {
    // clear any pending timeout
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // If query is empty, clear results and don't call API
    const term = (searchTerm || "").trim();
    if (!term) {
      // Abort any inflight request
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Debounce the API call
    debounceRef.current = window.setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      (async () => {
        try {
          const url = `/api/search?term=${encodeURIComponent(term)}&index=${encodeURIComponent(
            elasticIndex
          )}`;
          const res = await fetch(url, {
            cache: "no-store",
            credentials: "include",
            signal: controller.signal,
          });
          if (!res.ok) {
            throw new Error(`Search request failed: ${res.status}`);
          }
          const data: SearchResponse = await res.json();
          setSearchResults(data.data || []);
        } catch (err: any) {
          if (err?.name === "AbortError") return;
          setSearchResults([]);
        } finally {
          // only clear loading if this controller is still current
          if (abortRef.current === controller) {
            abortRef.current = null;
            setIsLoading(false);
          }
        }
      })();
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [searchTerm, elasticIndex]);

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="p-0 overflow-hidden z-50 border border-border/40"
        showCloseButton={false}
      >
        <CommandInput
          placeholder="Type a command or search..."
          onValueChange={(value: string) => {
            setSearchTerm(value);
          }}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              "Searching..."
            ) : searchTerm ? (
              "No results found."
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Try searching for products, orders (ORD-), quotes (QUO-), or
                categories...
              </p>
            )}
          </CommandEmpty>

          {searchResults.length > 0 && (
            <CommandGroup heading={`Results (${searchResults.length})`}>
              {searchResults.map(product => {
                const defaultImage = product.productAssetss?.find(
                  asset => asset.isDefault === 1
                );
                const imageUrl =
                  defaultImage?.source || product.productAssetss?.[0]?.source;

                return (
                  <CommandItem
                    key={product.productIndexName}
                    onSelect={() => {
                      // Navigate to product page or handle product selection
                      handleSelect(`/product/${product.productIndexName}`);
                      setSearchValue("");
                      setOpen(false);
                    }}
                    className="gap-3"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded border">
                      <ImageWithFallback
                        src={imageUrl || "/asset/default-placeholder.png"}
                        alt={product.productShortDescription || "product image"}
                        className="object-cover"
                        width={48}
                        height={48}
                        fallbackSrc="/asset/default-placeholder.png"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                      <span className="truncate font-medium text-sm">
                        {product.productShortDescription}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{product.brandsName}</span>
                        <span>•</span>
                        <span className="truncate">
                          {product.brandProductId}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {!searchTerm && suggestionItems.length > 0 && (
            <CommandGroup heading="Suggestions">
              {suggestionItems.map(item => (
                <CommandItem
                  key={item.key}
                  onSelect={() => {
                    handleSelect(item.href);
                    setSearchValue("");
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default SearchDialogBox;
