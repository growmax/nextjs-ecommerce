# Smart Filter Category Implementation - Complete Explanation

## Overview

This document explains how the category siblings and children are fetched and rendered in the Smart Filter system.

---

## 🔄 Complete Data Flow (Step by Step)

### STEP 1: User Visits Page

```
User visits: /en/tools
              ↓
Next.js Router extracts category slug: "tools"
              ↓
CategoryResolutionService looks up "tools" in database
              ↓
Gets category object: { id: 27, name: "Tools", level: 0, parentId: null }
```

**File**: `src/lib/services/CategoryResolutionService.ts`

---

### STEP 2: Request Aggregations

```
SmartFilterService.ts receives request:
{
  currentCategory: {
    categoryId: 27,
    categoryName: "Tools",
    categoryLevel: 0,
    parentId: null,
    fullPath: ["tools"]
  },
  activeFilters: { ... },
  context: "category"
}
              ↓
Calls: buildSmartFilterAggregationQuery()
```

**File**: `src/features/smart-filters/services/SmartFilterService.ts` (lines 60-95)

---

### STEP 3: Build OpenSearch Query

```
buildSmartFilterAggregationQuery() creates query with:

{
  size: 0,  // We only want aggregations, not products
  query: {
    bool: {
      must: [
        { term: { "is_published": 1 } }
      ],
      must_not: [...]
    }
  },
  aggs: {
    category_siblings: { ... },      ← Aggregation 1
    category_children: { ... },      ← Aggregation 2
    brand_filter_context: { ... },
    price_filter_context: { ... },
    ...
  }
}
```

**File**: `src/features/smart-filters/queries/SmartFilterAggregationBuilder.ts` (lines 290-350)

---

### STEP 4: Category Aggregation Query Details

#### A. SIBLINGS Aggregation

```typescript
category_siblings: {
  terms: {
    field: "product_categories.categoryId",  // Get unique category IDs
    size: 100
  },
  aggs: {
    category_name: {
      terms: {
        field: "product_categories.categoryName.keyword",
        size: 1  // Get 1 name per category ID
      }
    },
    category_slug: {
      terms: {
        field: "product_categories.categorySlug.keyword",
        size: 1
      }
    },
    category_level: {
      terms: {
        field: "product_categories.categoryLevel",
        size: 1
      }
    },
    parent_id: {
      terms: {
        field: "product_categories.parentId",
        size: 1,
        missing: 0  // Default to 0 if not set
      }
    }
  }
}
```

#### B. CHILDREN Aggregation

```typescript
category_children: {
  // Same structure as siblings
  // Both use the same query because filtering happens on client-side
}
```

**Why same query for both?**

- Product_categories is a **flattened array** (not nested in ES)
- Can't filter inside the aggregation (no nested context)
- OpenSearch returns ALL categories from matching products
- Client-side filtering extracts what we need

---

### STEP 5: OpenSearch Response Structure

```json
{
  "aggregations": {
    "category_siblings": {
      "buckets": [
        {
          "key": 27, // categoryId
          "doc_count": 3, // 3 products have this category
          "category_name": {
            "buckets": [{ "key": "Tools", "doc_count": 3 }]
          },
          "category_slug": {
            "buckets": [{ "key": "tools", "doc_count": 3 }]
          },
          "category_level": {
            "buckets": [{ "key": 0, "doc_count": 3 }]
          },
          "parent_id": {
            "buckets": [{ "key": 0, "doc_count": 3 }]
          }
        },
        {
          "key": 29, // Lawn & Garden
          "doc_count": 2,
          "category_name": { "buckets": [{ "key": "Lawn & Garden" }] },
          "category_slug": { "buckets": [{ "key": "lawn-garden" }] },
          "category_level": { "buckets": [{ "key": 0 }] },
          "parent_id": { "buckets": [{ "key": 0 }] }
        },
        {
          "key": 28, // Power Tools (child)
          "doc_count": 1,
          "category_name": { "buckets": [{ "key": "Power Tools" }] },
          "category_slug": { "buckets": [{ "key": "power-tools" }] },
          "category_level": { "buckets": [{ "key": 1 }] },
          "parent_id": { "buckets": [{ "key": 27 }] }
        }
        // ... more categories
      ]
    },
    "category_children": {
      "buckets": [
        /* same structure */
      ]
    }
  }
}
```

**File**: Returned from `BaseService` (OpenSearch client)

---

### STEP 6: Format Response in SmartFilterFormatter

