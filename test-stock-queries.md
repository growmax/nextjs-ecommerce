# OpenSearch Stock Filter Queries for Postman Testing

## Endpoint

Replace `{elasticCode}` with your actual elastic code (e.g., `tenant123`)

```
POST https://your-opensearch-host/{elasticCode}pgandproducts/_search
```

## Headers

```
Content-Type: application/json
```

---

## Query 1: Out of Stock Filter (inStock = false)

This query should return products where:

- Inventory array is empty `[]`
- OR no inventory items have `availableQty > 0`
- OR inventory field doesn't exist

```json
{
  "size": 20,
  "from": 0,
  "_source": [
    "brand_product_id",
    "product_short_description",
    "product_assetss",
    "brands_name",
    "product_categories.categoryId",
    "product_categories.categoryName",
    "product_categories.categoryPath",
    "product_categories.categorySlug",
    "products_sub_categories.subCategoryName",
    "product_id",
    "product_index_name",
    "ean",
    "keywords",
    "b2c_unit_list_price",
    "b2c_discount_price",
    "unit_list_price",
    "inventory"
  ],
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "is_published": 1
          }
        },
        {
          "term": {
            "brands_name.keyword": "Milwakee"
          }
        },
        {
          "bool": {
            "must_not": {
              "nested": {
                "path": "inventory",
                "query": {
                  "range": {
                    "inventory.availableQty": {
                      "gt": 0
                    }
                  }
                }
              }
            }
          }
        }
      ],
      "must_not": [
        {
          "match": {
            "pg_index_name": {
              "query": "PrdGrp0*"
            }
          }
        },
        {
          "term": {
            "is_internal": true
          }
        }
      ]
    }
  }
}
```

---

## Query 2: In Stock Filter (inStock = true)

This query should return products where at least one inventory item has `availableQty > 0`:

```json
{
  "size": 20,
  "from": 0,
  "_source": [
    "brand_product_id",
    "product_short_description",
    "product_assetss",
    "brands_name",
    "product_categories.categoryId",
    "product_categories.categoryName",
    "product_categories.categoryPath",
    "product_categories.categorySlug",
    "products_sub_categories.subCategoryName",
    "product_id",
    "product_index_name",
    "ean",
    "keywords",
    "b2c_unit_list_price",
    "b2c_discount_price",
    "unit_list_price",
    "inventory"
  ],
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "is_published": 1
          }
        },
        {
          "term": {
            "brands_name.keyword": "Milwakee"
          }
        },
        {
          "nested": {
            "path": "inventory",
            "query": {
              "range": {
                "inventory.availableQty": {
                  "gt": 0
                }
              }
            }
          }
        }
      ],
      "must_not": [
        {
          "match": {
            "pg_index_name": {
              "query": "PrdGrp0*"
            }
          }
        },
        {
          "term": {
            "is_internal": true
          }
        }
      ]
    }
  }
}
```

---

## Query 3: No Stock Filter (inStock = undefined)

This query returns all products regardless of stock status:

```json
{
  "size": 20,
  "from": 0,
  "_source": [
    "brand_product_id",
    "product_short_description",
    "product_assetss",
    "brands_name",
    "product_categories.categoryId",
    "product_categories.categoryName",
    "product_categories.categoryPath",
    "product_categories.categorySlug",
    "products_sub_categories.subCategoryName",
    "product_id",
    "product_index_name",
    "ean",
    "keywords",
    "b2c_unit_list_price",
    "b2c_discount_price",
    "unit_list_price",
    "inventory"
  ],
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "is_published": 1
          }
        },
        {
          "term": {
            "brands_name.keyword": "Milwakee"
          }
        }
      ],
      "must_not": [
        {
          "match": {
            "pg_index_name": {
              "query": "PrdGrp0*"
            }
          }
        },
        {
          "term": {
            "is_internal": true
          }
        }
      ]
    }
  }
}
```

---

## Testing Instructions

1. **Replace the brand name**: Change `"Milwakee"` to the brand you want to test
2. **Replace the index name**: Update `{elasticCode}pgandproducts` with your actual index
3. **Check the response**: Look at the `hits.hits` array to see returned products
4. **Verify inventory field**: Check that each product has an `inventory` field in `_source`
5. **Count results**: Compare the `total.value` between queries

## Expected Results

- **Out of Stock Query**: Should return products with `inventory: []` or `inventory: [{availableQty: 0}]`
- **In Stock Query**: Should return products with `inventory: [{availableQty: 5}]` or similar
- **No Filter Query**: Should return all products

## Debugging Tips

If the out-of-stock query returns 0 results:

1. Check if products actually have empty inventory arrays
2. Verify the nested field mapping in OpenSearch
3. Try removing the brand filter to see if it's a brand-specific issue
4. Check if `inventory.availableQty` field exists and is mapped correctly
