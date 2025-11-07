# OpenSearch Product Storage Structure

This document describes how products are stored and structured in the OpenSearch index, based on actual API responses from the `schwingstetterpgandproducts` index.

## Overview

The OpenSearch index `schwingstetterpgandproducts` stores product data with comprehensive metadata, pricing, inventory, and relationship information. Each document represents a single product with all its associated data embedded within it.

## Document Structure

### Core Product Identification

```json
{
  "product_id": 64171,
  "product_group_id": 54518,
  "tenant_id": 0,
  "pg_name": "Milwakee PG ",
  "pg_index_name": "PrdGrp0000054518",
  "brand_id": 411,
  "brand_name": "Milwakee",
  "brand_product_id": "P000034"
}
```

### Product Description & Metadata

```json
{
  "product_short_description": "Milwaukee M18 FUEL 4-1/2 Inch-6 Inch Braking Grinder, Paddle Switch (Bare Tool)",
  "product_index_name": "Prod0000064171",
  "hsn_id": 148,
  "hsn_code": "84219900",
  "hsn_description": "Filter Components"
}
```

### Pricing Information

```json
{
  "unit_list_price": 5435,
  "unit_mrp": 0,
  "accessory_price": 0,
  "b2c_unit_list_price": 0,
  "b2c_discount_price": 0,
  "is_listprice_public": true,
  "show_price": true,
  "is_b2c": false,
  "is_tax_inclusive": false
}
```

### Tax Structure

```json
{
  "hsn_tax": 18,
  "hsn_tax_breakup": {
    "productId": 64171,
    "id": 148,
    "hsnCode": "84219900",
    "description": "Filter Components",
    "tax": "18.000000",
    "intraTax": {
      "id": 0,
      "taxGroupName": "GST 18",
      "default": false,
      "taxReqLs": [
        {
          "id": 118,
          "taxName": "SGST",
          "rate": 9,
          "default": false,
          "compound": false,
          "taxMapId": 171
        },
        {
          "id": 119,
          "taxName": "CGST",
          "rate": 9,
          "default": false,
          "compound": false,
          "taxMapId": 172
        }
      ],
      "totalTax": 18
    },
    "interTax": {
      "id": 0,
      "taxGroupName": "IGST18",
      "default": true,
      "taxReqLs": [
        {
          "id": 115,
          "taxName": "IGST",
          "rate": 18,
          "default": false,
          "compound": false,
          "taxMapId": 142
        }
      ],
      "totalTax": 18
    }
  }
}
```

### Inventory & Quantity Management

```json
{
  "unit_quantity": 10,
  "unit_of_measure": "",
  "packaging_qty": 10,
  "outer_pack_qty": "",
  "min_order_quantity": "0.00",
  "packaging_dimension": "",
  "net_weight": "",
  "standard_lead_time": "7",
  "lead_uom": "D",
  "inventory": []
}
```

### Product Media Assets

```json
{
  "product_assetss": [
    {
      "isDefault": 0,
      "width": "null",
      "source": "https://growmax-dev-app-assets.s3.ap-northeast-1.amazonaws.com/...",
      "type": "image",
      "height": ""
    }
  ]
}
```

### Categorization Hierarchy

```json
{
  "products_sub_categories": [
    {
      "subCategoryId": 5048,
      "subCategoryName": "Default",
      "subCategoryImage": "",
      "categoryId": 3673,
      "categoryName": "Other Accessoriess",
      "categoryImage": "",
      "majorCategoryId": 2212,
      "majorCategoryName": "Default",
      "majorCategoryImage": "",
      "departmentId": 3103,
      "departmentName": "Home",
      "isPrimary": 1
    }
  ]
}
```

### Product States & Flags

```json
{
  "is_published": 1,
  "is_discontinued": false,
  "is_new": false,
  "is_brand_stock": false,
  "is_internal": false,
  "is_replacement": false,
  "is_custom_product": false,
  "is_bundle": false,
  "can_deselect_accessory": false,
  "show_extended_id": false
}
```

### Audit Trail

```json
{
  "created_by": "1007",
  "updated_by": "1007",
  "created_on": "2025-11-05T13:14:28Z",
  "updated_on": "2025-11-05T13:15:06Z",
  "version": 1,
  "published_on": "2025-11-05T13:15:06Z"
}
```

## Document Relationships

### 1. Product Group Relationship

- **Primary Key:** `product_group_id`
- **Group Info:** `pg_name`, `pg_index_name`
- All products in the same group share the same `product_group_id`

### 2. Brand Relationship

- **Primary Key:** `brand_id`
- **Brand Info:** `brand_name`
- Each product belongs to one brand

### 3. Category Hierarchy

