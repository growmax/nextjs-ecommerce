# Sibling Categories - Complete Flow

## 1. ENTRY POINT: SmartFilterService.getFilters()

```typescript
async getFilters(request: SmartFilterRequest): Promise<SmartFilterResponse>
```

**Input:**
```typescript
{
  elasticIndex: "sandboxpgandproducts",
  currentCategory: {
    categoryId: 28,
    categoryName: "Power Tools",
    categorySlug: "power-tools",
    categoryLevel: 1,
    parentId: 27  // ← KEY: This determines siblings filter
  },
  activeFilters: { ... },
  context: { ... }
}
```

---

## 2. CALL SIBLINGS FETCH

```typescript
const [siblings, children, otherFiltersResult] = await Promise.all([
  this.fetchCategorySiblings(elasticIndex, currentCategory, context),  // ← HERE
  this.fetchCategoryChildren(elasticIndex, currentCategory, context),
  this.fetchOtherFilters(elasticIndex, currentCategory, activeFilters, context, bucketSize),
]);
```

---

## 3. BUILD SIBLING QUERY: buildSiblingCategoriesQuery()

**Function:** `src/features/smart-filters/queries/SmartFilterAggregationBuilder.ts:307`

```typescript
export function buildSiblingCategoriesQuery(
  currentCategory: CategoryContext | null
): Record<string, unknown>
```

### Input Analysis:
```
currentCategory = {
  categoryId: 28,
  categoryLevel: 1,      // ← NOT 0 (not root)
  parentId: 27           // ← NOT null (has parent)
}

Condition Check:
if (!currentCategory || currentCategory.parentId === null || currentCategory.categoryLevel === 0)
  ↓ FALSE
else
  ↓ TRUE → Use parentId filter
```

### Generated OpenSearch Query:

```json
{
  "from": 0,
  "size": 0,
  "query": {
    "bool": {
      "must": [
        { "term": { "is_published": 1 } },
        { "term": { "product_categories.parentId": 27 } }  ← SIBLING FILTER
      ],
      "must_not": [
        { "match": { "pg_index_name": { "query": "PrdGrp0*" } } },
        { "term": { "is_internal": true } }
      ]
    }
  },
  "aggs": {
    "sibling_categories": {
      "multi_terms": {
        "terms": [
          { "field": "product_categories.categoryId" },
          { "field": "product_categories.categoryName.keyword" },
          { "field": "product_categories.categorySlug.keyword" },
          { "field": "product_categories.parentId", "missing": -1 },
          { "field": "product_categories.categoryLevel" }
        ],
        "size": 100
      }
    }
  }
}
```

---

## 4. SEND REQUEST: fetchCategorySiblings()

**Function:** `src/features/smart-filters/services/SmartFilterService.ts:70`

```typescript
private async fetchCategorySiblings(
  elasticIndex: string,
  currentCategory: CategoryContext | null,
  context?: RequestContext
): Promise<CategoryFilterOption[]>
```

### Variables Used:

| Variable | Value | Type |
|----------|-------|------|
| `elasticIndex` | `"sandboxpgandproducts"` | string |
| `currentCategory` | `{ categoryId: 28, ... }` | CategoryContext |
| `query` | (OpenSearch query object) | Record<string, unknown> |
| `requestBody` | OpenSearch API format | OpenSearchRequestBody |
| `result` | API response | OpenSearchResponse |

### Request Body Built:

```typescript
const requestBody: OpenSearchRequestBody = {
  Elasticindex: "sandboxpgandproducts",
  ElasticBody: query,  // ← The sibling query from step 3
  ElasticType: "pgproduct",
  queryType: "search",
};
```

### API Call:

```typescript
const result = await this.callWith("", requestBody, {
  method: "POST",
  ...(context && { context }),
}) as OpenSearchResponse | null;
```

---

## 5. PARSE RESPONSE

```typescript
const buckets = result?.body?.aggregations?.sibling_categories as { buckets?: any[] };
return formatCategoryBuckets(buckets?.buckets || []);
```

