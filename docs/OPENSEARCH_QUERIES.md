# OpenSearch Query Patterns Documentation

This document describes all OpenSearch query patterns used in the nextjs-ecommerce application for browse pages, product detail pages, and product search functionality.

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Request Format](#request-format)
4. [Query Types](#query-types)
   - [Product Search](#product-search)
   - [Browse Queries](#browse-queries)
   - [Product Detail](#product-detail)
5. [Query Builders](#query-builders)
6. [Response Format](#response-format)
7. [Examples](#examples)
8. [Common Patterns](#common-patterns)

## Overview

The application uses OpenSearch (compatible with Elasticsearch) for:

- **Browse Pages**: Filtering products by category, subcategory, major category, brand, or product group
- **Product Search**: Full-text search across product fields
- **Product Detail**: Fetching individual product information

All queries are sent to the OpenSearch API through an invocations endpoint that accepts a standardized request format.

## API Endpoints

### OpenSearch Endpoint (All Queries)

- **URL**: `https://api.myapptino.com/opensearch/invocations`
- **Method**: `POST`
- **Use Case**: All OpenSearch queries including:
  - Product search queries (`queryType: "search"`)
  - Browse queries (`queryType: "search"`)
  - Product detail queries (`queryType: "get"`)

**Note**: All queries now use the OpenSearch endpoint. The Elasticsearch endpoint is deprecated.

## Request Format

All OpenSearch requests follow this structure:

```typescript
{
  Elasticindex: string; // Index name (e.g., "tenantcodepgandproducts")
  ElasticBody: object | string; // Query object for search, identifier string for get
  ElasticType: string; // Document type (default: "pgproduct")
  queryType: "search" | "get"; // Query operation type
}
```

### Headers

```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>",  // Optional
  "x-tenant": "<tenant-code>",        // Optional
  "x-company-id": "<company-id>",     // Optional
  "x-user-id": "<user-id>"            // Optional
}
```

## Query Types

### Product Search

**Purpose**: Full-text search across product fields with relevance scoring.

**Query Type**: `search`

**Query Builder**: `buildProductSearchQuery(searchText: string)`

**Location**: `src/utils/elasticsearch/search-queries.ts`

**Query Structure**:

```typescript
{
  size: 24,
  _source: [
    "brandProductId",
    "productShortDescription",
    "productAssetss",
    "brandsName",
    "productsSubCategories.subCategoryName",
    "productId",
    "productIndexName",
    "ean",
    "keywords",
    "b2CUnitListPrice",
    "b2CDiscountPrice"
  ],
  query: {
    bool: {
      minimum_should_match: 1,
      must: [
        {
          term: {
            isPublished: 1
          }
        }
      ],
      should: [
        {
          query_string: {
            query: "<sanitized-search-text>",
            analyzer: "my_analyzer",
            analyze_wildcard: true,
            auto_generate_phrase_queries: true,
            default_operator: "AND",
            fields: [
              "name",
              "keywords^8",
              "brandProductId^5",
              "productShortDescription^9",
              "description",
              "pgName",
              "variantAttributeses.name",
              "productSeries",
              "brandsName",
              "variantAttributeses.options",
              "productSpecifications.key",
              "productSpecifications.value",
              "productGroupSpecifications.key",
              "productGroupSpecifications.value",
              "productsSubCategories.categoryName",
              "productsSubCategories.subCategoryName",
              "productsSubCategories.majorCategoryName",
              "ean"
            ],
            boost: 200
          }
        },
        {
          multi_match: {
            query: "<search-text>",
            type: "phrase_prefix",
            boost: 190,
            fields: [/* same fields as above */]
          }
        },
        {
          multi_match: {
            query: "<search-text>",
            type: "cross_fields",
            minimum_should_match: "90%",
            analyzer: "my_analyzer",
            boost: 98,
            fields: [
              "brandsName",
              "productsSubCategories.categoryName",
              "productsSubCategories.subCategoryName",
              "productsSubCategories.majorCategoryName"
            ]
          }
        },
        {
          multi_match: {
            query: "<search-text>",
            type: "best_fields",
            analyzer: "my_analyzer",
            fields: [/* same fields as above */]
          }
        }
      ],
      must_not: [
        {
          match: {
            prodgrpIndexName: {
              query: "PrdGrp0*"
            }
          }
        },
        {
          term: {
            internal: true
          }
        }
      ]
    }
  }
}
```

**Usage**:

```typescript
import { buildProductSearchQuery } from "@/utils/elasticsearch/search-queries";
import SearchService from "@/lib/api/services/SearchService/SearchService";

const query = buildProductSearchQuery("drill");
const results = await SearchService.searchProducts({
  elasticIndex: "tenantcodepgandproducts",
  query,
  context: {
    accessToken: "token", // Optional
    tenantCode: "tenant", // Optional
  },
});
```

### Browse Queries

**Purpose**: Filter products by category hierarchy, brand, or product group.

**Query Type**: `search`

**Query Builders**: Located in `src/utils/opensearch/browse-queries.ts`

#### Category Query

**Function**: `buildCategoryQuery(categoryId: number, options?: BrowseQueryOptions)`

**Query Structure**:

```typescript
{
  from: 0,  // (page - 1) * pageSize
  size: 20,
  query: {
    bool: {
      must: [
        {
          term: {
            isPublished: 1
          }
        },
        {
          term: {
            "productsSubCategories.categoryId": <categoryId>
          }
        }
        // ... additional filters
      ],
      must_not: [
        {
          match: {
            prodgrpIndexName: {
              query: "PrdGrp0*"
            }
          }
        },
        {
          term: {
            internal: true
          }
        }
      ]
    }
  },
  sort: [/* optional sort configuration */]
}
```

**Usage**:

```typescript
import { buildCategoryQuery } from "@/utils/opensearch/browse-queries";
import SearchService from "@/lib/api/services/SearchService/SearchService";

const { query } = buildCategoryQuery(123, {
  page: 1,
  pageSize: 20,
  sortBy: {
    sortBy: 2, // Price: Low to High
  },
  catalogCodes: ["CAT001"],
});

const results = await SearchService.searchProducts({
  elasticIndex: "tenantcodepgandproducts",
  query,
});
```

#### Subcategory Query

**Function**: `buildSubCategoryQuery(subCategoryId: number, options?: BrowseQueryOptions)`

**Filter Field**: `productsSubCategories.subCategoryId`

#### Major Category Query

**Function**: `buildMajorCategoryQuery(majorCategoryId: number, options?: BrowseQueryOptions)`

**Filter Field**: `productsSubCategories.majorCategoryId`

#### Brand Query

**Function**: `buildBrandQuery(brandName: string, options?: BrowseQueryOptions)`

**Filter Field**: `brandsName.keyword`

**Note**: Brand name must match exactly (case-sensitive).

#### Product Group Query

**Function**: `buildProductGroupQuery(productGroupId: number, options?: BrowseQueryOptions)`

**Filter Field**: `productGroupId`

#### Slug-based Query

**Function**: `buildQueryFromSlug(slug: string, options?: BrowseQueryOptions)`

Supports URL slug patterns:

- `m_{majorCategoryId}` - Major category
- `c_{categoryId}` - Category
- `s_{subCategoryId}` - Subcategory
- `b_{brandName}` - Brand
- `pg_{productGroupId}` - Product group

**Usage**:

```typescript
import { buildQueryFromSlug } from "@/utils/opensearch/browse-queries";

const { query } = buildQueryFromSlug("c_123", {
  page: 1,
  pageSize: 20,
});
```

### Product Detail

**Purpose**: Fetch a single product by identifier.

**Query Type**: `get`

**Service**: `OpenSearchService.getProduct()`

**Location**: `src/lib/api/services/OpenSearchService/OpenSearchService.ts`

**Request Structure**:

```typescript
{
  Elasticindex: "<index-name>",
  ElasticBody: "<product-index-name>",  // e.g., "Prod0000000001"
  ElasticType: "pgproduct",
  queryType: "get"
}
```

**Usage**:

```typescript
import OpenSearchService from "@/lib/api/services/OpenSearchService/OpenSearchService";

const product = await OpenSearchService.getProduct(
  "Prod0000000001",
  "tenantcodepgandproducts",
  "pgproduct",
  "get"
);
```

**Response Structure**:

```typescript
{
  body: {
    _source: {
      // Product data
    },
    _id: "<document-id>",
    found: true
  },
  statusCode: 200
}
```

## Query Builders

### Browse Query Options

```typescript
interface BrowseQueryOptions {
  page?: number; // Page number (1-based, default: 1)
  pageSize?: number; // Results per page (default: 20)
  sortBy?: {
    sortBy?: number; // 1=relevance, 2=price-asc, 3=price-desc, 4=field-asc, 5=field-desc
    sortByField?: string; // Field name for custom sorting (when sortBy is 4 or 5)
  };
  filters?: Record<string, string[]>; // Additional filters
  catalogCodes?: string[]; // Catalog codes for filtering
  equipmentCodes?: string[]; // Equipment codes for filtering
}
```

### Sort Options

| sortBy | Description              | Sort Field                     |
| ------ | ------------------------ | ------------------------------ |
| 1      | Relevance (default)      | `_score`                       |
| 2      | Price: Low to High       | `unitListPrice` (asc)          |
| 3      | Price: High to Low       | `unitListPrice` (desc)         |
| 4      | Custom Field: Ascending  | `{sortByField}.keyword` (asc)  |
| 5      | Custom Field: Descending | `{sortByField}.keyword` (desc) |

## Response Format

### Search Response

```typescript
{
  hits: {
    hits: [
      {
        _source: {
          // Product data
        },
        _id: "<document-id>",
        _score: <relevance-score>
      }
    ],
    total: {
      value: <total-count>,
      relation: "eq"
    }
  }
}
```

### Get Response

```typescript
{
  body: {
    _source: {
      // Product data
    },
    _id: "<document-id>",
    found: true
  },
  statusCode: 200
}
```

## Examples

### Example 1: Search for Products

```typescript
import { buildProductSearchQuery } from "@/utils/elasticsearch/search-queries";
import SearchService from "@/lib/api/services/SearchService/SearchService";

const query = buildProductSearchQuery("cordless drill");
const results = await SearchService.searchProducts({
  elasticIndex: "tenantcodepgandproducts",
  query,
  context: {
    accessToken: "token",
    tenantCode: "tenant",
  },
});

console.log(`Found ${results.total} products`);
console.log(results.data); // Array of products
```

### Example 2: Browse by Category with Filters

```typescript
import { buildCategoryQuery } from "@/utils/opensearch/browse-queries";
import SearchService from "@/lib/api/services/SearchService/SearchService";

const { query } = buildCategoryQuery(123, {
  page: 1,
  pageSize: 24,
  sortBy: {
    sortBy: 2, // Price: Low to High
  },
  filters: {
    brands: ["DEWALT", "Milwaukee"],
  },
  catalogCodes: ["CAT001"],
});

const results = await SearchService.searchProducts({
  elasticIndex: "tenantcodepgandproducts",
  query,
});
```

### Example 3: Get Product Detail

```typescript
import OpenSearchService from "@/lib/api/services/OpenSearchService/OpenSearchService";

const product = await OpenSearchService.getProduct(
  "Prod0000000001",
  "tenantcodepgandproducts",
  "pgproduct",
  "get",
  {
    accessToken: "token",
    tenantCode: "tenant",
  }
);

if (product) {
  console.log(product.productShortDescription);
}
```

### Example 4: Browse by Brand with Pagination

```typescript
import { buildBrandQuery } from "@/utils/opensearch/browse-queries";
import SearchService from "@/lib/api/services/SearchService/SearchService";

const { query } = buildBrandQuery("DEWALT", {
  page: 2,
  pageSize: 20,
  sortBy: {
    sortBy: 3, // Price: High to Low
  },
});

const results = await SearchService.searchProducts({
  elasticIndex: "tenantcodepgandproducts",
  query,
});
```

## Common Patterns

### Pattern 1: Base Query Structure

All browse queries include:

- `isPublished: 1` filter in `must` clause
- Exclusion of `prodgrpIndexName: "PrdGrp0*"` in `must_not`
- Exclusion of `internal: true` products in `must_not`

### Pattern 2: Catalog/Equipment Code Filtering

```typescript
{
  terms: {
    "catalogCode.keyword": ["CAT001", "CAT002", "EQ001"]
  }
}
```

### Pattern 3: Multiple Filter Values (OR)

When a filter has multiple values, they are combined with `should`:

```typescript
{
  bool: {
    should: [
      { term: { "brandsName.keyword": "DEWALT" } },
      { term: { "brandsName.keyword": "Milwaukee" } }
    ],
    minimum_should_match: 1
  }
}
```

### Pattern 4: Single Filter Value (AND)

When a filter has a single value, it's added directly to `must`:

```typescript
{
  term: {
    "brandsName.keyword": "DEWALT"
  }
}
```

## Field Reference

### Common Product Fields

| Field                     | Type    | Description                                 |
| ------------------------- | ------- | ------------------------------------------- |
| `productId`               | number  | Unique product ID                           |
| `productIndexName`        | string  | Product index name (e.g., "Prod0000000001") |
| `brandProductId`          | string  | Brand product identifier                    |
| `productShortDescription` | string  | Product short description                   |
| `productAssetss`          | array   | Product images/assets                       |
| `brandsName`              | string  | Brand name                                  |
| `b2CUnitListPrice`        | number  | B2C list price                              |
| `b2CDiscountPrice`        | number  | B2C discount price                          |
| `isPublished`             | number  | Publication status (1 = published)          |
| `internal`                | boolean | Internal product flag                       |

### Category Fields

| Field                                     | Type   | Description         |
| ----------------------------------------- | ------ | ------------------- |
| `productsSubCategories.categoryId`        | number | Category ID         |
| `productsSubCategories.categoryName`      | string | Category name       |
| `productsSubCategories.subCategoryId`     | number | Subcategory ID      |
| `productsSubCategories.subCategoryName`   | string | Subcategory name    |
| `productsSubCategories.majorCategoryId`   | number | Major category ID   |
| `productsSubCategories.majorCategoryName` | string | Major category name |

## Testing

### Verification Script

Run the verification script to test all query types:

```bash
export ELASTIC_INDEX=your_index_name
export ACCESS_TOKEN=your_token  # Optional
npx tsx scripts/verify-opensearch-queries.ts
```

### Unit Tests

Run unit tests for query structure verification:

```bash
npm test -- OpenSearchService.verification.test.ts
```

## Troubleshooting

### Common Issues

1. **No results returned**
   - Verify `ELASTIC_INDEX` is correct
   - Check if products are published (`isPublished: 1`)
   - Ensure products are not internal (`internal: false`)

2. **Query format errors**
   - Verify `Elasticindex` field name (capital E, lowercase i)
   - Check `queryType` is "search" or "get"
   - Ensure `ElasticType` is "pgproduct"

3. **Authentication errors**
   - Verify `ACCESS_TOKEN` is valid
   - Check `x-tenant` header matches index tenant

4. **Field mapping errors**
   - Verify field names match OpenSearch index mapping
   - Check if `.keyword` suffix is needed for exact matches

## OpenSearch Backend Implementation (Go)

### Architecture Overview

The OpenSearch backend is implemented in Go (`/opensearch/growmax_opensearch/`):

**Key Components:**

- **API Server**: `api/server.go` - Main HTTP server using Gin framework
- **Router**: `router/router.go` - Route definitions
- **Controller**: `controller/catalog.go` - Request handlers
- **Service Layer**: `service/` - Business logic for catalog operations
  - `ProductConverter.go` - Product data transformation and indexing
  - `ProductSubUpdate.go` - Product attribute updates
- **Models**: `Model/ElasticProductDTO.go` - OpenSearch document structure
- **Index Mapping**: `api/elasticsearch/opensearch_indexes.go` - OpenSearch index schema

### Request Parameter Structure

All OpenSearch API requests use this structure (verified from backend code):

```json
{
  "Elasticindex": "tenantcodepgandproducts",  // Index name (capital E, lowercase i)
  "ElasticBody": { /* query object */ },      // Query body for search operations
  "ElasticType": "pgproduct",                 // Document type
  "queryType": "search" | "get"               // Operation type
}
```

**Parameter Naming (Verified from Backend):**

- ✅ `Elasticindex` (capital E, lowercase i) - **CORRECT**
- ✅ `ElasticBody` (capital E, capital B) - **CORRECT**
- ✅ `ElasticType` (capital E, capital T) - **CORRECT**
- ✅ `queryType` (lowercase) - **CORRECT**

### Frontend Implementation (TypeScript/Next.js)

**Service Layer:**

- **OpenSearchService**: `src/lib/api/services/OpenSearchService/OpenSearchService.ts`
  - Handles single product retrieval (`getProduct`, `getProductServerSide`, `getProductCached`)
  - Uses `queryType: "get"` for product detail queries
- **SearchService**: `src/lib/api/services/SearchService/SearchService.ts`
  - Handles product search operations (`searchProducts`, `searchProductsByText`)
  - Uses `queryType: "search"` for search queries
  - Supports catalog/equipment code filtering

**Query Builders:**

- **Browse Queries**: `src/utils/opensearch/browse-queries.ts`
  - `buildCategoryQuery()`, `buildSubCategoryQuery()`, `buildMajorCategoryQuery()`
  - `buildBrandQuery()`, `buildProductGroupQuery()`, `buildQueryFromSlug()`
- **Search Queries**: `src/utils/elasticsearch/search-queries.ts`
  - `buildProductSearchQuery()` - Full-text search with relevance scoring

**Request Structure (Verified from Implementation):**

All requests use this exact structure (confirmed from `OpenSearchService.ts` and `SearchService.ts`):

```typescript
{
  Elasticindex: string; // Index name (e.g., "tenantcodepgandproducts")
  ElasticBody: object | string; // Query object for search, identifier string for get
  ElasticType: string; // Document type (default: "pgproduct")
  queryType: "search" | "get" | "update" | "delete"; // Query operation type
}
```

**Parameter Naming Convention:**

- ✅ `Elasticindex` (capital E, lowercase i) - **CORRECT**
- ✅ `ElasticBody` (capital E, capital B) - **CORRECT**
- ✅ `ElasticType` (capital E, capital T) - **CORRECT**
- ✅ `queryType` (lowercase q, lowercase t) - **CORRECT**

### OpenSearch Document Model (Actual Field Names)

The product documents in OpenSearch use **camelCase** field names (from `Model/ElasticProductDTO.go` and `api/elasticsearch/opensearch_indexes.go`):

**Important Field Naming Convention:**

- **Database Column**: `Brand_Product_ID` (snake_case, uppercase)
- **OpenSearch JSON Field**: `brandProductId` (camelCase)
- **For Exact Match Queries**: `brandProductId.keyword` (use `.keyword` suffix)

**Field Mapping Examples:**
| Database Column | OpenSearch Field | Query Field (Exact Match) |
|----------------|------------------|---------------------------|
| `Brand_Product_ID` | `brandProductId` | `brandProductId.keyword` |
| `Product_Short_Description` | `productShortDescription` | `productShortDescription.keyword` |
| `Brands_Name` | `brandsName` | `brandsName.keyword` |
| `Product_Group_ID` | `productGroupId` | `productGroupId` (long type) |
| `IsPublished` | `isPublished` | `isPublished` (long type) |
| `is_Internal` | `internal` | `internal` (boolean type) |

The complete product document structure:

```typescript
interface ElasticProduct {
  productId: number;
  productIndexName: string; // e.g., "Prod0000000001"
  pgIndexName: string; // Product group index name
  brandProductId: string;
  productShortDescription: string;
  productDescription: string;
  brandsName: string;
  productGroupId: number;

  // Pricing (camelCase)
  unitListPrice: number; // From database: Unit_List_Price
  b2CUnitListPrice: number; // B2C list price
  b2CDiscountPrice: number; // B2C discount price
  defaultDiscountPrice: number;
  unitMrp: number; // From database: Unit_MRP
  unitQuantity: number; // From database: Unit_Quantity
  unitOfMeasure: string; // From database: Unit_Of_Measure

  // Categories (array)
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

  // Assets
  productAssetss: Array<{
    type: string;
    source: string;
    height: string;
    width: string;
    isDefault: boolean;
  }>;

  // Specifications
  productSpecifications: Array<{
    key: string; // Specification name
    value: string; // Specification value
  }>;

  // Accessories
  productAccessorieses: Array<{
    accessoryProductId: number;
    accessoryProductGroupId: number;
    isFrequentlyBought: boolean;
  }>;

  // Attributes
  productAttributes: Record<string, string[]>;

  // Metadata (camelCase)
  isPublished: number; // From database: IsPublished (1 = published, 0 = not published)
  internal: boolean; // From database: is_Internal → internal
  internalProduct: boolean; // Alternative internal flag
  catalogCode: string[]; // Array of catalog codes
  keywords: string; // From database: Keywords
  ean: string; // From database: EAN
  upc: string; // From database: UPC
  hsnCode: string; // From database: HSN_Code → hsnCode
  hsnId: number; // HSN ID
  hsnDescription: string; // HSN description

  // Additional fields
  hsnCode: string;
  hsnId: number;
  leadUOM: string;
  standardLeadTime: string;
  // ... many more fields
}
```

### API Client Configuration

**OpenSearch Client**: `src/lib/api/client.ts`

- Base URL: `https://api.myapptino.com/opensearch/invocations`
- Method: `POST`
- Content-Type: `application/json`

**Headers:**

```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>",      // Optional
  "x-tenant": "<tenant-code>",            // Optional
  "x-company-id": "<company-id>",         // Optional
  "x-user-id": "<user-id>"                 // Optional
}
```

### Request/Response Flow

1. **Frontend Request**:

   ```typescript
   const request = {
     Elasticindex: "tenantcodepgandproducts",
     queryType: "search",
     ElasticType: "pgproduct",
     ElasticBody: {
       /* OpenSearch query */
     },
   };
   ```

2. **API Gateway** (if applicable):
   - Routes to OpenSearch backend service
   - May add authentication/authorization headers

3. **OpenSearch Backend**:
   - Processes request
   - Executes query against OpenSearch cluster
   - Returns formatted response

4. **Frontend Response**:
   ```typescript
   {
     hits: {
       hits: Array<{ _source: ElasticProduct, _id: string, _score: number }>,
       total: { value: number, relation: "eq" }
     }
   }
   ```

## Migration Notes

### From Old Buyer-FE

The query patterns are based on the old buyer-fe implementation:

- `ProductUtils()` → `buildCategoryQuery()`, `buildSubCategoryQuery()`, etc.
- `serchquery()` → `buildProductSearchQuery()`
- `BuildQueryWithFilters()` → Integrated into browse query builders

Key differences:

- New implementation uses TypeScript with proper types
- Query builders are modular and reusable
- Better error handling and validation
- Consistent with SearchService and OpenSearchService patterns

## Complete Reference

### Request Parameter Reference

| Parameter      | Type             | Required | Description                               | Example                                  |
| -------------- | ---------------- | -------- | ----------------------------------------- | ---------------------------------------- |
| `Elasticindex` | string           | Yes      | OpenSearch index name                     | `"tenantcodepgandproducts"`              |
| `ElasticBody`  | object \| string | Yes      | Query object (search) or identifier (get) | `{ query: {...} }` or `"Prod0000000001"` |
| `ElasticType`  | string           | Yes      | Document type                             | `"pgproduct"`                            |
| `queryType`    | string           | Yes      | Operation type                            | `"search"` or `"get"`                    |

### Query Type Reference

| queryType  | ElasticBody Type | Use Case                         |
| ---------- | ---------------- | -------------------------------- |
| `"search"` | object           | Product search, browse queries   |
| `"get"`    | string           | Get single product by identifier |
| `"update"` | object           | Update product (backend only)    |
| `"delete"` | string           | Delete product (backend only)    |

### Field Name Reference (Backend → OpenSearch)

**Critical**: OpenSearch uses **camelCase** field names, not snake_case. Always use camelCase in queries.

| Database Column             | OpenSearch Field          | Type    | Query for Exact Match             |
| --------------------------- | ------------------------- | ------- | --------------------------------- |
| `Brand_Product_ID`          | `brandProductId`          | text    | `brandProductId.keyword`          |
| `Product_Short_Description` | `productShortDescription` | text    | `productShortDescription.keyword` |
| `Product_Description`       | `productDescription`      | text    | `productDescription.keyword`      |
| `Brands_Name`               | `brandsName`              | text    | `brandsName.keyword`              |
| `Product_Group_ID`          | `productGroupId`          | long    | `productGroupId`                  |
| `IsPublished`               | `isPublished`             | long    | `isPublished`                     |
| `is_Internal`               | `internal`                | boolean | `internal`                        |
| `EAN`                       | `ean`                     | text    | `ean.keyword`                     |
| `UPC`                       | `upc`                     | text    | `upc.keyword`                     |
| `HSN_Code`                  | `hsnCode`                 | text    | `hsnCode.keyword`                 |
| `Unit_List_Price`           | `unitListPrice`           | float   | `unitListPrice`                   |
| `Unit_MRP`                  | `unitMrp`                 | float   | `unitMrp`                         |
| `Keywords`                  | `keywords`                | text    | `keywords.keyword`                |
| `prodgrpIndexName`          | `prodgrpIndexName`        | text    | `prodgrpIndexName.keyword`        |

**Key Rules:**

1. **Text fields** require `.keyword` suffix for exact match queries (term, terms)
2. **Numeric fields** (long, float) can be queried directly without `.keyword`
3. **Boolean fields** can be queried directly
4. **Array fields** like `catalogCode` use `.keyword` for exact match: `catalogCode.keyword`

**Example Query:**

```json
{
  "query": {
    "term": {
      "brandProductId.keyword": "BP12345"
    }
  }
}
```

### Index Naming Convention

Index names follow the pattern: `{tenantCode}pgandproducts`

Example: `"growmaxpgandproducts"` for tenant code "growmax"

### Response Parsing

The frontend uses `extractOpenSearchData()` utility (`src/utils/opensearch/response-parser.ts`) to:

- Extract `_source` from search responses
- Extract `body._source` from get responses
- Handle error cases gracefully