```typescript
function formatCategoryFilters(aggregations, currentCategory) {
  // STEP 6a: Extract raw buckets
  const siblingsBuckets = aggregations.category_siblings.buckets;
  const childrenBuckets = aggregations.category_children.buckets;

  // STEP 6b: Filter buckets based on category context
  const filteredSiblings = filterCategoryBucketsFromTerms(
    siblingsBuckets,
    currentCategory, // { categoryId: 27, categoryLevel: 0, ... }
    "siblings"
  );

  const filteredChildren = filterCategoryBucketsFromTerms(
    childrenBuckets,
    currentCategory,
    "children"
  );

  // STEP 6c: Map to CategoryFilterOption format
  const siblings = filteredSiblings.map(bucket => ({
    id: bucket.key, // 27
    name: bucket.category_name.buckets[0].key, // "Tools"
    slug: bucket.category_slug.buckets[0].key, // "tools"
    parentId: bucket.parent_id.buckets[0].key, // 0
    level: bucket.category_level.buckets[0].key, // 0
    docCount: bucket.doc_count, // 3
    navigationPath: "/{slug}", // "/tools"
  }));

  return { siblings, children };
}
```

**File**: `src/features/smart-filters/formatters/SmartFilterFormatter.ts` (lines 85-200)

---

### STEP 7: Client-Side Filtering Logic

```typescript
function filterCategoryBucketsFromTerms(buckets, currentCategory, type) {
  // Case 1: No category selected (root level)
  if (!currentCategory) {
    if (type === "siblings") {
      return buckets.filter(b => b.category_level.buckets[0].key === 0);
      // ↑ Get LEVEL 0 categories (Tools, Lawn & Garden, etc.)
    } else {
      return buckets.filter(b => b.category_level.buckets[0].key === 1);
      // ↑ Get LEVEL 1 categories (direct children of level 0)
    }
  }

  // Case 2: On a Level 0 category page (e.g., /tools)
  if (currentCategory.categoryLevel === 0) {
    if (type === "siblings") {
      return buckets.filter(b => b.category_level.buckets[0].key === 0);
      // ↑ Show ALL level 0 siblings (Tools, Lawn & Garden, etc.)
    } else {
      return buckets.filter(
        b => b.parent_id.buckets[0].key === currentCategory.categoryId
      );
      // ↑ Show children where parentId = 27 (Power Tools, etc.)
    }
  }

  // Case 3: On a Level > 0 category page (e.g., /tools/power-tools)
  if (type === "siblings") {
    return buckets.filter(
      b => b.parent_id.buckets[0].key === currentCategory.parentId
    );
    // ↑ Show siblings with same parent (Power Tools, Hand Tools, etc.)
  } else {
    return buckets.filter(
      b => b.parent_id.buckets[0].key === currentCategory.categoryId
    );
    // ↑ Show children of current category
  }
}
```

---

### STEP 8: Return Formatted Response

```typescript
{
  success: true,
  categorySiblings: 2,    // Count of siblings returned
  categoryChildren: 1,    // Count of children returned
  categories: {
    siblings: [
      {
        id: 27,
        name: "Tools",
        slug: "tools",
        parentId: null,
        level: 0,
        docCount: 3,
        navigationPath: "/tools"
      },
      {
        id: 29,
        name: "Lawn & Garden",
        slug: "lawn-garden",
        parentId: null,
        level: 0,
        docCount: 2,
        navigationPath: "/lawn-garden"
      }
    ],
    children: [
      {
        id: 28,
        name: "Power Tools",
        slug: "power-tools",
        parentId: 27,
        level: 1,
        docCount: 1,
        navigationPath: "/tools/power-tools"
      }
    ]
  },
  brands: [...],
  priceRange: {...}
}
```

**File**: `src/features/smart-filters/services/SmartFilterService.ts` (line 135)

---

### STEP 9: Send to Frontend/UI

```typescript
// SmartFiltersPageAdapter.ts
const filterResponse = await SmartFilterService.getFilters(request);

return {
  success: true,
  filterData: filterResponse,
  categoryContext: {
    currentCategory: { id: 27, name: "Tools", ... },
    siblings: filterResponse.categories.siblings,
    children: filterResponse.categories.children
  }
}
```

**File**: `src/features/smart-filters/adapters/SmartFiltersPageAdapter.ts`

---

### STEP 10: Render on Page

```jsx
// Component receives the filterData
<SmartCategoryFilter
  siblings={filterData.categories.siblings} // [Tools, Lawn & Garden]
  children={filterData.categories.children} // [Power Tools]
  currentCategory={categoryContext}
/>

// Renders:
// SIBLINGS section:
//   □ Tools (active)
//   □ Lawn & Garden
//
// CHILDREN section:
//   □ Power Tools
```

**File**: `src/features/smart-filters/components/SmartCategoryFilter.tsx`

---

## 📊 Data Structure Mapping

