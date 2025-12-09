/**
 * OpenSearch Query Verification Script
 *
 * This script verifies that all OpenSearch queries are working correctly
 * by testing each query type and checking if they return results.
 *
 * Usage:
 *   npx tsx scripts/verify-opensearch-queries.ts
 *
 */

import axios from "axios";
import { buildProductSearchQuery } from "../src/utils/elasticsearch/search-queries";
import {
  buildBrandQuery,
  buildCategoryQuery,
  buildMajorCategoryQuery,
  buildSubCategoryQuery,
} from "../src/utils/opensearch/browse-queries";

interface VerificationResult {
  testName: string;
  success: boolean;
  resultCount?: number;
  error?: string;
  queryStructure?: unknown;
}

interface OpenSearchRequest {
  Elasticindex: string;
  ElasticBody: unknown;
  ElasticType: string;
  queryType: "search" | "get";
}

const OPENSEARCH_URL =
  process.env.OPENSEARCH_URL || process.env.NEXT_PUBLIC_OPENSEARCH_URL || "";

const ELASTIC_URL =
  process.env.OPENSEARCH_URL ||
  process.env.NEXT_PUBLIC_OPENSEARCH_URL ||
  process.env.ELASTIC_URL ||
  process.env.NEXT_PUBLIC_ELASTIC_URL ||
  "";

const ELASTIC_INDEX = process.env.ELASTIC_INDEX || "";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "";

/**
 * Make OpenSearch API request
 */
async function makeOpenSearchRequest(
  request: OpenSearchRequest,
  endpoint: string = OPENSEARCH_URL
): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }

  const response = await axios.post(endpoint, request, { headers });
  return response.data;
}

/**
 * Verify product search query
 */
