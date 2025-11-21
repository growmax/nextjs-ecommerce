# OpenSearch Variant Structure Analysis

## Overview

After analyzing the OpenSearch repository structure, here's how product variants are organized in the system.

## Key Concepts

### 1. **Product Group Level (Parent)**
- **Index Format**: `PrdGrp{ProductGroupId}` (e.g., `PrdGrp000054518`)
- **Key Field**: `variantAttributeses` - Array of `ElasticVariantAttributes`
- **Purpose**: Defines the available variant attributes for all products in the group

```typescript
{
  "productGroupId": 54518,
  "prodgrpIndexName": "PrdGrp000054518",
  "variantAttributeses": [
    {
      "name": "Color",
      "displayType": "color", // or "text", "image", etc.
      "options": ["Red", "Blue", "Green"] // All available options
    },
    {
      "name": "Size",
      "displayType": "text",
      "options": ["Small", "Medium", "Large"]
    }
  ]
}
```

### 2. **Product Level (Child)**
- **Index Format**: `Prod{ProductId}` (e.g., `Prod0000064175`)
- **Key Fields**:
  - `productAttributes`: `map[string][]string` - Available attribute values for this product
  - `setProductAtributes`: `[]ElasticProductAtributes` - Specific attribute values assigned to this product
- **Purpose**: Stores the specific variant combination for this product

```typescript
{
  "productId": 64175,
  "productIndexName": "Prod0000064175",
  "productGroupId": 54518,
  "brandProductId": "MIL-12345",
  "productAttributes": {
    "Color": ["Red"],      // This product only has Red
    "Size": ["Large"]      // This product only has Large
  },
  "setProductAtributes": [
    {
      "attributeName": "Color",
      "attributeValue": "Red"
    },
    {
      "attributeName": "Size",
      "attributeValue": "Large"
    }
  ]
}
```

## Database Structure

### Variant Tables (MySQL)
1. **`Global_Variants`**: Master list of variant types (Color, Size, etc.)
2. **`Global_Variants_Attributes`**: Available values for each variant type
3. **`Product_Group_Variants`**: Links variants to product groups
4. **`Variants_Attributes`**: Links variant attributes to product group variants
5. **`SimpleVariants`**: Links specific products to their variant attribute combinations

### Query Flow

#### For Product Group Variants:
```sql
-- Get all variant attributes for a product group
SELECT g.ID, g.Name as name
FROM Global_Variants g
INNER JOIN Product_Group_Variants pgv ON g.ID = pgv.Global_Variants_ID
INNER JOIN Variants_Attributes va ON va.Variants_ID = pgv.ID
INNER JOIN Global_Variants_Attributes gva ON gva.ID = va.Global_Variants_Attributes_ID
WHERE pgv.Product_Group_ID = ? AND pgv.TenantId = ?
GROUP BY g.ID
```

#### For Individual Product Attributes:
```sql
-- Get specific attributes for a product (by Brand_Product_ID)
SELECT g.ID, g.Name as Attribute_Name
FROM Global_Variants g
INNER JOIN Global_Variants_Attributes gva ON gva.Global_Variants_ID = g.ID
INNER JOIN Variants_Attributes va ON va.Global_Variants_Attributes_ID = gva.ID
INNER JOIN SimpleVariants sv ON sv.Variants_Attributes_ID = va.ID
WHERE sv.Brand_Product_ID = ? AND sv.TenantId = ?
GROUP BY g.ID
```

## How to Fetch Variants for a Product

### Step 1: Get Product Details
```javascript
GET /{tenantCode}/pgproduct/Prod0000064175
```

Response includes:
- `productGroupId`: 54518
- `productAttributes`: Current product's attributes
- `setProductAtributes`: Current product's attribute values

### Step 2: Get Product Group Variants
```javascript
GET /{tenantCode}/pgproduct/PrdGrp000054518
```

Response includes:
- `variantAttributeses`: All available variant options for this product group

### Step 3: Get All Products in Group (for variant selection)
```javascript
GET /{tenantCode}/pgproduct/_search
{
  "query": {
    "term": {
      "productGroupId": 54518
    }
  }
}
```

This returns all products in the group with their specific `productAttributes` values.

## Understanding Prod0000064175

### Current Situation
- **Product ID**: 64175
- **Product Index**: `Prod0000064175`
- **Product Group ID**: 54518
- **Product Group Index**: `PrdGrp000054518`

### Why `setProductAtributes` is Empty

The `setProductAtributes` field is populated from the `SimpleVariants` table using the `Brand_Product_ID`. If it's empty, it means:

1. **No variant data exists** in `SimpleVariants` table for this product's `Brand_Product_ID`
2. **The product might not have variants** - it could be a standalone product
3. **The variant data hasn't been synced** from MySQL to OpenSearch

### How to Check for Variants

1. **Check Product Group** (`PrdGrp000054518`):
   - Look for `variantAttributeses` field
   - If present, the product group supports variants
   - If empty, no variants are configured

2. **Check Other Products in Group**:
   - Query all products with `productGroupId: 54518`
   - If they have different `productAttributes`, they are variants
   - If they're all different products, they're just grouped together

3. **Check Database**:
   - Query `SimpleVariants` table for `Brand_Product_ID` of this product
   - Query `Product_Group_Variants` for `Product_Group_ID: 54518`

## Implementation Recommendations

### For Your Next.js Application

1. **Fetch Product Group First**:
   ```typescript
   const productGroup = await fetchProductGroup(productGroupId);
   const variantAttributes = productGroup.variantAttributeses || [];
   ```

2. **Fetch All Products in Group**:
   ```typescript
   const products = await fetchProductsByGroup(productGroupId);
   // Group by variant combinations
   const variants = groupProductsByVariants(products);
   ```

3. **Display Variant Selector**:
   - Use `variantAttributeses` from Product Group to show available options
   - Use `productAttributes` from individual products to show selected values
   - Filter products based on selected variant combinations

### Example Variant Selection Flow

```typescript
// 1. Get product group variants
const pg = await getProductGroup(54518);
const availableVariants = pg.variantAttributeses; // [{name: "Color", options: ["Red", "Blue"]}]

// 2. Get all products in group
const products = await getProductsByGroup(54518);

// 3. User selects: Color = "Red"
const selectedVariants = { Color: "Red" };

// 4. Find matching product
const matchingProduct = products.find(p => 
  p.productAttributes.Color?.includes("Red")
);

// 5. Navigate to that product
router.push(`/product/${matchingProduct.productIndexName}`);
```

## Key Files in OpenSearch Repository

1. **`db/querybuild.go`**:
   - `CreateProductAtributes()`: Fetches product-level attributes
   - Uses `SimpleVariants` table

2. **`db/queryBuildPg.go`**:
   - `GetPGvariant()`: Fetches product group-level variants
   - Uses `Product_Group_Variants` table

3. **`Model/ElasticProductDTO.go`**:
   - `productAttributes`: `map[string][]string`
   - `setProductAtributes`: `[]ElasticProductAtributes`

4. **`Model/ElasticProductGroupDTO.go`**:
   - `variantAttributeses`: `[]ElasticVariantAttributes`

## Next Steps

1. **Query the Product Group** (`PrdGrp000054518`) to see if variants are configured
2. **Check if other products in group 54518 have variant data**
3. **If variants exist at PG level but not product level**, the data sync might be incomplete
4. **Implement variant fetching logic** that checks both product and product group levels

