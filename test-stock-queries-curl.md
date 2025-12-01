# OpenSearch Stock Filter Queries - cURL Commands

## Prerequisites

Replace these placeholders:

- `{opensearch-host}` - Your OpenSearch host URL (e.g., `https://search.example.com:9200`)
- `{elasticCode}` - Your tenant elastic code (e.g., `tenant123`)
- `{brand-name}` - The brand name to filter (e.g., `Milwakee`)

---

## Query 1: Out of Stock Filter (inStock = false)

```bash
curl -X POST "https://{opensearch-host}/{elasticCode}pgandproducts/_search" \
  -H "Content-Type: application/json" \
  -d '{
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
            "brands_name.keyword": "{brand-name}"
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
}'
```

---

## Query 2: Alternative Out of Stock Query (moved nested to top-level must_not)

If the above doesn't work, try this alternative structure:

```bash
curl -X POST "https://{opensearch-host}/{elasticCode}pgandproducts/_search" \
  -H "Content-Type: application/json" \
  -d '{
  "size": 20,
  "from": 0,
  "_source": [
    "brand_product_id",
    "product_short_description",
    "product_assetss",
    "brands_name",
    "product_id",
    "product_index_name",
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
            "brands_name.keyword": "{brand-name}"
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
      ]
    }
  }
}'
```

---

## Query 3: In Stock Filter (inStock = true)

```bash
curl -X POST "https://{opensearch-host}/{elasticCode}pgandproducts/_search" \
  -H "Content-Type: application/json" \
  -d '{
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
            "brands_name.keyword": "{brand-name}"
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
}'
```

---

## Query 4: No Stock Filter (all products)

```bash
curl -X POST "https://{opensearch-host}/{elasticCode}pgandproducts/_search" \
  -H "Content-Type: application/json" \
  -d '{
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
            "brands_name.keyword": "{brand-name}"
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
}'
```

---

## Usage in Postman

1. **Method**: POST
2. **URL**: `https://{opensearch-host}/{elasticCode}pgandproducts/_search`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body**: Copy the JSON from the `-d` parameter (between the single quotes)

## Usage in Terminal

1. Replace all placeholders `{opensearch-host}`, `{elasticCode}`, `{brand-name}`
2. Copy the entire curl command
3. Paste in terminal and press Enter
4. Check the response for `hits.hits` array

## Expected Response Structure

```json
{
  "took": 5,
  "timed_out": false,
  "_shards": {...},
  "hits": {
    "total": {
      "value": 7,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "...",
        "_id": "...",
        "_score": 1.0,
        "_source": {
          "product_id": 64170,
          "brands_name": "Milwakee",
          "inventory": [],
          ...
        }
      }
    ]
  }
}
```

## Debugging

If you get 0 results:

1. Check if `inventory` field is properly mapped as nested type in OpenSearch
2. Verify the brand name matches exactly (case-sensitive)
3. Try removing the brand filter to see if it's brand-specific
4. Check if `inventory.availableQty` field exists and is numeric type
