#!/bin/bash

# Out of Stock Query - cURL command
# Replace {elasticCode} with your actual elastic code (e.g., tenant123)
# Replace {opensearch-host} with your OpenSearch host URL

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
}'

