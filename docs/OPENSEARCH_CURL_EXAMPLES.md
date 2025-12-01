# OpenSearch Query Testing - cURL & Postman Examples

This document provides cURL commands and Postman-ready request details for testing all OpenSearch queries before implementation.

## Base Configuration

**Endpoint**: `https://api.myapptino.com/opensearch/invocations`  
**Method**: `POST`  
**Content-Type**: `application/json`

### Required Headers

```bash
Content-Type: application/json
Authorization: Bearer <your-access-token>  # Optional but recommended
x-tenant: <tenant-code>                     # Optional but recommended
x-company-id: <company-id>                 # Optional
x-user-id: <user-id>                       # Optional
```

---

## 1. Product Search Query

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "search",
    "ElasticType": "pgproduct",
    "ElasticBody": {
      "size": 24,
      "_source": [
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
      "query": {
        "bool": {
          "minimum_should_match": 1,
          "must": [
            {
              "term": {
                "isPublished": 1
              }
            }
          ],
          "should": [
            {
              "query_string": {
                "query": "drill",
                "analyzer": "my_analyzer",
                "analyze_wildcard": true,
                "auto_generate_phrase_queries": true,
                "default_operator": "AND",
                "fields": [
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
                "boost": 200
              }
            },
            {
              "multi_match": {
                "query": "drill",
                "type": "phrase_prefix",
                "boost": 190,
                "fields": [
                  "name",
                  "keywords^8",
                  "brandProductId^5",
                  "productShortDescription^9",
                  "description",
                  "pgName",
                  "variantAttributeses.name",
                  "productSeries",
                  "brandsName"
                ]
              }
            },
            {
              "multi_match": {
                "query": "drill",
                "type": "cross_fields",
                "minimum_should_match": "90%",
                "analyzer": "my_analyzer",
                "boost": 98,
                "fields": [
                  "brandsName",
                  "productsSubCategories.categoryName",
                  "productsSubCategories.subCategoryName",
                  "productsSubCategories.majorCategoryName"
                ]
              }
            },
            {
              "multi_match": {
                "query": "drill",
                "type": "best_fields",
                "analyzer": "my_analyzer",
                "fields": [
                  "name",
                  "keywords^8",
                  "brandProductId^5",
                  "productShortDescription^9",
                  "description",
                  "pgName"
                ]
              }
            }
          ],
          "must_not": [
            {
              "match": {
                "prodgrpIndexName": {
                  "query": "PrdGrp0*"
                }
              }
            },
            {
              "term": {
                "internal": true
              }
            }
          ]
        }
      }
    }
  }'
```

### Postman Configuration

**URL**: `https://api.myapptino.com/opensearch/invocations`  
**Method**: `POST`

**Headers**:

```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
x-tenant: YOUR_TENANT_CODE
```

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "search",
  "ElasticType": "pgproduct",
  "ElasticBody": {
    "size": 24,
    "_source": [
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
    "query": {
      "bool": {
        "minimum_should_match": 1,
        "must": [
          {
            "term": {
              "isPublished": 1
            }
          }
        ],
        "should": [
          {
            "query_string": {
              "query": "drill",
              "analyzer": "my_analyzer",
              "analyze_wildcard": true,
              "auto_generate_phrase_queries": true,
              "default_operator": "AND",
              "fields": [
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
              "boost": 200
            }
          },
          {
            "multi_match": {
              "query": "drill",
              "type": "phrase_prefix",
              "boost": 190,
              "fields": [
                "name",
                "keywords^8",
                "brandProductId^5",
                "productShortDescription^9",
                "description",
                "pgName",
                "variantAttributeses.name",
                "productSeries",
                "brandsName"
              ]
            }
          },
          {
            "multi_match": {
              "query": "drill",
              "type": "cross_fields",
              "minimum_should_match": "90%",
              "analyzer": "my_analyzer",
              "boost": 98,
              "fields": [
                "brandsName",
                "productsSubCategories.categoryName",
                "productsSubCategories.subCategoryName",
                "productsSubCategories.majorCategoryName"
              ]
            }
          },
          {
            "multi_match": {
              "query": "drill",
              "type": "best_fields",
              "analyzer": "my_analyzer",
              "fields": [
                "name",
                "keywords^8",
                "brandProductId^5",
                "productShortDescription^9",
                "description",
                "pgName"
              ]
            }
          }
        ],
        "must_not": [
          {
            "match": {
              "prodgrpIndexName": {
                "query": "PrdGrp0*"
              }
            }
          },
          {
            "term": {
              "internal": true
            }
          }
        ]
      }
    }
  }
}
```

**Note**: Replace `"drill"` with your search term.

---

## 2. Browse by Category Query

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "search",
    "ElasticType": "pgproduct",
    "ElasticBody": {
      "from": 0,
      "size": 20,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "isPublished": 1
              }
            },
            {
              "term": {
                "productsSubCategories.categoryId": 123
              }
            }
          ],
          "must_not": [
            {
              "match": {
                "prodgrpIndexName": {
                  "query": "PrdGrp0*"
                }
              }
            },
            {
              "term": {
                "internal": true
              }
            }
          ]
        }
      }
    }
  }'
```

### Postman Configuration

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "search",
  "ElasticType": "pgproduct",
  "ElasticBody": {
    "from": 0,
    "size": 20,
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "isPublished": 1
            }
          },
          {
            "term": {
              "productsSubCategories.categoryId": 123
            }
          }
        ],
        "must_not": [
          {
            "match": {
              "prodgrpIndexName": {
                "query": "PrdGrp0*"
              }
            }
          },
          {
            "term": {
              "internal": true
            }
          }
        ]
      }
    }
  }
}
```

**Note**: Replace `123` with your actual category ID.

---

## 3. Browse by Subcategory Query

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "search",
    "ElasticType": "pgproduct",
    "ElasticBody": {
      "from": 0,
      "size": 20,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "isPublished": 1
              }
            },
            {
              "term": {
                "productsSubCategories.subCategoryId": 456
              }
            }
          ],
          "must_not": [
            {
              "match": {
                "prodgrpIndexName": {
                  "query": "PrdGrp0*"
                }
              }
            },
            {
              "term": {
                "internal": true
              }
            }
          ]
        }
      }
    }
  }'
```

