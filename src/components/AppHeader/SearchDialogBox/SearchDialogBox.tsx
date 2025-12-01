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
import OpenElasticSearchService from "@/lib/api/services/ElacticQueryService/openElasticSearch/openElasticSearch";
import { SimpleProductSearchResult } from "@/types/OpenElasticSearch/types";
import { generateProductUrl } from "@/utils/product/slug-generator";
import React, { useEffect, useRef, useState } from "react";

type SuggestionItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
};

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  elasticIndex?: string;
  suggestionItems: SuggestionItem[];
  handleSelect: (href: string) => void;
  setSearchValue: (v: string) => void;
  locale?: string;
};

export function SearchDialogBox({
  open,
  setOpen,
  elasticIndex = "",
  suggestionItems,
  handleSelect,
  setSearchValue,
  locale = "en",
}: Props) {
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [searchResults, setSearchResults] = useState<
    SimpleProductSearchResult[]
  >([]);
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
          const data = await OpenElasticSearchService.searchProducts(
            term,
            elasticIndex
          );
          console.log(data);
          setSearchResults((data.data || []) as SimpleProductSearchResult[]);
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
                      // Generate proper product URL with locale and slug
                      const productUrl = generateProductUrl(
                        {
                          brand_name: product.brandsName,
                          brands_name: product.brandsName,
                          title: product.productShortDescription,
                          product_index_name: product.productIndexName,
                          product_id: product.productId,
                        },
                        locale
                      );
                      handleSelect(productUrl);
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
