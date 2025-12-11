# Smart Filters Feature Module

Enterprise-grade filter system for product discovery with Smart Category navigation.

## 🎯 Core Principles

- **Separation of Concerns**: Backend computes counts, frontend renders UI
- **Smart & Non-Destructive**: Active filters affect counts but not category hierarchy
- **SEO-Safe**: Deterministic URLs, server-side rendering, crawlable navigation
- **Performance-Aware**: Parallel aggregations, configurable bucket sizes, caching support
- **Type-Safe**: Full TypeScript coverage with strict types

## 📁 Module Structure

```
src/features/smart-filters/
├── types/              # TypeScript type definitions
│   ├── smart-filter.types.ts
│   ├── category-filter.types.ts
│   ├── api-contracts.types.ts
│   └── index.ts
├── queries/            # OpenSearch query builders
│   ├── builders/
│   │   ├── CategoryQueryBuilder.ts
│   │   └── FilterQueryBuilder.ts
│   └── index.ts
├── formatters/         # Data transformation layer
│   ├── CategoryFilterFormatter.ts
│   └── index.ts
├── services/           # Business logic layer
│   ├── CategoryFilterService.ts
│   └── index.ts
├── hooks/              # Client-side React hooks
│   ├── useSmartFilters.ts
│   └── index.ts
├── components/         # UI components
│   ├── SmartCategoryFilter.tsx
│   ├── SmartFilterSection.tsx
│   ├── FilterOptionList.tsx
│   └── index.ts
└── index.ts           # Public API
```

## 🚀 Quick Start

### Server Component Usage

```typescript
import {
  CategoryFilterService,
  CategoryContext,
  ActiveFilters,
} from "@/features/smart-filters";

// Define current category context
const currentCategory: CategoryContext = {
  categoryId: 28,
  categoryName: "Power Tools",
  categorySlug: "power-tools",
  categoryLevel: 1,
  parentId: 27,
  fullPath: ["tools", "power-tools"],
};

// Define active filters (non-category filters)
const activeFilters: ActiveFilters = {
  brand: "DeWalt",
  inStock: true,
  variantAttributes: {},
  productSpecifications: {},
};

// Fetch category filters (server-side)
const filterData = await CategoryFilterService.getCategoryFilters({
  elasticIndex: "sandboxpgandproducts",
  currentCategory,
  activeFilters,
  context: requestContext,
});

// Pass to client component
return <CategoryPage filterData={filterData} />;
```

### Client Component Usage

```typescript
"use client";

import { useSmartFilters, SmartFilterSection } from "@/features/smart-filters";
import type { CategoryFilterResponse } from "@/features/smart-filters";

interface CategoryPageProps {
  filterData: CategoryFilterResponse;
  currentCategoryId?: number;
}

export function CategoryPage({ filterData, currentCategoryId }: CategoryPageProps) {
  const {
    filters,
    toggleVariantAttribute,
    clearFilters,
    isPending,
  } = useSmartFilters({
    categoryContext: filterData.currentCategory,
  });

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6">
      {/* Filter Sidebar */}
      <SmartFilterSection
        filterData={filterData}
        currentCategoryId={currentCategoryId}
        onClearAll={clearFilters}
        isLoading={isPending}
      />

      {/* Product Grid */}
      <div>
        {/* Your product list component */}
      </div>
    </div>
  );
}
```

## 📐 Smart Category Filter Rules

### Rule 1: Root Level (No Category Selected)

```typescript
currentCategory = null

Results:
- siblings: [] (no siblings at root)
- children: All level 0 categories
```

### Rule 2: Level 0 Selected

```typescript
currentCategory.categoryLevel = 0

Results:
- siblings: All level 0 categories (current marked as selected)
- children: Direct children of current (parentId = currentCategoryId)
```

### Rule 3: Level > 0 Selected

```typescript
currentCategory.categoryLevel > 0
currentCategory.parentId = 27

Results:
- siblings: Categories with same parentId (= 27)
- children: Categories with parentId = currentCategoryId
```

## 🔧 Architecture Layers

### 1. Query Builder Layer

**Purpose**: Build type-safe OpenSearch queries

```typescript
// Build query for children
const query = CategoryQueryBuilder.buildChildrenQuery(
  baseQuery,
  parentCategoryId,
  bucketSize
);

// Build query for siblings at level 0
const query = CategoryQueryBuilder.buildSiblingsAtLevel0Query(
  baseQuery,
  currentCategoryId
);
```

### 2. Formatter Layer

**Purpose**: Transform aggregation responses to UI-ready data

```typescript
// Format siblings (marks current as selected)
const siblings = CategoryFilterFormatter.formatSiblings(
  aggregationResponse,
  currentCategory
);

// Format children (never selected)
const children = CategoryFilterFormatter.formatChildren(
  aggregationResponse,
  currentCategory
);
```

### 3. Service Layer

**Purpose**: Business logic orchestration

```typescript
// High-level API that handles all the complexity
const result = await CategoryFilterService.getCategoryFilters(request);
```