- **Department Level:** `departmentId`, `departmentName`
- **Major Category:** `majorCategoryId`, `majorCategoryName`
- **Category Level:** `categoryId`, `categoryName`
- **Sub Category:** `subCategoryId`, `subCategoryName`

### 4. Asset Relationship

- Multiple `product_assetss` per product
- Images stored as external URLs (S3 links)
- Each asset has `isDefault` flag to identify primary image

## Search Index Structure

### Index Information

- **Index Name:** `schwingstetterpgandproducts`
- **Document Type:** `pgproduct`
- **Primary Fields for Search:**
  - `product_group_id` (used for filtering products by group)
  - `is_published` (used for filtering active products)
  - `brand_id`, `brand_name` (for brand-based searches)
  - `product_short_description` (for text search)

### Common Query Patterns

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "terms": {
            "product_group_id": [54518]
          }
        },
        {
          "term": {
            "is_published": 1
          }
        }
      ]
    }
  }
}
```

## Important Notes

1. **Denormalized Structure**: All related data (brand, category, tax, etc.) is stored within each product document for fast retrieval.

2. **No Referencing**: Unlike relational databases, OpenSearch doesn't use foreign key references. All data is embedded.

3. **Tax Complexity**: Tax information is embedded with both intra-state (SGST/CGST) and inter-state (IGST) configurations.

4. **Multi-Currency Support**: The structure supports B2B and B2C pricing separately.

5. **Asset Management**: Product images are stored externally with metadata about dimensions and default status.

6. **Audit Trail**: Complete creation and modification history is maintained.

7. **Flexible Pricing**: Support for list price, MRP, B2C pricing, and discount configurations.

## Best Practices for Working with This Structure

1. **Efficient Queries**: Use product_group_id and is_published for common filters
2. **Price Handling**: Check is_listprice_public before displaying prices
3. **Tax Calculation**: Use the hsn_tax_breakup structure for accurate tax computation
4. **Image Management**: Always check isDefault flag to display primary product image
5. **Category Navigation**: Use the hierarchical category structure for filtering and navigation

## Example Search Response Structure

When querying this index, expect responses in the format:

```json
{
  "body": {
    "took": 1,
    "timed_out": false,
    "_shards": {
      "total": 1,
      "successful": 1
    },
    "hits": {
      "total": {
        "value": 7,
        "relation": "eq"
      },
      "hits": [
        {
          "_index": "schwingstetterpgandproducts",
          "_id": "Prod0000064171",
          "_score": 2,
          "_source": {
            /* Complete product document */
          }
        }
      ]
    }
  },
  "statusCode": 200
}
```

## Real Data Examples

Based on the actual API response, here are the products found in product group ID 54518:

### Product Summary

- **Total Products:** 7
- **Brand:** Milwaukee
- **Product Group:** "Milwakee PG"
- **Price Range:** ₹585 - ₹25,000

### Individual Products:

1. **ID 64171:** Milwaukee M18 FUEL 4-1/2 Inch-6 Inch Braking Grinder - ₹5,435
2. **ID 64173:** Milwaukee PACKOUT Compact Debris Separator - ₹25,000
3. **ID 64169:** Milwaukee M18 FUEL Rotary Hammer 1inch SDS Plus Kit - ₹12,000
4. **ID 64170:** Milwaukee M18 REDLITHIUM HIGH OUTPUT XC 18V 6Ah Battery Pack - ₹5,782
5. **ID 64172:** Milwaukee Steelhead 5 Inch Segmented Rim Diamond Cut-Off Blade - ₹585
6. **ID 64174:** Milwaukee PACKOUT First Aid Kit 193pc Class B Type III - ₹17,892
7. **ID 64175:** Milwaukee Clear High Performance Safety Glasses with Gasket - ₹17,892

All products have:

- Standard lead time: 7 days
- Published status: Yes
- Tax structure: 18% GST (HSN: 84219900) except ID 64169
- Category: "Other Accessoriess"
- Department: "Home"

This structure enables efficient product searches, filtering, and display operations while maintaining data consistency and performance.

## Direct Product Lookup Operations

### Overview

In addition to search queries, OpenSearch supports direct document retrieval using the `queryType: "get"`. This operation retrieves a complete product document by its document ID without any search overhead.

### Request Structure

```json
{
  "Elasticindex": "schwingstetterpgandproducts",
  "ElasticBody": "Prod0000064175",
  "ElasticType": "pgproduct",
  "queryType": "get"
}
```

**Key Parameters:**

- `ElasticBody`: Document ID (not a query object)
- `queryType`: "get" for direct lookup
- `ElasticType`: "pgproduct" for product documents

### Response Structure

```json
{
  "body": {
    "_index": "schwingstetterpgandproducts",
    "_id": "Prod0000064175",
    "_version": 18,
    "_seq_no": 159,
    "_primary_term": 1,
    "found": true,
    "_source": {
      // Complete product document
    }
  },
  "statusCode": 200
}
```

### Response Metadata

- **`_version`**: Document version number (18 in this example)
- **`_seq_no`**: Sequence number for this document
- **`_primary_term`**: Primary term for consistency
- **`found`**: Boolean indicating if document exists
- **`_source`**: Complete product document (same structure as search results)

### Real Example: Product ID 64175

**Document Details:**

- **Document ID:** Prod0000064175
- **Product ID:** 64175
- **Product Group ID:** 54518
- **Version:** 18 (has been updated 18 times)
- **Brand:** Milwaukee
- **Name:** Milwaukee Clear High Performance Safety Glasses with Gasket
- **Price:** ₹17,892
- **Quantity:** 5 units available

**Complete Product Data:**

```json
{
  "product_id": 64175,
  "product_group_id": 54518,
  "tenant_id": 0,
  "pg_name": "Milwakee PG ",
  "pg_index_name": "PrdGrp0000054518",
  "brand_id": 411,
  "brand_name": "Milwakee",
  "brand_product_id": "P000038",
  "product_short_description": "Milwaukee Clear High Performance Safety Glasses with Gasket",
  "product_index_name": "Prod0000064175",
  "unit_list_price": 17892,
  "unit_mrp": 0,
  "accessory_price": 0,
  "b2c_unit_list_price": 0,
  "b2c_discount_price": 0,
  "unit_quantity": 5,
  "unit_of_measure": "",
  "packaging_qty": 5,
  "outer_pack_qty": "",
  "min_order_quantity": "0.00",
  "standard_lead_time": "7",
  "lead_uom": "D",
  "is_published": 1,
  "is_discontinued": false,
  "is_new": false,
  "is_brand_stock": false,
  "is_internal": false,
  "is_listprice_public": true,
  "show_price": true,
  "is_b2c": false,
  "is_tax_inclusive": false,
  "hsn_tax": 18,
  "created_by": "1007",
  "updated_by": "1007",
  "created_on": "2025-11-05T13:20:48Z",
  "updated_on": "2025-11-05T13:21:30Z",
  "version": 1,
  "published_on": "2025-11-05T13:21:30Z"
}
```

**Product Images (5 total):**

1. **Hero Image 1:** milwaukee-clear-high-performance-safety-glasses-with-gasket-48-73-2040-hero-1.jpg
2. **Hero Image 2:** milwaukee-clear-high-performance-safety-glasses-with-gasket-48-73-2040-hero-2.jpg
3. **Hero Image 3:** milwaukee-clear-high-performance-safety-glasses-with-gasket-48-73-2040-hero-3.jpg
4. **Hero Image 4:** milwaukee-clear-high-performance-safety-glasses-with-gasket-48-73-2040-hero-4.jpg
5. **Default Image:** milwaukee-clear-high-performance-safety-glasses-with-gasket-48-73-2040.jpg (isDefault: 1)

**Tax Structure:**

- HSN Code: 84219900 (Filter Components)
- Tax Rate: 18% GST
- Intra-state: SGST 9% + CGST 9%
- Inter-state: IGST 18%

**Category Hierarchy:**

- Department: Home
- Major Category: Default
- Category: Other Accessoriess
- Sub Category: Default

## Comparison: Search vs Get Operations

### Search Query (`queryType: "search"`)

```json
{
  "query": {
    "bool": {
      "must": [
        { "terms": { "product_group_id": [54518] } },
        { "term": { "is_published": 1 } }
      ]
    }
  }
}
```

**Characteristics:**

- Returns array of matching documents
- Supports complex queries and filtering
- Includes search scoring
- Can return partial results with pagination
- Used for discovery and browsing

### Get Query (`queryType: "get"`)

```json
{
  "ElasticBody": "Prod0000064175"
}
```

**Characteristics:**

- Returns single document by ID
- Direct document access (no search overhead)
- Includes version control information
- Guaranteed latest version of document
- Used for detailed product views, updates, and specific lookups

## Best Practices for Direct Lookups

1. **Use Get for Specific IDs**: When you have the document ID, use get for faster retrieval
2. **Version Tracking**: Monitor `_version` to track document updates
3. **Error Handling**: Check `found` field to handle non-existent documents
4. **Performance**: Get operations are faster than search for single document retrieval
5. **Consistency**: Use sequence numbers for tracking changes across distributed environment

### When to Use Each Operation

**Use Search When:**

- Finding products by criteria (brand, category, price range)
- Implementing product filtering
- Building search functionality
- Need multiple results
- Implementing pagination

**Use Get When:**

- Displaying detailed product pages
- Updating specific products
- You have the exact document ID
- Need the absolute latest version
- Performance is critical for single document access

This dual approach provides flexibility for both discovery (search) and specific access (get) patterns in your e-commerce application.
