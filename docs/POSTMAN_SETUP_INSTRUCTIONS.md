# Postman Collection Setup Instructions

## Quick Start

1. **Import the Collection**
   - Open Postman
   - Click "Import" button
   - Select `OpenSearch_Queries.postman_collection.json`
   - Collection will appear in your workspace

2. **Create Environment Variables**
   - Click the "Environments" icon (left sidebar)
   - Click "+" to create a new environment
   - Name it "OpenSearch Testing"
   - Add the following variables:

| Variable Name        | Initial Value                                      | Current Value | Description                         |
| -------------------- | -------------------------------------------------- | ------------- | ----------------------------------- |
| `opensearch_url`     | `https://api.myapptino.com/opensearch/invocations` | (same)        | OpenSearch API endpoint             |
| `index_name`         | `yourtenantcodepgandproducts`                      | (same)        | Your OpenSearch index name          |
| `access_token`       | `your-jwt-token-here`                              | (same)        | Your JWT access token               |
| `tenant_code`        | `yourtenantcode`                                   | (same)        | Your tenant code                    |
| `category_id`        | `123`                                              | (same)        | A valid category ID for testing     |
| `subcategory_id`     | `456`                                              | (same)        | A valid subcategory ID for testing  |
| `major_category_id`  | `789`                                              | (same)        | A valid major category ID           |
| `brand_name`         | `DEWALT`                                           | (same)        | A valid brand name (case-sensitive) |
| `product_group_id`   | `123`                                              | (same)        | A valid product group ID            |
| `product_index_name` | `Prod0000012390`                                   | (same)        | A valid product index name          |

3. **Select the Environment**
   - Click the environment dropdown (top right)
   - Select "OpenSearch Testing"

4. **Update Variables with Real Values**
   - Click on the environment name to edit
   - Update all variables with your actual values
   - Save the environment

## Collection Structure

The collection is organized into 6 folders:

### 1. Product Search

- **Search - Basic Text Search**: Full-text search with multiple match strategies

### 2. Browse Queries

- **Browse - By Category**: Filter products by category ID
- **Browse - By Subcategory**: Filter products by subcategory ID
- **Browse - By Major Category**: Filter products by major category ID
- **Browse - By Brand**: Filter products by brand name
- **Browse - By Product Group**: Filter products by product group ID
- **Browse - All Products**: Get all published products (no filters)

### 3. Browse with Sorting

- **Browse - Category with Price Sort (Low to High)**: Category browse with ascending price sort
- **Browse - Category with Price Sort (High to Low)**: Category browse with descending price sort

### 4. Browse with Filters

- **Browse - Category with Catalog Code Filter**: Category browse with catalog code filtering
- **Browse - Category with Brand Filter**: Category browse with additional brand filter

### 5. Product Detail

- **Get Product - By Index Name**: Fetch a single product by its index name

### 6. Pagination Examples

- **Browse - Category Page 1**: First page (from=0, size=20)
- **Browse - Category Page 2**: Second page (from=20, size=20)

## Features

### Automatic Header Injection

Each request has a pre-request script that automatically adds:

- `Authorization: Bearer {access_token}`
- `x-tenant: {tenant_code}`

### Response Tests

Each request includes automated tests that:

- Verify status code is 200
- Check response structure
- Log result counts to console
- Validate data presence

### Variable Usage

All requests use environment variables, so you can:

- Update values in one place (environment)
- Test with different tenants/indices easily
- Share collection without exposing credentials

## Testing Workflow

### Step 1: Test Basic Connectivity

1. Start with **"Browse - All Products (No Filter)"**
2. This verifies your endpoint, index, and authentication work
3. Check the console for total product count

### Step 2: Test Search

1. Run **"Search - Basic Text Search"**
2. Update the search term "drill" in the request body if needed
3. Verify results are returned

### Step 3: Test Browse Queries

1. Update `category_id`, `subcategory_id`, etc. in environment
2. Run each browse query
3. Verify results match your expectations

### Step 4: Test Product Detail

1. Update `product_index_name` with a real product index
2. Run **"Get Product - By Index Name"**
3. Verify product data is returned

### Step 5: Test Advanced Features

1. Test sorting (price low to high, high to low)
2. Test filters (catalog codes, brand filters)
3. Test pagination (page 1, page 2)

## Viewing Results

### Console Output

- Open Postman Console (View → Show Postman Console)
- Each request logs result counts
- Check for any errors or warnings

### Response Body

- Click on any request to see the full response
- Use the "Pretty" view for formatted JSON
- Check the `hits.total.value` for result counts

### Test Results

- Click the "Test Results" tab after running a request
- Green checkmarks indicate passed tests
- Red X marks indicate failed tests

## Troubleshooting

### Issue: 401 Unauthorized

**Solution**:

- Verify `access_token` is valid and not expired
- Check token format: should start with "Bearer " (handled automatically)

### Issue: Empty Results

**Possible Causes**:

- Wrong index name
- Category/Brand IDs don't exist in your data
- Products not published (`isPublished: 1`)
- Products marked as internal (`internal: true`)

**Solution**:

- Start with "Browse - All Products" to verify basic connectivity
- Check your database for valid IDs
- Verify products are published

### Issue: Variable Not Replacing

**Solution**:

- Ensure environment is selected (top right dropdown)
- Check variable names match exactly (case-sensitive)
- Use `{{variable_name}}` syntax in request body

### Issue: Wrong Field Names

**Solution**:

- Verify field names match your OpenSearch index mapping
- Common fields:
  - `productsSubCategories.categoryId` (not `categoryId`)
  - `brandsName.keyword` (for exact brand match)
  - `catalogCode.keyword` (for catalog filtering)

## Customizing Requests

### Changing Search Terms

In "Search - Basic Text Search", replace `"drill"` with your search term in:

- `query_string.query`
- All `multi_match.query` fields

### Changing Page Size

Update `size` in the `ElasticBody`:

```json
"size": 50  // Change from 20 to 50
```

### Changing Sort Order

In sort queries, change:

```json
"order": "asc"   // or "desc"
```

### Adding More Filters

Add additional `must` clauses:

```json
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
    "term": {
      "brandsName.keyword": "DEWALT"
    }
  }
]
```

## Exporting/Sharing

### Export Collection

1. Right-click collection name
2. Select "Export"
3. Choose format (Collection v2.1)
4. Save file

### Share with Team

1. Export collection
2. Share the JSON file
3. Team members import it
4. They create their own environment with their credentials

### Export Environment

1. Click on environment name
2. Click "Export"
3. Share environment file (remove sensitive tokens first!)

## Best Practices

1. **Never commit tokens**: Remove `access_token` before committing to git
2. **Use environments**: Create separate environments for dev/staging/prod
3. **Test incrementally**: Start simple, add complexity gradually
4. **Check console**: Always check Postman Console for errors
5. **Validate responses**: Use test scripts to catch issues early
6. **Document changes**: Add notes to requests when customizing

## Next Steps

After testing in Postman:

1. Verify all queries return expected results
2. Note any field name differences
3. Update the implementation code with correct field names
4. Test the actual implementation
5. Compare Postman results with implementation results


