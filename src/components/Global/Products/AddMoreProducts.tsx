"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ImageIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  image?: string;
}

function AddMoreProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(query.length > 0);
    // Add API call here to fetch products
    // setProducts(response.data);
  };

  const handleAddProduct = (_product: Product) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    setProducts([]);
  };

  return (
    <div className="flex justify-end p-4">
      <div className="relative w-full max-w-md">
        <Input
          type="text"
          placeholder="Search and add products..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => searchQuery && setIsSearchOpen(true)}
          onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
          className="h-10 w-full pr-10 text-sm"
          autoFocus
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-gray-100"
          aria-label="search"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
        </button>

        {isSearchOpen && searchQuery && (
          <div
            className="absolute z-[1400] mt-1 rounded-lg bg-white shadow-2xl border"
            style={{
              width: "430px",
              height: "410px",
              right: 0,
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                height: "100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "scroll",
                  marginRight: "-15px",
                  marginBottom: "-15px",
                }}
              >
                <ul className="list-none p-2 m-0">
                  {products.length > 0 ? (
                    products.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
                        onClick={() => handleAddProduct(product)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No products found
                    </div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddMoreProducts;