```
OpenSearch Document (Product):
{
  "product_categories": [
    {
      "categoryId": 27,
      "categoryName": "Tools",
      "categorySlug": "tools",
      "categoryLevel": 0,
      "parentId": null
    },
    {
      "categoryId": 28,
      "categoryName": "Power Tools",
      "categorySlug": "power-tools",
      "categoryLevel": 1,
      "parentId": 27
    }
  ]
}

↓ OpenSearch Aggregation

Returns all unique:
- categoryId
- categoryName (via sub-aggregation)
- categorySlug (via sub-aggregation)
- categoryLevel (via sub-aggregation)
- parentId (via sub-aggregation)

↓ Client-Side Filtering

Filters by:
- Current category context (which category page we're on)
- Category level (0, 1, 2, 3, etc.)
- Parent ID (for siblings/children relationship)

↓ Final Output

{
  siblings: [Category, Category, ...],
  children: [Category, Category, ...]
}
```

---

## 🎯 Key Concepts

### 1. **Flattened Array Field**

```
product_categories is a FLATTENED ARRAY in OpenSearch
NOT a nested field

Difference:
- Nested: Can filter inside array elements
- Flattened: Returns all array elements from matching docs
```

### 2. **Terms Aggregation**

```
Buckets by: product_categories.categoryId
For each bucket, get metadata via sub-aggregations:
- What's the name? (category_name sub-agg)
- What's the slug? (category_slug sub-agg)
- What's the level? (category_level sub-agg)
- What's the parent? (parent_id sub-agg)
```

### 3. **Client-Side Filtering**

```
OpenSearch can't filter inside flattened arrays

Solution: Return ALL categories, filter on client-side

Example:
Sibling query returns: [27, 28, 29, 47, 57, ...]
Client filters to level 0 only: [27, 29] (Tools, Lawn & Garden)
```

### 4. **Navigation Path Building**

```
For siblings: Replace last part of current path
  Current: /tools/power-tools
  Sibling: /tools (replace "power-tools" with "tools")

For children: Append to current path
  Current: /tools
  Child: /tools/power-tools (append "power-tools")
```

---

## 📁 File Structure Summary

```
Smart Filter System:
├── SmartFilterAggregationBuilder.ts
│   └── buildCategoryAggregation()
│       └── Returns OpenSearch query structure
│
├── SmartFilterService.ts
│   └── getFilters()
│       ├── Sends query to OpenSearch
│       ├── Receives aggregation buckets
│       └── Calls formatter
│
├── SmartFilterFormatter.ts
│   ├── formatCategoryFilters()
│   │   ├── Extracts buckets
│   │   ├── Calls filterCategoryBucketsFromTerms()
│   │   └── Maps to UI format
│   │
│   └── filterCategoryBucketsFromTerms()
│       └── Filters by level/parentId
│
├── SmartFiltersPageAdapter.ts
│   └── getSmartFilters()
│       └── Server-side wrapper
│
└── SmartCategoryFilter.tsx
    └── Renders siblings + children
```

---

## 🔍 Example: /en/tools Page

### Input:

```
currentCategory = { categoryId: 27, categoryLevel: 0, categoryName: "Tools" }
```

### Query Built:

```json
{
  "size": 0,
  "query": { "bool": { "must": [{ "term": { "is_published": 1 } }] } },
  "aggs": {
    "category_siblings": {
      "terms": { "field": "product_categories.categoryId" }
    },
    "category_children": {
      "terms": { "field": "product_categories.categoryId" }
    }
  }
}
```

### OpenSearch Response:

```json
{
  "category_siblings": {
    "buckets": [
      { "key": 27, "category_level": { "buckets": [{ "key": 0 }] } },
      { "key": 28, "category_level": { "buckets": [{ "key": 1 }] } },
      { "key": 29, "category_level": { "buckets": [{ "key": 0 }] } }
    ]
  }
}
```

### Client-Side Filtering (SIBLINGS):

```
Filter: bucket.category_level.buckets[0].key === 0
Result: [27, 29] → [Tools, Lawn & Garden]
```

### Client-Side Filtering (CHILDREN):

```
Filter: bucket.parent_id.buckets[0].key === 27
Result: [28] → [Power Tools]
```

### Final Rendered Output:

```
SIBLINGS:
- Tools (id: 27)
- Lawn & Garden (id: 29)

CHILDREN:
- Power Tools (id: 28)
```

---

## ✅ Why This Works

1. **OpenSearch Query**: Gets ALL categories from published products
2. **Sub-aggregations**: Extract category metadata (name, slug, level, parent)
3. **Client-side Filtering**: Filters by level and parent ID based on context
4. **Navigation**: Builds correct URLs for category links
5. **Display**: Shows siblings and children appropriately

This approach works because:

- ✅ No nested field dependency
- ✅ Single aggregation query returns all data
- ✅ Flexible filtering logic on client
- ✅ Supports all category levels
- ✅ Efficient and performant
