# Smart Filter Implementation Flow - Complete Architecture

## Overview

The Smart Filter system fetches filter data (categories, brands, price, stock, etc.) in a **single OpenSearch request** and returns formatted results to the UI.

---

## 1. REQUEST FLOW: Page Load → Filter Data

### Step 1.1: Page Component (Server-Side)

**File**: `src/app/[locale]/[...categories]/page.tsx`

```typescript
// When user visits /en/tools, this runs on server
export default async function CategoryPage({ params }) {
  const { locale, categories } = params;

  // Pass to adapter for filter fetching
  const filterResponse = await SmartFiltersPageAdapter.getFilters({
    categoryPath: categories, // ['tools']
    locale,
    activeFilters: {}, // User selections
  });

  // filterResponse contains categories, brands, price, stock, etc.
  return <CategoryView filters={filterResponse.filters} />;
}
```

### Step 1.2: Page Adapter (Request Orchestrator)

**File**: `src/features/smart-filters/adapters/SmartFiltersPageAdapter.ts`

```typescript
export class SmartFiltersPageAdapter {
  static async getFilters(request: PageAdapterRequest) {
    // 1. Resolve category context from URL path
    const categoryContext = await CategoryResolutionService.resolvePath(
      ["tools"] // URL: /en/tools
    );
    // Result: { categoryId: 27, categoryName: "Tools", categoryLevel: 0, ... }

    // 2. Call SmartFilterService to fetch all filters
    const filterResponse = await SmartFilterService.getInstance().getFilters({
      elasticIndex: "sandboxpgandproducts",
      currentCategory: categoryContext,
      activeFilters: {}, // brand, price, stock filters
      context: { tenantCode: "sandbox" },
    });

    // 3. Return formatted response to page
    return filterResponse;
  }
}
```

---

## 2. QUERY BUILDING: Create OpenSearch Aggregation

### Step 2.1: Build Query

**File**: `src/features/smart-filters/queries/SmartFilterAggregationBuilder.ts`

**Entry Point**: `buildSmartFilterAggregationQuery(currentCategory, activeFilters, bucketSize)`

#### What it does:

Creates a single OpenSearch query that aggregates ALL filter types simultaneously.

#### Query Structure:

```json
{
  "size": 0,  // Only aggregations, no hits
  "query": {
    "bool": {
      "must": [
        { "term": { "is_published": 1 } }  // Base filter
      ],
      "must_not": [
        { "match": { "pg_index_name": { "query": "PrdGrp0*" } } },
        { "term": { "is_internal": true } }
      ]
    }
  },
  "aggs": {
    "category_siblings": { ... },
    "category_children": { ... },
    "brand_filter_context": { ... },
    "price_filter_context": { ... },
    "stock_filter_context": { ... },
    "variant_attributes_filter_context": { ... },
    "product_specifications_filter_context": { ... },
    "catalog_codes_filter_context": { ... },
    "equipment_codes_filter_context": { ... }
  }
}
```

### Step 2.2: Category Aggregation (The Problem Area)

**File**: `src/features/smart-filters/queries/SmartFilterAggregationBuilder.ts`, Lines 293-400

#### Current Implementation (BROKEN):

```typescript
function buildCategoryAggregation(currentCategory, bucketSize) {
  // Root level: no category selected (showing all products)
  if (!currentCategory) {
    return {
      category_siblings: {
        nested: { path: "product_categories" },  // ← ISSUE: product_categories is NOT nested!
        aggs: {
          filtered: {
            filter: { term: { "product_categories.categoryLevel": 0 } },
            aggs: {
              categories: {
                multi_terms: {
                  terms: [
                    { field: "product_categories.categoryId" },
                    { field: "product_categories.categoryName.keyword" },
                    { field: "product_categories.categorySlug.keyword" },
                    { field: "product_categories.parentId" },
                    { field: "product_categories.categoryLevel" }
                  ],
                  size: bucketSize
                }
              }
            }
          }
        }
      },
      category_children: { ... }
    };
  }

  // Category page: build siblings based on level
  if (currentCategory.categoryLevel === 0) {
    return {
      category_siblings: { /* Get all level 0 */ },
      category_children: { /* Get children of level 0 */ }
    };
  }

  // Level > 0
  return {
    category_siblings: { /* Get siblings (same parentId) */ },
    category_children: { /* Get children */ }
  };
}
```

#### The Problem:

**Log Output**:

```
[SmartFilterFormatter] Category aggregations (nested): {
  siblingDocCount: 0,  ← ZERO because nested doesn't match!
  childrenDocCount: 0,
  siblingsBuckets: 0,
  childrenBuckets: 0
}
```

**Why it fails**:

- OpenSearch mapping shows `product_categories` is a **flattened array**, NOT a nested type
- When you use `nested: { path: "product_categories" }`, OpenSearch looks for a nested field
- Since it doesn't exist, `doc_count: 0` (no documents matched)

---

## 3. OPENSEARCH EXECUTION

### Step 3.1: Send Query to OpenSearch

**File**: `src/features/smart-filters/services/SmartFilterService.ts`, Lines 68-95

```typescript
async getFilters(request: SmartFilterRequest): Promise<SmartFilterResponse> {
  // Build the query
  const query = buildSmartFilterAggregationQuery(
    currentCategory,
    activeFilters,
    bucketSize
  );

  // Create OpenSearch request
  const requestBody: OpenSearchRequestBody = {
    Elasticindex: elasticIndex,  // 'sandboxpgandproducts'
    ElasticBody: query,           // The aggregation query
    ElasticType: "pgproduct",
    queryType: "search"
  };

  // Send to OpenSearch via BaseService
  const searchResult = await this.callWith(
    "",
    requestBody,
    { method: "POST", context }
  );

  // searchResult.body.aggregations contains all aggregation results
  return formatSmartFilterResponse(searchResult.body.aggregations, ...);
}
```

### Step 3.2: OpenSearch Response Structure

**What OpenSearch returns** (if nested worked):

```json
{
  "aggregations": {
    "category_siblings": {
      "doc_count": 24,
      "filtered": {
        "doc_count": X,
        "categories": {
          "buckets": [
            {
              "key": [27, "Tools", "tools", 0, 0],
              "key_as_string": "27|Tools|tools|0|0",
              "doc_count": 3
            },
            {
              "key": [29, "Lawn & Garden", "lawn-garden", 0, 0],
              "doc_count": 2
            }
          ]
        }
      }
    },
    "category_children": {
      "doc_count": 24,
      "filtered": {
        "doc_count": X,
        "categories": {
          "buckets": [
            {
              "key": [28, "Power Tools", "power-tools", 27, 1],
              "doc_count": 1
            }
          ]
        }
      }
    }
  }
}
```

**What we actually get** (because nested fails):

```json
{
  "aggregations": {
    "category_siblings": {
      "doc_count": 0,  ← Empty!
      "filtered": {
        "doc_count": 0,
        "categories": {
          "buckets": []  ← No results!
        }
      }
    }
  }
}
```

---

## 4. RESPONSE FORMATTING

### Step 4.1: Format Aggregations

**File**: `src/features/smart-filters/formatters/SmartFilterFormatter.ts`, Lines 85-150

```typescript
function formatSmartFilterResponse(aggregations, currentCategory, activeFilters, totalHits) {
  return {
    success: true,
    filters: {
      categories: formatCategoryFilters(aggregations, currentCategory),
      brands: formatBrandFilters(aggregations),
      priceRange: formatPriceFilters(aggregations),
      stock: formatStockFilters(aggregations),
      // ... other filters
    },
    totalProducts: totalHits
  };
}

function formatCategoryFilters(aggregations, currentCategory) {
  // Navigate nested structure: aggregation → filtered → categories → buckets
  const siblingAgg = aggregations.category_siblings as Record<string, unknown>;
  const childrenAgg = aggregations.category_children as Record<string, unknown>;

  // Extract filtered aggregation (inside nested)
  const siblingFiltered = siblingAgg?.filtered as Record<string, unknown>;
  const childrenFiltered = childrenAgg?.filtered as Record<string, unknown>;

  // Extract categories buckets
  const siblingCategories = siblingFiltered?.categories as { buckets?: AggBucket[] };
  const childrenCategories = childrenFiltered?.categories as { buckets?: AggBucket[] };

  const siblingsBuckets = siblingCategories?.buckets;  // ← EMPTY ARRAY
  const childrenBuckets = childrenCategories?.buckets; // ← EMPTY ARRAY

  return {
    siblings: formatCategoryBuckets(siblingsBuckets, currentCategory?.categoryId, ...),
    children: formatCategoryBuckets(childrenBuckets, undefined, ...)
  };
}

function formatCategoryBuckets(buckets, currentCategoryId, fullPath) {
  if (!buckets || buckets.length === 0) {
    return [];  // ← Returns empty because no buckets!
  }

  return buckets.map((bucket: AggBucket) => {
    const [categoryId, categoryName, categorySlug, parentId, categoryLevel] = bucket.key;

    return {
      categoryId,
      categoryName,
      categorySlug,
      parentId,
      categoryLevel,
      count: bucket.doc_count,
      navigationPath: buildNavigationPath(categorySlug, currentCategoryId, fullPath)
    };
  });
}
```