### OpenSearch Response:

```json
{
  "aggregations": {
    "sibling_categories": {
      "buckets": [
        {
          "key": [28, "Power Tools", "power-tools", 27, 1],
          "doc_count": 1
        }
      ]
    }
  }
}
```

### Formatted Output:

```typescript
[
  {
    id: 28,
    name: "Power Tools",
    slug: "power-tools",
    parentId: 27,
    level: 1,
    docCount: 1,
    navigationPath: "/power-tools"
  }
]
```

---

## 6. FORMAT RESPONSE: formatSmartFilterResponse()

**Function:** `src/features/smart-filters/formatters/SmartFilterFormatter.ts:310`

```typescript
export function formatSmartFilterResponse(
  aggregations: Record<string, unknown>,
  currentCategory: CategoryContext | null,
  activeFilters: ActiveFilters,
  totalHits?: number,
  categoryData?: CategoryData  // ← Pre-fetched sibling/children data
): SmartFilterResponse
```

### Category Data Passed:

```typescript
const categoryData = {
  siblings: [
    { id: 28, name: "Power Tools", slug: "power-tools", parentId: 27, level: 1, ... }
  ],
  children: [...]
};
```

### Final Response:

```typescript
{
  success: true,
  filters: {
    categories: {
      siblings: [
        { id: 28, name: "Power Tools", slug: "power-tools", parentId: 27, level: 1, ... }
      ],
      children: [
        { id: 57, name: "Drills", slug: "drills", parentId: 28, level: 2, ... }
      ]
    },
    brands: { items: [...] },
    priceRange: { min: 0, max: 10000 },
    stock: { inStock: 50, outOfStock: 10 },
    ...
  },
  totalProducts: 100,
  diagnostics: {
    categoryContext: {
      level: 1,
      categoryId: 28,
      parentId: 27
    },
    ...
  }
}
```

---

## Key Variables & Functions Summary

### Query Building:
| Function | File | Line | Purpose |
|----------|------|------|---------|
| `buildSiblingCategoriesQuery()` | SmartFilterAggregationBuilder.ts | 307 | Builds OpenSearch query |
| `CATEGORY_MULTI_TERMS` | SmartFilterAggregationBuilder.ts | 289 | Multi-terms aggregation config |

### Service Execution:
| Function | File | Line | Purpose |
|----------|------|------|---------|
| `getFilters()` | SmartFilterService.ts | 133 | Main entry point |
| `fetchCategorySiblings()` | SmartFilterService.ts | 70 | Executes sibling query |
| `callWith()` | BaseService | - | Makes OpenSearch API call |

### Formatting:
| Function | File | Line | Purpose |
|----------|------|------|---------|
| `formatCategoryBuckets()` | SmartFilterFormatter.ts | 62 | Parses buckets to CategoryFilterOption |
| `formatSmartFilterResponse()` | SmartFilterFormatter.ts | 310 | Final response formatting |

---

## Filter Logic Decision Tree

```
currentCategory exists?
├─ NO (Homepage)
│  └─ Siblings = categoryLevel: 0
│
└─ YES
   ├─ parentId is null OR categoryLevel === 0?
   │  ├─ YES (Root category like "Tools")
   │  │  └─ Siblings = categoryLevel: 0
   │  │
   │  └─ NO (Non-root like "Power Tools")
   │     └─ Siblings = parentId: <current_parent_id>  ← YOUR CASE
```

---

## Example: Power Tools Page

**Current Category:**
```
{
  categoryId: 28,
  categoryName: "Power Tools",
  categoryLevel: 1,
  parentId: 27
}
```

**Query Condition Met:**
```
!currentCategory? NO
currentCategory.parentId === null? NO
currentCategory.categoryLevel === 0? NO

→ Execute: { term: { "product_categories.parentId": 27 } }
```

**Result:**
```
All categories where parentId = 27
= All siblings of Power Tools
= Other children of "Tools" (id: 27)
```