## 🎨 Type System

### Core Types

```typescript
// Category context (current position)
interface CategoryContext {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryLevel: number;
  parentId: number | null;
  fullPath: string[];
}

// Active filters (affect counts)
interface ActiveFilters {
  brand?: string;
  searchQuery?: string;
  priceRange?: { min?: number; max?: number };
  inStock?: boolean;
  variantAttributes: Record<string, string[]>;
  productSpecifications: Record<string, string[]>;
  catalogCodes?: string[];
  equipmentCodes?: string[];
}

// Category filter option (UI display)
interface CategoryFilterOption {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryLevel: number;
  parentId: number | null;
  productCount: number; // With active filters applied
  isSelected: boolean;
  navigationPath: string;
}
```

## 🔍 Example: Power Tools Category

### Current State

```typescript
Current Category: Power Tools (ID: 28, Level: 1, Parent: 27)
Active Filters: { brand: "DeWalt", inStock: true }
```

### Query Execution

```typescript
// Sibling query: parentId = 27
// Returns: Power Tools*, Hand Tools, Accessories
// (*marked as selected)

// Children query: parentId = 28
// Returns: Drills, Saws, Sanders
```

### Result Display

```
Categories Filter:
  Same Level:
    ☑ Power Tools (150)      ← Selected
    ☐ Hand Tools (89)
    ☐ Accessories (234)

  Subcategories:
    ☐ Drills (45)
    ☐ Saws (38)
    ☐ Sanders (27)
```

## ⚡ Performance Optimizations

### Parallel Queries

```typescript
// Sibling and children queries run in parallel
const [siblingsAgg, childrenAgg] = await Promise.all([
  executeAggregation(siblingQuery),
  executeAggregation(childrenQuery),
]);
```

### Configurable Bucket Sizes

```typescript
// Default: 200, Max: 500
const result = await CategoryFilterService.getCategoryFilters({
  ...request,
  bucketSize: 100, // Override default
});
```

### Validation & Diagnostics

```typescript
result.diagnostics = {
  currentLevel: 1,
  siblingCount: 3,
  childCount: 3,
  warnings: [],
  executionTime: 145, // ms
  usedParentId: 27,
};
```

## 🧪 Testing

Each layer is designed to be independently testable:

```typescript
// Test query builder
const query = CategoryQueryBuilder.buildChildrenQuery(baseQuery, 28);
expect(query.aggs.categories.filter.bool.must).toContainEqual({
  term: { "product_categories.parentId": 28 },
});

// Test formatter
const options = CategoryFilterFormatter.formatSiblings(mockAgg, mockCategory);
expect(options.find(o => o.categoryId === 28)?.isSelected).toBe(true);

// Test service
const result = await CategoryFilterService.getCategoryFilters(mockRequest);
expect(result.success).toBe(true);
expect(result.siblings.length).toBeGreaterThan(0);
```

## 🔐 Error Handling

### Graceful Degradation

```typescript
// Missing parentId at level > 0
if (currentCategory.level > 0 && !currentCategory.parentId) {
  // Returns empty siblings, still shows children
  // Logs warning in diagnostics
}

// API failure
catch (error) {
  return {
    success: false,
    siblings: [],
    children: [],
    error: { message, code }
  };
}
```

## 📊 Integration with Existing Code

### Minimal Changes Required

```typescript
// Old way (src/utils/format-aggregations.ts)
const filters = formatAllAggregations(aggregations, categoryPath, currentPath);

// New way (src/features/smart-filters)
const categoryFilters = await CategoryFilterService.getCategoryFilters({
  elasticIndex,
  currentCategory,
  activeFilters,
  context,
});
```

### Migration Path

1. ✅ Phase 1: New module created (no breaking changes)
2. ⏳ Phase 2: Integrate in pages alongside old code
3. ⏳ Phase 3: Switch to new implementation
4. ⏳ Phase 4: Remove old code

## 🎯 Next Steps

### Immediate

- [ ] Create `useSmartFilters` hook for client-side state
- [ ] Build `SmartFilters` UI components
- [ ] Integrate with category pages

### Future Enhancements

- [ ] Add brand filter service
- [ ] Add variant attribute service
- [ ] Add specification filter service
- [ ] Add caching layer
- [ ] Add analytics tracking

## 📝 API Reference

### CategoryFilterService

#### `getCategoryFilters(request)`

Main entry point for fetching category filters.

**Parameters:**

- `elasticIndex`: string - OpenSearch index name
- `currentCategory`: CategoryContext | null - Current position
- `activeFilters`: ActiveFilters - Non-category filters
- `context`: RequestContext - Tenant/auth context
- `bucketSize?`: number - Max categories (default: 200)

**Returns:**

- `success`: boolean
- `siblings`: CategoryFilterOption[]
- `children`: CategoryFilterOption[]
- `diagnostics?`: CategoryFilterDiagnostics
- `error?`: { message, code }

---

**Built with TypeScript, designed for scale, optimized for performance.** 🚀