### Step 4.2: Return to Service

**File**: `src/features/smart-filters/services/SmartFilterService.ts`, Lines 135-145

```typescript
// After formatting
const response: SmartFilterResponse = {
  success: true,
  filters: {
    categories: {
      siblings: [],    // ← EMPTY!
      children: []     // ← EMPTY!
    },
    brands: [ ... ],
    priceRange: { min: 0, max: 20490 },
    stock: { inStock: 0, outOfStock: 24 },
    // ...
  },
  totalProducts: 24,
  diagnostics: { ... }
};

return response;
```

---

## 5. RENDER IN UI

### Step 5.1: Page Component Receives Data

**File**: `src/app/[locale]/[...categories]/page.tsx`

```typescript
const filterResponse = await SmartFilterService.getFilters({...});

// filterResponse.filters.categories.siblings = [] ← EMPTY
// filterResponse.filters.categories.children = [] ← EMPTY

return <CategoryView filters={filterResponse.filters} />;
```

### Step 5.2: UI Component Renders Empty Filter

**File**: `src/components/filters/SmartCategoryFilter.tsx`

```typescript
export function SmartCategoryFilter({ siblings, children }) {
  return (
    <div className="category-filter">
      <div className="siblings">
        {siblings.length > 0 ? (
          siblings.map(cat => (
            <CategoryLink key={cat.categoryId} category={cat} />
          ))
        ) : (
          <p>No categories found</p>  // ← USER SEES THIS!
        )}
      </div>

      <div className="children">
        {children.length > 0 ? (
          children.map(cat => (
            <CategoryLink key={cat.categoryId} category={cat} />
          ))
        ) : (
          <p>No subcategories found</p>
        )}
      </div>
    </div>
  );
}
```

---

## Root Cause: What's Wrong

**The Issue**: Using `nested` aggregation on a non-nested field

| Component          | Field Type                             | Current Code                                     | Result            |
| ------------------ | -------------------------------------- | ------------------------------------------------ | ----------------- |
| OpenSearch Mapping | `product_categories` = flattened array | `nested: { path: "product_categories" }`         | ❌ `doc_count: 0` |
| Query Building     | Should NOT use nested                  | Currently USES `nested: {...}`                   | ❌ No results     |
| Response           | Empty buckets                          | Tries to navigate `.filtered.categories.buckets` | ❌ Returns `[]`   |
| UI                 | Shows no categories                    | Renders "No categories found"                    | ❌ Empty filter   |

---

## How to Fix It

### Option 1: Use Regular Terms Aggregation (FAST FIX)

```typescript
// Instead of:
category_siblings: {
  nested: { path: "product_categories" },
  aggs: { ... }
}

// Use:
category_siblings: {
  terms: {
    field: "product_categories.categoryId",
    size: 100
  },
  aggs: {
    category_name: {
      terms: { field: "product_categories.categoryName.keyword", size: 1 }
    },
    category_slug: {
      terms: { field: "product_categories.categorySlug.keyword", size: 1 }
    },
    category_level: {
      terms: { field: "product_categories.categoryLevel", size: 1 }
    },
    parent_id: {
      terms: { field: "product_categories.parentId", size: 1 }
    }
  }
}
```

### Option 2: Create Separate Category Index (PROPER FIX)

Store categories in a separate index and query it directly instead of aggregating from products.

---

## Summary

| Phase           | File                               | Purpose                                 | Current Status                  |
| --------------- | ---------------------------------- | --------------------------------------- | ------------------------------- |
| **Request**     | `SmartFiltersPageAdapter.ts`       | Resolve category context & call service | ✅ Working                      |
| **Query Build** | `SmartFilterAggregationBuilder.ts` | Create aggregation query                | ❌ Using wrong aggregation type |
| **Execute**     | `SmartFilterService.ts`            | Send query to OpenSearch                | ✅ Working                      |
| **Format**      | `SmartFilterFormatter.ts`          | Parse response into UI format           | ❌ Getting empty results        |
| **Render**      | `SmartCategoryFilter.tsx`          | Display in UI                           | ❌ Shows empty                  |

**The fix must be in Step 2.2** - change the category aggregation type.
