# OpenSearch Implementation Guide
## Complete Guide for Browse, Product Detail, and Search Pages

---

## Table of Contents

1. [OpenSearch Architecture Overview](#opensearch-architecture-overview)
2. [Index Structure](#index-structure)
3. [Browse Page Implementation](#browse-page-implementation)
4. [Product Detail Page Implementation](#product-detail-page-implementation)
5. [Search Page Implementation](#search-page-implementation)
6. [Query Patterns & Examples](#query-patterns--examples)
7. [Performance Optimization](#performance-optimization)
8. [Error Handling](#error-handling)

---

## OpenSearch Architecture Overview

### Core Concepts

#### 1. **Index Structure**
- **Index Format**: `{tenantElasticCode}pgandproducts` (e.g., `schwingstetterpgandproducts`)
- **Document Type**: `pgproduct`
- **Document ID Format**: 
  - Products: `Prod{ProductId}` (11 digits, e.g., `Prod0000064175`)
  - Product Groups: `PrdGrp{ProductGroupId}` (9 digits, e.g., `PrdGrp000054518`)

#### 2. **Data Model**
- **Denormalized Structure**: All related data (brand, category, tax, inventory) is embedded in each product document
- **No Joins**: Unlike SQL, OpenSearch doesn't support joins - all data is pre-joined
- **Fast Retrieval**: Single document fetch contains everything needed

#### 3. **Query Types**
- **Search** (`queryType: "search"`): For filtering, searching, browsing
- **Get** (`queryType: "get"`): For direct document retrieval by ID

---

## Index Structure

### Document Fields Overview

```typescript
interface ProductDocument {
  // Core Identification
  productId: number;
  productIndexName: string; // "Prod0000064175"
  productGroupId: number;
  pgIndexName: string; // "PrdGrp000054518"
  brandProductId: string;
  
  // Product Information
  title?: string;
  productShortDescription: string;
  productDescription?: string;
  pgName: string;
  
  // Brand Information
  brandId: number;
  brandsName: string;
  brandImage?: string;
  
  // Pricing
  unitListPrice: number;
  unitMrp: number;
  b2CUnitListPrice?: number;
  b2CDiscountPrice?: number;
  isListpricePublic: boolean;
  showPrice: boolean;
  
  // Variants & Attributes
  productAttributes: Record<string, string[]>; // { "Color": ["Red", "Blue"] }
  setProductAtributes: Array<{
    attributeName: string;
    attributeValue: string;
  }>;
  
  // Product Group Variants (for variant selection)
  variantAttributeses?: Array<{
    name: string;
    displayType: string;
    options: string[];
  }>;
  
  // Media Assets
  productAssetss: Array<{
    type: string;
    source: string;
    height?: string;
    width?: string;
    isDefault: number | boolean;
  }>;
  
  // Category Hierarchy
  productsSubCategories: Array<{
    subCategoryId: number;
    subCategoryName: string;
    categoryId: number;
    categoryName: string;
    majorCategoryId: number;
    majorCategoryName: string;
    departmentId: number;
    departmentName: string;
    isPrimary: number;
  }>;
  
  // Inventory
  inventory: Array<{
    warehouseId: number;
    warehousName: string;
    wareHousecode: string;
    availableQty: number;
    companyId: number;
  }>;
  
  // Tax Information
  hsnCode: string;
  hsnDescription: string;
  hsnTax: number;
  hsnTaxBreakup: {
    intraTax: TaxGroup;
    interTax: TaxGroup;
  };
  
  // Status Flags
  isPublished: number; // 1 = published, 0 = unpublished
  isDiscontinued: number;
  isNew: number;
  isBrandStock: number;
  isInternal: boolean;
  
  // Metadata
  tenantId: number;
  createdOn: string;
  updatedOn: string;
  catalogCode: string[];
}
```

### Key Field Mappings

| Field | Type | Searchable | Filterable | Notes |
|-------|------|------------|------------|-------|
| `productId` | `long` | ❌ | ✅ | Use for exact matches |
| `productGroupId` | `long` | ❌ | ✅ | Group products together |
| `productShortDescription` | `text` | ✅ | ❌ | Full-text search with analyzer |
| `brandsName` | `text` | ✅ | ✅ | Has keyword field for exact match |
| `unitListPrice` | `float` | ❌ | ✅ | Range queries supported |
| `isPublished` | `long` | ❌ | ✅ | Always filter by this |
| `productAttributes` | `object` | ❌ | ✅ | Nested object for variants |

---

## Browse Page Implementation

### Overview
Browse pages display products filtered by category, brand, price range, etc. with pagination.

### Implementation Steps

#### 1. **API Route** (`/app/api/opensearch/browse/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/lib/api/services/SearchService/SearchService";
import { buildBrowseQuery } from "@/lib/utils/opensearch/query-builders";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filters
    const categoryId = searchParams.get("categoryId");
    const subCategoryId = searchParams.get("subCategoryId");
    const brandId = searchParams.get("brandId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "24");
    const sortBy = searchParams.get("sortBy") || "relevance";
    const elasticIndex = searchParams.get("elasticIndex");
    
    if (!elasticIndex) {
      return NextResponse.json(
        { error: "elasticIndex is required" },
        { status: 400 }
      );
    }
    
    // Build query
    const query = buildBrowseQuery({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      subCategoryId: subCategoryId ? parseInt(subCategoryId) : undefined,
      brandId: brandId ? parseInt(brandId) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      page,
      pageSize,
      sortBy,
    });
    
    // Execute search
    const searchService = SearchService.getInstance();
    const result = await searchService.searchProducts({
      elasticIndex,
      query,
    });
    
    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
```

#### 2. **Query Builder** (`/lib/utils/opensearch/query-builders.ts`)

```typescript
import { ElasticSearchQuery } from "@/lib/api/services/SearchService/SearchService";

export interface BrowseFilters {
  categoryId?: number;
  subCategoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  pageSize: number;
  sortBy: "relevance" | "price_asc" | "price_desc" | "newest";
}

export function buildBrowseQuery(filters: BrowseFilters): ElasticSearchQuery {
  const must: Array<Record<string, unknown>> = [];
  const filter: Array<Record<string, unknown>> = [];
  
  // Always filter published products
  filter.push({
    term: {
      isPublished: 1,
    },
  });
  
  // Category filter
  if (filters.categoryId) {
    filter.push({
      term: {
        "productsSubCategories.categoryId": filters.categoryId,
      },
    });
  }
  
  // Sub-category filter
  if (filters.subCategoryId) {
    filter.push({
      term: {
        "productsSubCategories.subCategoryId": filters.subCategoryId,
      },
    });
  }
  
  // Brand filter
  if (filters.brandId) {
    filter.push({
      term: {
        brandId: filters.brandId,
      },
    });
  }
  
  // Price range filter
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const range: Record<string, number> = {};
    if (filters.minPrice !== undefined) {
      range.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      range.lte = filters.maxPrice;
    }
    filter.push({
      range: {
        unitListPrice: range,
      },
    });
  }
  
  // Build sort
  const sort: Array<Record<string, unknown>> = [];
  switch (filters.sortBy) {
    case "price_asc":
      sort.push({ unitListPrice: { order: "asc" } });
      break;
    case "price_desc":
      sort.push({ unitListPrice: { order: "desc" } });
      break;
    case "newest":
      sort.push({ createdOn: { order: "desc" } });
      break;
    default:
      // Relevance (default) - no sort, uses OpenSearch scoring
      break;
  }
  
  return {
    query: {
      bool: {
        must,
        filter,
      },
    },
    size: filters.pageSize,
    from: (filters.page - 1) * filters.pageSize,
    sort: sort.length > 0 ? sort : undefined,
    _source: [
      "productId",
      "productIndexName",
      "productGroupId",
      "title",
      "productShortDescription",
      "brandsName",
      "unitListPrice",
      "productAssetss",
      "isPublished",
      "isNew",
    ],
  };
}
```

#### 3. **Browse Page Component** (`/app/[locale]/products/page.tsx`)

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Pagination } from "@/components/ui/pagination";

interface BrowseProduct {
  productId: number;
  productIndexName: string;
  title?: string;
  productShortDescription: string;
  brandsName: string;
  unitListPrice: number;
  productAssetss?: Array<{ source: string; isDefault?: boolean }>;
}

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId"),
    brandId: searchParams.get("brandId"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    page: parseInt(searchParams.get("page") || "1"),
    sortBy: searchParams.get("sortBy") || "relevance",
  });
  
  const { tenantData } = useTenantData();
  const elasticIndex = tenantData?.tenant?.elasticCode 
    ? `${tenantData.tenant.elasticCode}pgandproducts`
    : null;
  
  // Fetch products
  const { data, isLoading, error } = useQuery({
    queryKey: ["browse-products", filters, elasticIndex],
    queryFn: async () => {
      if (!elasticIndex) return null;
      
      const params = new URLSearchParams({
        elasticIndex,
        page: filters.page.toString(),
        pageSize: "24",
        sortBy: filters.sortBy,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.brandId && { brandId: filters.brandId }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      });
      
      const response = await fetch(`/api/opensearch/browse?${params}`);
      return response.json();
    },
    enabled: !!elasticIndex,
  });
  
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
    // Update URL
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    router.push(`/products?${params}`);
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <ProductFilters
            filters={filters}
            onChange={handleFilterChange}
          />
        </aside>
        
        {/* Products Grid */}
        <main className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              Products ({data?.total || 0})
            </h1>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((product: BrowseProduct) => (
              <ProductCard
                key={product.productId}
                product={product}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {data?.totalPages > 1 && (
            <Pagination
              currentPage={filters.page}
              totalPages={data.totalPages}
              onPageChange={(page) => handleFilterChange({ page })}
            />
          )}
        </main>
      </div>
    </div>
  );
}
```

---

## Product Detail Page Implementation

### Overview
Product detail pages show complete product information, variants, images, and related products.

### Implementation Steps

#### 1. **API Route** (`/app/api/opensearch/products/[id]/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { OpenSearchService } from "@/lib/api/services/OpenSearchService/OpenSearchService";
import { RequestContext } from "@/lib/api/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    const elasticIndex = searchParams.get("elasticIndex");
    if (!elasticIndex) {
      return NextResponse.json(
        { error: "elasticIndex is required" },
        { status: 400 }
      );
    }
    
    // Build context
    const context: RequestContext = {
      tenantCode: searchParams.get("tenantCode") || undefined,
      companyId: searchParams.get("companyId") 
        ? parseInt(searchParams.get("companyId")!)
        : undefined,
      userId: searchParams.get("userId")
        ? parseInt(searchParams.get("userId")!)
        : undefined,
    };
    
    // Fetch product
    const product = await OpenSearchService.getProductCached(
      id,
      elasticIndex,
      "pgproduct",
      "get",
      context
    );
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Fetch product group for variants
    let variants = null;
    if (product.productGroupId) {
      const pgIndexName = `PrdGrp${String(product.productGroupId).padStart(9, "0")}`;
      const productGroup = await OpenSearchService.getProductCached(
        pgIndexName,
        elasticIndex,
        "pgproduct",
        "get",
        context
      );
      
      if (productGroup?.variantAttributeses) {
        // Fetch all products in group for variant selection
        const variantProducts = await OpenSearchService.searchProducts({
          elasticIndex,
          query: {
            query: {
              bool: {
                must: [
                  {
                    term: {
                      productGroupId: product.productGroupId,
                    },
                  },
                  {
                    term: {
                      isPublished: 1,
                    },
                  },
                ],
              },
            },
            size: 1000,
          },
          context,
        });
        
        variants = {
          attributes: productGroup.variantAttributeses,
          products: variantProducts.data || [],
        };
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          product,
          variants,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
```

#### 2. **Product Detail Page** (`/app/[locale]/products/[id]/page.tsx`)

```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageService } from "@/lib/api/services/ProductPageService";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { VariantSelector } from "@/components/product/VariantSelector";

interface ProductDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: ProductDetailPageProps
): Promise<Metadata> {
  const { id } = await params;
  const { tenantData, origin } = await ProductPageService.getProductPageContext();
  
  if (!tenantData?.tenant?.elasticCode) {
    return { title: "Product" };
  }
  
  const product = await ProductPageService.fetchProductById(
    id,
    tenantData.tenant.elasticCode,
    tenantData.tenant.tenantCode,
    origin
  );
  
  if (!product) {
    return { title: "Product Not Found" };
  }
  
  return {
    title: product.title || product.productShortDescription,
    description: product.productDescription || product.productShortDescription,
    openGraph: {
      title: product.title || product.productShortDescription,
      description: product.productDescription,
      images: product.productAssetss
        ?.filter(img => img.isDefault)
        .map(img => img.source) || [],
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { id } = await params;
  const { tenantData, origin } = await ProductPageService.getProductPageContext();
  
  if (!tenantData?.tenant?.elasticCode) {
    notFound();
  }
  
  const elasticIndex = `${tenantData.tenant.elasticCode}pgandproducts`;
  
  // Fetch product with variants
  const response = await fetch(
    `${origin}/api/opensearch/products/${id}?elasticIndex=${elasticIndex}&tenantCode=${tenantData.tenant.tenantCode}`,
    {
      next: { revalidate: 3600 }, // Revalidate every hour
    }
  );
  
  if (!response.ok) {
    notFound();
  }
  
  const { data } = await response.json();
  const { product, variants } = data;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetailView product={product} />
      
      {variants && variants.attributes.length > 0 && (
        <VariantSelector
          currentProduct={product}
          variantAttributes={variants.attributes}
          variantProducts={variants.products}
        />
      )}
    </div>
  );
}
```

#### 3. **Variant Selector Component** (`/components/product/VariantSelector.tsx`)

```typescript
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { VariantService } from "@/lib/api/services/VariantService";

interface VariantSelectorProps {
  currentProduct: ProductDetail;
  variantAttributes: Array<{
    name: string;
    displayType: string;
    options: string[];
  }>;
  variantProducts: ProductDetail[];
}

export function VariantSelector({
  currentProduct,
  variantAttributes,
  variantProducts,
}: VariantSelectorProps) {
  const router = useRouter();
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  
  // Transform to VariantData format
  const variants = useMemo(() => {
    return variantProducts.map(product => ({
      product_id: product.productId,
      product_group_id: product.productGroupId,
      attributes: Object.fromEntries(
        (product.setProductAtributes || []).map(attr => [
          attr.attributeName.toLowerCase().replace(/\s+/g, "_"),
          attr.attributeValue,
        ])
      ),
      images: product.productAssetss || [],
      pricing: {
        unit_list_price: product.unitListPrice,
        unit_mrp: product.unitMrp,
      },
      inventory: product.inventory || [],
      availability: (product.inventory || []).some(inv => inv.availableQty > 0),
      title: product.title || product.productShortDescription,
      brand_name: product.brandsName,
      product_short_description: product.productShortDescription,
      brand_product_id: product.brandProductId,
    }));
  }, [variantProducts]);
  
  // Group variants by attributes
  const groupedVariants = useMemo(() => {
    return VariantService.groupVariantsByAttributes(variants);
  }, [variants]);
  
  // Find matching variant
  const matchingVariant = useMemo(() => {
    if (Object.keys(selectedAttributes).length === 0) return null;
    return VariantService.findVariantByAttributes(variants, selectedAttributes);
  }, [selectedAttributes, variants]);
  
  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName.toLowerCase().replace(/\s+/g, "_")]: value,
    }));
  };
  
  const handleVariantSelect = () => {
    if (matchingVariant) {
      const productIndexName = `Prod${String(matchingVariant.product_id).padStart(11, "0")}`;
      router.push(`/products/${productIndexName}`);
    }
  };
  
  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold">Select Variant</h2>
      
      {variantAttributes.map(attr => (
        <div key={attr.name} className="space-y-2">
          <label className="font-semibold">{attr.name}</label>
          <div className="flex flex-wrap gap-2">
            {attr.options.map(option => {
              const attrKey = attr.name.toLowerCase().replace(/\s+/g, "_");
              const isSelected = selectedAttributes[attrKey] === option;
              const isAvailable = groupedVariants[attrKey]?.some(
                v => v.value === option
              );
              
              return (
                <button
                  key={option}
                  onClick={() => handleAttributeChange(attr.name, option)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 rounded border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : isAvailable
                      ? "bg-white border-gray-300 hover:border-blue-500"
                      : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {matchingVariant && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="font-semibold text-green-800">
            Selected: {matchingVariant.title}
          </p>
          <p className="text-green-600">
            Price: ₹{matchingVariant.pricing.unit_list_price}
          </p>
          <button
            onClick={handleVariantSelect}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            View This Variant
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Search Page Implementation

### Overview
Search pages provide full-text search with autocomplete, filters, and result ranking.

### Implementation Steps

#### 1. **Search Query Builder** (`/lib/utils/opensearch/search-query.ts`)

```typescript
import { ElasticSearchQuery } from "@/lib/api/services/SearchService/SearchService";

export interface SearchOptions {
  searchText: string;
  filters?: {
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
  };
  page?: number;
  pageSize?: number;
  sortBy?: "relevance" | "price_asc" | "price_desc";
}

export function buildProductSearchQuery(options: SearchOptions): ElasticSearchQuery {
  const { searchText, filters = {}, page = 1, pageSize = 24, sortBy = "relevance" } = options;
  
  const must: Array<Record<string, unknown>> = [];
  const should: Array<Record<string, unknown>> = [];
  const filter: Array<Record<string, unknown>> = [];
  
  // Always filter published products
  filter.push({
    term: {
      isPublished: 1,
    },
  });
  
  // Full-text search
  if (searchText.trim()) {
    // Multi-match query for better relevance
    must.push({
      multi_match: {
        query: searchText,
        fields: [
          "productShortDescription^3", // Boost title matches
          "title^2",
          "productDescription",
          "brandsName^1.5",
          "pgName",
        ],
        type: "best_fields",
        operator: "and", // All terms must match
        fuzziness: "AUTO", // Handle typos
      },
    });
    
    // Also search in brand product ID (exact match boost)
    should.push({
      term: {
        "brandProductId.keyword": {
          value: searchText,
          boost: 5.0, // High boost for exact ID matches
        },
      },
    });
  }
  
  // Category filter
  if (filters.categoryId) {
    filter.push({
      term: {
        "productsSubCategories.categoryId": filters.categoryId,
      },
    });
  }
  
  // Brand filter
  if (filters.brandId) {
    filter.push({
      term: {
        brandId: filters.brandId,
      },
    });
  }
  
  // Price range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const range: Record<string, number> = {};
    if (filters.minPrice !== undefined) range.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) range.lte = filters.maxPrice;
    filter.push({
      range: {
        unitListPrice: range,
      },
    });
  }
  
  // Build sort
  const sort: Array<Record<string, unknown>> = [];
  if (sortBy === "price_asc") {
    sort.push({ unitListPrice: { order: "asc" } });
  } else if (sortBy === "price_desc") {
    sort.push({ unitListPrice: { order: "desc" } });
  }
  // "relevance" uses default OpenSearch scoring (no sort)
  
  return {
    query: {
      bool: {
        must: must.length > 0 ? must : undefined,
        should: should.length > 0 ? should : undefined,
        filter: filter.length > 0 ? filter : undefined,
        minimum_should_match: should.length > 0 ? 0 : undefined,
      },
    },
    size: pageSize,
    from: (page - 1) * pageSize,
    sort: sort.length > 0 ? sort : undefined,
    _source: [
      "productId",
      "productIndexName",
      "productGroupId",
      "title",
      "productShortDescription",
      "brandsName",
      "brandProductId",
      "unitListPrice",
      "productAssetss",
      "isPublished",
    ],
  };
}
```

#### 2. **Search API Route** (`/app/api/opensearch/search/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/lib/api/services/SearchService/SearchService";
import { buildProductSearchQuery } from "@/lib/utils/opensearch/search-query";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const searchText = searchParams.get("q") || "";
    const elasticIndex = searchParams.get("elasticIndex");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "24");
    const sortBy = searchParams.get("sortBy") || "relevance";
    
    if (!elasticIndex) {
      return NextResponse.json(
        { error: "elasticIndex is required" },
        { status: 400 }
      );
    }
    
    // Build query
    const query = buildProductSearchQuery({
      searchText,
      filters: {
        categoryId: searchParams.get("categoryId")
          ? parseInt(searchParams.get("categoryId")!)
          : undefined,
        brandId: searchParams.get("brandId")
          ? parseInt(searchParams.get("brandId")!)
          : undefined,
        minPrice: searchParams.get("minPrice")
          ? parseFloat(searchParams.get("minPrice")!)
          : undefined,
        maxPrice: searchParams.get("maxPrice")
          ? parseFloat(searchParams.get("maxPrice")!)
          : undefined,
      },
      page,
      pageSize,
      sortBy: sortBy as "relevance" | "price_asc" | "price_desc",
    });
    
    // Execute search
    const searchService = SearchService.getInstance();
    const result = await searchService.searchProducts({
      elasticIndex,
      query,
    });
    
    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
      query: searchText,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
```

#### 3. **Search Page Component** (`/app/[locale]/search/page.tsx`)

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@/hooks/useSearch";
import { ProductCard } from "@/components/product/ProductCard";
import { SearchFilters } from "@/components/search/SearchFilters";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchText = searchParams.get("q") || "";
  
  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId"),
    brandId: searchParams.get("brandId"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    page: parseInt(searchParams.get("page") || "1"),
    sortBy: searchParams.get("sortBy") || "relevance",
  });
  
  const { tenantData } = useTenantData();
  const elasticIndex = tenantData?.tenant?.elasticCode
    ? `${tenantData.tenant.elasticCode}pgandproducts`
    : null;
  
  // Use search hook for autocomplete (if needed)
  const { data: autocompleteResults } = useSearch({
    searchText: searchText.length > 2 ? searchText : "",
    elasticIndex: elasticIndex || undefined,
    enabled: searchText.length > 2,
  });
  
  // Fetch full search results
  const { data, isLoading, error } = useQuery({
    queryKey: ["search", searchText, filters, elasticIndex],
    queryFn: async () => {
      if (!elasticIndex || !searchText.trim()) return null;
      
      const params = new URLSearchParams({
        q: searchText,
        elasticIndex,
        page: filters.page.toString(),
        pageSize: "24",
        sortBy: filters.sortBy,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.brandId && { brandId: filters.brandId }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      });
      
      const response = await fetch(`/api/opensearch/search?${params}`);
      return response.json();
    },
    enabled: !!elasticIndex && !!searchText.trim(),
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Search Results
          {searchText && (
            <span className="text-gray-600 font-normal">
              {" "}for "{searchText}"
            </span>
          )}
        </h1>
        {data && (
          <p className="text-gray-600">
            Found {data.total} {data.total === 1 ? "result" : "results"}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <aside className="lg:col-span-1">
          <SearchFilters
            filters={filters}
            onChange={(newFilters) => {
              setFilters({ ...newFilters, page: 1 });
            }}
          />
        </aside>
        
        {/* Results */}
        <main className="lg:col-span-3">
          {isLoading && <div>Searching...</div>}
          {error && <div>Error searching products</div>}
          
          {data && data.data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No products found for "{searchText}"
              </p>
              <p className="text-gray-500 mt-2">
                Try different keywords or adjust your filters
              </p>
            </div>
          )}
          
          {data && data.data.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.data.map((product: any) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {data.totalPages > 1 && (
                <Pagination
                  currentPage={filters.page}
                  totalPages={data.totalPages}
                  onPageChange={(page) => setFilters({ ...filters, page })}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
```

---

## Query Patterns & Examples

### 1. **Simple Product Lookup**

```typescript
// Get single product by ID
const product = await OpenSearchService.getProductCached(
  "Prod0000064175",
  "schwingstetterpgandproducts",
  "pgproduct",
  "get",
  context
);
```

### 2. **Category Browse**

```typescript
const query = {
  query: {
    bool: {
      filter: [
        { term: { isPublished: 1 } },
        { term: { "productsSubCategories.categoryId": 3673 } },
      ],
    },
  },
  size: 24,
  from: 0,
};
```

### 3. **Brand Filter**

```typescript
const query = {
  query: {
    bool: {
      filter: [
        { term: { isPublished: 1 } },
        { term: { brandId: 411 } },
      ],
    },
  },
};
```

### 4. **Price Range**

```typescript
const query = {
  query: {
    bool: {
      filter: [
        { term: { isPublished: 1 } },
        {
          range: {
            unitListPrice: {
              gte: 1000,
              lte: 5000,
            },
          },
        },
      ],
    },
  },
};
```

### 5. **Full-Text Search**

```typescript
const query = {
  query: {
    bool: {
      must: [
        {
          multi_match: {
            query: "safety glasses",
            fields: [
              "productShortDescription^3",
              "title^2",
              "productDescription",
            ],
            type: "best_fields",
          },
        },
      ],
      filter: [
        { term: { isPublished: 1 } },
      ],
    },
  },
};
```

### 6. **Variant Products**

```typescript
const query = {
  query: {
    bool: {
      must: [
        { term: { productGroupId: 54518 } },
        { term: { isPublished: 1 } },
      ],
    },
  },
  size: 1000, // Get all variants
};
```

---

## Performance Optimization

### 1. **Caching Strategy**

```typescript
// Server-side caching (Next.js)
export const revalidate = 3600; // 1 hour

// API route caching
headers: {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
}
```

### 2. **Query Optimization**

- Always filter by `isPublished: 1` first
- Use `filter` instead of `must` for exact matches (no scoring overhead)
- Limit `_source` fields to only what you need
- Use pagination (`size` and `from`)

### 3. **Index Selection**

```typescript
// Always use tenant-specific index
const elasticIndex = `${tenantData.tenant.elasticCode}pgandproducts`;
```

### 4. **Debouncing Search**

```typescript
// In search input component
const [debouncedSearchText, setDebouncedSearchText] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchText(searchText);
  }, 300);
  return () => clearTimeout(timer);
}, [searchText]);
```

---

## Error Handling

### 1. **API Error Handling**

```typescript
try {
  const result = await searchService.searchProducts(options);
  return result;
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      return { success: false, data: [], total: 0, error: "Not found" };
    }
    if (error.response?.status === 400) {
      return { success: false, data: [], total: 0, error: "Invalid query" };
    }
  }
  return { success: false, data: [], total: 0, error: "Search failed" };
}
```

### 2. **Component Error Boundaries**

```typescript
"use client";

import { ErrorBoundary } from "react-error-boundary";

function SearchErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-bold mb-2">Search Error</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

export default function SearchPage() {
  return (
    <ErrorBoundary FallbackComponent={SearchErrorFallback}>
      {/* Search content */}
    </ErrorBoundary>
  );
}
```

---

## Summary

This guide provides complete implementation patterns for:

1. **Browse Pages**: Category-based product listing with filters and pagination
2. **Product Detail Pages**: Full product information with variant selection
3. **Search Pages**: Full-text search with autocomplete and filters

Key takeaways:

- Always filter by `isPublished: 1`
- Use `get` for single product lookups, `search` for filtering/browsing
- Implement proper caching at API and component levels
- Handle variants at the Product Group level
- Use debouncing for search inputs
- Implement proper error handling and loading states

For more details on specific implementations, refer to the existing codebase in:
- `/src/lib/api/services/SearchService/`
- `/src/lib/api/services/OpenSearchService/`
- `/src/lib/api/services/VariantService.ts`
- `/src/hooks/useSearch.ts`