### Postman Configuration

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "search",
  "ElasticType": "pgproduct",
  "ElasticBody": {
    "from": 0,
    "size": 20,
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "isPublished": 1
            }
          },
          {
            "term": {
              "productsSubCategories.subCategoryId": 456
            }
          }
        ],
        "must_not": [
          {
            "match": {
              "prodgrpIndexName": {
                "query": "PrdGrp0*"
              }
            }
          },
          {
            "term": {
              "internal": true
            }
          }
        ]
      }
    }
  }
}
```

**Note**: Replace `456` with your actual subcategory ID.

---

## 4. Browse by Major Category Query

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "search",
    "ElasticType": "pgproduct",
    "ElasticBody": {
      "from": 0,
      "size": 20,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "isPublished": 1
              }
            },
            {
              "term": {
                "productsSubCategories.majorCategoryId": 789
              }
            }
          ],
          "must_not": [
            {
              "match": {
                "prodgrpIndexName": {
                  "query": "PrdGrp0*"
                }
              }
            },
            {
              "term": {
                "internal": true
              }
            }
          ]
        }
      }
    }
  }'
```

### Postman Configuration

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "search",
  "ElasticType": "pgproduct",
  "ElasticBody": {
    "from": 0,
    "size": 20,
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "isPublished": 1
            }
          },
          {
            "term": {
              "productsSubCategories.majorCategoryId": 789
            }
          }
        ],
        "must_not": [
          {
            "match": {
              "prodgrpIndexName": {
                "query": "PrdGrp0*"
              }
            }
          },
          {
            "term": {
              "internal": true
            }
          }
        ]
      }
    }
  }
}
```

**Note**: Replace `789` with your actual major category ID.

---

## 5. Browse by Brand Query

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "search",
    "ElasticType": "pgproduct",
    "ElasticBody": {
      "from": 0,
      "size": 20,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "isPublished": 1
              }
            },
            {
              "term": {
                "brandsName.keyword": "DEWALT"
              }
            }
          ],
          "must_not": [
            {
              "match": {
                "prodgrpIndexName": {
                  "query": "PrdGrp0*"
                }
              }
            },
            {
              "term": {
                "internal": true
              }
            }
          ]
        }
      }
    }
  }'
```