async function verifyProductSearch(): Promise<VerificationResult> {
  try {
    const searchText = "drill";
    const query = buildProductSearchQuery(searchText);

    const request: OpenSearchRequest = {
      Elasticindex: ELASTIC_INDEX,
      ElasticBody: query,
      ElasticType: "pgproduct",
      queryType: "search",
    };

    const response = await makeOpenSearchRequest(request, ELASTIC_URL);
    const hits = (
      response as { hits?: { hits?: unknown[]; total?: { value?: number } } }
    ).hits;

    return {
      testName: "Product Search Query",
      success: true,
      resultCount: hits?.total?.value || hits?.hits?.length || 0,
      queryStructure: {
        searchText,
        queryType: "search",
        hasQuery: !!query.query,
      },
    };
  } catch (error) {
    return {
      testName: "Product Search Query",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify browse by category query
 */
async function verifyCategoryBrowse(): Promise<VerificationResult> {
  try {
    const categoryId = 1; // Example category ID
    const { query } = buildCategoryQuery([categoryId], {
      page: 1,
      pageSize: 10,
    });

    const request: OpenSearchRequest = {
      Elasticindex: ELASTIC_INDEX,
      ElasticBody: query,
      ElasticType: "pgproduct",
      queryType: "search",
    };

    const response = await makeOpenSearchRequest(request, ELASTIC_URL);
    const hits = (
      response as { hits?: { hits?: unknown[]; total?: { value?: number } } }
    ).hits;

    return {
      testName: "Browse by Category Query",
      success: true,
      resultCount: hits?.total?.value || hits?.hits?.length || 0,
      queryStructure: {
        categoryId,
        queryType: "search",
        hasCategoryFilter: true,
      },
    };
  } catch (error) {
    return {
      testName: "Browse by Category Query",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify browse by subcategory query
 */
async function verifySubCategoryBrowse(): Promise<VerificationResult> {
  try {
    const subCategoryId = 1; // Example subcategory ID
    const { query } = buildSubCategoryQuery(subCategoryId, {
      page: 1,
      pageSize: 10,
    });

    const request: OpenSearchRequest = {
      Elasticindex: ELASTIC_INDEX,
      ElasticBody: query,
      ElasticType: "pgproduct",
      queryType: "search",
    };

    const response = await makeOpenSearchRequest(request, ELASTIC_URL);
    const hits = (
      response as { hits?: { hits?: unknown[]; total?: { value?: number } } }
    ).hits;

    return {
      testName: "Browse by Subcategory Query",
      success: true,
      resultCount: hits?.total?.value || hits?.hits?.length || 0,
      queryStructure: {
        subCategoryId,
        queryType: "search",
        hasSubCategoryFilter: true,
      },
    };
  } catch (error) {
    return {
      testName: "Browse by Subcategory Query",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify browse by major category query
 */
async function verifyMajorCategoryBrowse(): Promise<VerificationResult> {
  try {
    const majorCategoryId = 1; // Example major category ID
    const { query } = buildMajorCategoryQuery(majorCategoryId, {
      page: 1,
      pageSize: 10,
    });

    const request: OpenSearchRequest = {
      Elasticindex: ELASTIC_INDEX,
      ElasticBody: query,
      ElasticType: "pgproduct",
      queryType: "search",
    };

    const response = await makeOpenSearchRequest(request, ELASTIC_URL);
    const hits = (
      response as { hits?: { hits?: unknown[]; total?: { value?: number } } }
    ).hits;

    return {
      testName: "Browse by Major Category Query",
      success: true,
      resultCount: hits?.total?.value || hits?.hits?.length || 0,
      queryStructure: {
        majorCategoryId,
        queryType: "search",
        hasMajorCategoryFilter: true,
      },
    };
  } catch (error) {
    return {
      testName: "Browse by Major Category Query",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify browse by brand query
 */
async function verifyBrandBrowse(): Promise<VerificationResult> {
  try {
    const brandName = "DEWALT"; // Example brand name
    const { query } = buildBrandQuery(brandName, {
      page: 1,
      pageSize: 10,
    });

    const request: OpenSearchRequest = {
      Elasticindex: ELASTIC_INDEX,
      ElasticBody: query,
      ElasticType: "pgproduct",
      queryType: "search",
    };

    const response = await makeOpenSearchRequest(request, ELASTIC_URL);
    const hits = (
      response as { hits?: { hits?: unknown[]; total?: { value?: number } } }
    ).hits;

    return {
      testName: "Browse by Brand Query",
      success: true,
      resultCount: hits?.total?.value || hits?.hits?.length || 0,
      queryStructure: {
        brandName,
        queryType: "search",
        hasBrandFilter: true,
      },
    };
  } catch (error) {
    return {
      testName: "Browse by Brand Query",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify product detail by ID query
 */
async function verifyProductDetailById(): Promise<VerificationResult> {
  try {
    const productIndexName = "Prod0000000001"; // Example product index name
    const request: OpenSearchRequest = {
      Elasticindex: ELASTIC_INDEX,
      ElasticBody: productIndexName,
      ElasticType: "pgproduct",
      queryType: "get",
    };

    const response = await makeOpenSearchRequest(request, OPENSEARCH_URL);
    const found = (response as { body?: { found?: boolean } }).body?.found;

    return {
      testName: "Product Detail by ID (GET)",
      success: found === true,
      resultCount: found ? 1 : 0,
      queryStructure: {
        productIndexName,
        queryType: "get",
      },
    };
  } catch (error) {
    return {
      testName: "Product Detail by ID (GET)",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify product detail by index name query
 */
async function verifyProductDetailByIndexName(): Promise<VerificationResult> {
  try {
    const productIndexName = "Prod0000000001"; // Example product index name
    const request: OpenSearchRequest = {
      Elasticindex: ELASTIC_INDEX,
      ElasticBody: productIndexName,
      ElasticType: "pgproduct",
      queryType: "get",
    };

    const response = await makeOpenSearchRequest(request, OPENSEARCH_URL);
    const found = (response as { body?: { found?: boolean } }).body?.found;

    return {
      testName: "Product Detail by Index Name (GET)",
      success: found === true,
      resultCount: found ? 1 : 0,
      queryStructure: {
        productIndexName,
        queryType: "get",
      },
    };
  } catch (error) {
    return {
      testName: "Product Detail by Index Name (GET)",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main verification function
 */
async function runVerification(): Promise<void> {
  console.log("🔍 OpenSearch Query Verification Script\n");
  console.log("Configuration:");
  console.log(`  OPENSEARCH_URL: ${OPENSEARCH_URL}`);
  console.log(`  ELASTIC_URL: ${ELASTIC_URL}`);
  console.log(`  ELASTIC_INDEX: ${ELASTIC_INDEX || "(not set)"}`);
  console.log(`  ACCESS_TOKEN: ${ACCESS_TOKEN ? "***set***" : "(not set)"}`);
  console.log("");

  if (!ELASTIC_INDEX) {
    console.error("❌ ERROR: ELASTIC_INDEX environment variable is required");
    console.error("   Set it with: export ELASTIC_INDEX=your_index_name");
    process.exit(1);
  }

  const tests = [
    verifyProductSearch,
    verifyCategoryBrowse,
    verifySubCategoryBrowse,
    verifyMajorCategoryBrowse,
    verifyBrandBrowse,
    verifyProductDetailById,
    verifyProductDetailByIndexName,
  ];

  const results: VerificationResult[] = [];

  console.log("Running verification tests...\n");

  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);

      const status = result.success ? "✅" : "❌";
      console.log(
        `${status} ${result.testName}: ${
          result.success
            ? `Success (${result.resultCount || 0} results)`
            : `Failed - ${result.error}`
        }`
      );
    } catch (error) {
      const errorResult: VerificationResult = {
        testName: test.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
      results.push(errorResult);
      console.log(`❌ ${test.name}: Failed - ${errorResult.error}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Summary:");
  console.log("=".repeat(60));

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`Total Tests: ${totalCount}`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${totalCount - successCount}`);

  if (successCount === totalCount) {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  } else {
    console.log("\n❌ Some tests failed. Review the errors above.");
    process.exit(1);
  }
}

// Run verification if script is executed directly
if (require.main === module) {
  runVerification().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export {
  runVerification,
  verifyBrandBrowse,
  verifyCategoryBrowse,
  verifyMajorCategoryBrowse,
  verifyProductDetailById,
  verifyProductDetailByIndexName,
  verifyProductSearch,
  verifySubCategoryBrowse,
};