### Postman Configuration

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "search",
  "ElasticType": "pgproduct",
  "ElasticBody": {
    "from": 0,
    "size": 20,
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "isPublished": 1
            }
          },
          {
            "term": {
              "brandsName.keyword": "DEWALT"
            }
          }
        ],
        "must_not": [
          {
            "match": {
              "prodgrpIndexName": {
                "query": "PrdGrp0*"
              }
            }
          },
          {
            "term": {
              "internal": true
            }
          }
        ]
      }
    }
  }
}
```

**Note**: Replace `"DEWALT"` with your actual brand name (case-sensitive).

---

## 6. Browse by Product Group Query

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "search",
    "ElasticType": "pgproduct",
    "ElasticBody": {
      "from": 0,
      "size": 20,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "isPublished": 1
              }
            },
            {
              "term": {
                "productGroupId": 123
              }
            }
          ],
          "must_not": [
            {
              "match": {
                "prodgrpIndexName": {
                  "query": "PrdGrp0*"
                }
              }
            },
            {
              "term": {
                "internal": true
              }
            }
          ]
        }
      }
    }
  }'
```

### Postman Configuration

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "search",
  "ElasticType": "pgproduct",
  "ElasticBody": {
    "from": 0,
    "size": 20,
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "isPublished": 1
            }
          },
          {
            "term": {
              "productGroupId": 123
            }
          }
        ],
        "must_not": [
          {
            "match": {
              "prodgrpIndexName": {
                "query": "PrdGrp0*"
              }
            }
          },
          {
            "term": {
              "internal": true
            }
          }
        ]
      }
    }
  }
}
```

**Note**: Replace `123` with your actual product group ID.

---

## 7. Product Detail Query (GET by Index Name)

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "get",
    "ElasticType": "pgproduct",
    "ElasticBody": "Prod0000012390"
  }'
```

### Postman Configuration

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "get",
  "ElasticType": "pgproduct",
  "ElasticBody": "Prod0000012390"
}
```

**Note**:

- Replace `"Prod0000012390"` with your actual product index name
- For `queryType: "get"`, `ElasticBody` is a **string** (not an object)

---

## 8. Browse with Sorting (Price: Low to High)

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "search",
    "ElasticType": "pgproduct",
    "ElasticBody": {
      "from": 0,
      "size": 20,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "isPublished": 1
              }
            },
            {
              "term": {
                "productsSubCategories.categoryId": 123
              }
            }
          ],
          "must_not": [
            {
              "match": {
                "prodgrpIndexName": {
                  "query": "PrdGrp0*"
                }
              }
            },
            {
              "term": {
                "internal": true
              }
            }
          ]
        }
      },
      "sort": [
        {
          "unitListPrice": {
            "order": "asc"
          }
        }
      ]
    }
  }'
```

### Postman Configuration

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "search",
  "ElasticType": "pgproduct",
  "ElasticBody": {
    "from": 0,
    "size": 20,
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "isPublished": 1
            }
          },
          {
            "term": {
              "productsSubCategories.categoryId": 123
            }
          }
        ],
        "must_not": [
          {
            "match": {
              "prodgrpIndexName": {
                "query": "PrdGrp0*"
              }
            }
          },
          {
            "term": {
              "internal": true
            }
          }
        ]
      }
    },
    "sort": [
      {
        "unitListPrice": {
          "order": "asc"
        }
      }
    ]
  }
}
```

**For Price: High to Low**, change `"order": "asc"` to `"order": "desc"`.

---

## 9. Browse with Catalog Code Filter

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "search",
    "ElasticType": "pgproduct",
    "ElasticBody": {
      "from": 0,
      "size": 20,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "isPublished": 1
              }
            },
            {
              "term": {
                "productsSubCategories.categoryId": 123
              }
            },
            {
              "terms": {
                "catalogCode.keyword": ["CAT001", "CAT002"]
              }
            }
          ],
          "must_not": [
            {
              "match": {
                "prodgrpIndexName": {
                  "query": "PrdGrp0*"
                }
              }
            },
            {
              "term": {
                "internal": true
              }
            }
          ]
        }
      }
    }
  }'
```

### Postman Configuration

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "search",
  "ElasticType": "pgproduct",
  "ElasticBody": {
    "from": 0,
    "size": 20,
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "isPublished": 1
            }
          },
          {
            "term": {
              "productsSubCategories.categoryId": 123
            }
          },
          {
            "terms": {
              "catalogCode.keyword": ["CAT001", "CAT002"]
            }
          }
        ],
        "must_not": [
          {
            "match": {
              "prodgrpIndexName": {
                "query": "PrdGrp0*"
              }
            }
          },
          {
            "term": {
              "internal": true
            }
          }
        ]
      }
    }
  }
}
```

---

## 10. All Products (No Filters)

### cURL Command

```bash
curl -X POST "https://api.myapptino.com/opensearch/invocations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "x-tenant: YOUR_TENANT_CODE" \
  -d '{
    "Elasticindex": "YOUR_INDEX_NAME",
    "queryType": "search",
    "ElasticType": "pgproduct",
    "ElasticBody": {
      "from": 0,
      "size": 20,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "isPublished": 1
              }
            }
          ],
          "must_not": [
            {
              "match": {
                "prodgrpIndexName": {
                  "query": "PrdGrp0*"
                }
              }
            },
            {
              "term": {
                "internal": true
              }
            }
          ]
        }
      }
    }
  }'
```

### Postman Configuration

**Body** (raw JSON):

```json
{
  "Elasticindex": "YOUR_INDEX_NAME",
  "queryType": "search",
  "ElasticType": "pgproduct",
  "ElasticBody": {
    "from": 0,
    "size": 20,
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "isPublished": 1
            }
          }
        ],
        "must_not": [
          {
            "match": {
              "prodgrpIndexName": {
                "query": "PrdGrp0*"
              }
            }
          },
          {
            "term": {
              "internal": true
            }
          }
        ]
      }
    }
  }
}
```

---

## Expected Response Format

### Search Query Response

```json
{
  "hits": {
    "hits": [
      {
        "_source": {
          "productId": 123,
          "productShortDescription": "Product Name",
          "brandsName": "Brand Name",
          "b2CUnitListPrice": 99.99,
          "b2CDiscountPrice": 79.99,
          "productAssetss": [
            {
              "source": "https://example.com/image.jpg",
              "isDefault": true
            }
          ]
          // ... other product fields
        },
        "_id": "Prod0000012390",
        "_score": 1.5
      }
    ],
    "total": {
      "value": 100,
      "relation": "eq"
    }
  }
}
```

### Get Query Response

```json
{
  "body": {
    "_source": {
      "productId": 123,
      "productShortDescription": "Product Name"
      // ... all product fields
    },
    "_id": "Prod0000012390",
    "found": true
  },
  "statusCode": 200
}
```

---

## Testing Checklist

Before implementing, verify:

- [ ] **Product Search**: Returns results for search term "drill"
- [ ] **Category Browse**: Returns products for category ID 123
- [ ] **Subcategory Browse**: Returns products for subcategory ID 456
- [ ] **Major Category Browse**: Returns products for major category ID 789
- [ ] **Brand Browse**: Returns products for brand "DEWALT"
- [ ] **Product Group Browse**: Returns products for product group ID 123
- [ ] **Product Detail**: Returns single product for "Prod0000012390"
- [ ] **Sorting**: Price sorting works (asc/desc)
- [ ] **Catalog Filter**: Catalog code filtering works
- [ ] **Pagination**: `from` and `size` parameters work correctly
- [ ] **Response Structure**: Response matches expected format

---

## Common Issues & Solutions

### Issue: 401 Unauthorized

**Solution**: Add valid `Authorization: Bearer <token>` header

### Issue: Empty Results

**Possible Causes**:

- Wrong index name
- Category/Brand IDs don't exist
- Products not published (`isPublished: 1`)
- Products marked as internal (`internal: true`)

### Issue: Wrong Field Names

**Solution**: Verify field names match your OpenSearch index mapping:

- `productsSubCategories.categoryId` (not `categoryId`)
- `brandsName.keyword` (for exact brand match)
- `catalogCode.keyword` (for catalog filtering)

### Issue: Invalid Query Structure

**Solution**: Ensure:

- `ElasticBody` is an object for `queryType: "search"`
- `ElasticBody` is a string for `queryType: "get"`
- `ElasticType` is `"pgproduct"`
- `Elasticindex` matches your index name format

---

## Quick Test Script

Save this as `test-opensearch.sh`:

```bash
#!/bin/bash

# Configuration
ENDPOINT="https://api.myapptino.com/opensearch/invocations"
INDEX_NAME="YOUR_INDEX_NAME"
TOKEN="YOUR_ACCESS_TOKEN"
TENANT="YOUR_TENANT_CODE"

# Test 1: Product Search
echo "Testing Product Search..."
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant: $TENANT" \
  -d "{
    \"Elasticindex\": \"$INDEX_NAME\",
    \"queryType\": \"search\",
    \"ElasticType\": \"pgproduct\",
    \"ElasticBody\": {
      \"size\": 5,
      \"query\": {
        \"bool\": {
          \"must\": [{\"term\": {\"isPublished\": 1}}],
          \"must_not\": [
            {\"match\": {\"prodgrpIndexName\": {\"query\": \"PrdGrp0*\"}}},
            {\"term\": {\"internal\": true}}
          ]
        }
      }
    }
  }" | jq '.hits.total.value'

# Test 2: Product Detail
echo "Testing Product Detail..."
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant: $TENANT" \
  -d "{
    \"Elasticindex\": \"$INDEX_NAME\",
    \"queryType\": \"get\",
    \"ElasticType\": \"pgproduct\",
    \"ElasticBody\": \"Prod0000012390\"
  }" | jq '.body.found'
```

Make it executable: `chmod +x test-opensearch.sh`

---

## Postman Collection

You can import these as a Postman collection. Create a new collection with:

1. **Environment Variables**:
   - `opensearch_url`: `https://api.myapptino.com/opensearch/invocations`
   - `index_name`: Your index name
   - `access_token`: Your access token
   - `tenant_code`: Your tenant code

2. **Collection Variables**: Use `{{variable_name}}` in requests

3. **Pre-request Script** (optional):

```javascript
pm.request.headers.add({
  key: "Authorization",
  value: "Bearer " + pm.environment.get("access_token"),
});
```

---

## Notes

- Replace all placeholder values:
  - `YOUR_INDEX_NAME` → Your actual OpenSearch index (e.g., `tenantcodepgandproducts`)
  - `YOUR_ACCESS_TOKEN` → Your actual JWT token
  - `YOUR_TENANT_CODE` → Your tenant code
  - Category/Subcategory/Brand IDs → Actual IDs from your database

- Index name format is typically: `{tenantCode}pgandproducts` (lowercase)

- For testing, start with simple queries (all products, then add filters)

- Use `jq` or Postman's JSON formatter to pretty-print responses


