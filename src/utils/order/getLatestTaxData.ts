import { RequestContext } from "@/lib/api/client";
import DiscountService from "@/lib/api/services/DiscountService";
import SearchService from "@/lib/api/services/SearchService";
import { calculateCart } from "@/utils/calculation/cart-calculation";
import { discountDetails } from "@/utils/calculation/cartCalculation";
import { getSuitableDiscountByQuantity } from "@/utils/calculation/discountCalculation";
import {
  manipulateProductsElasticData,
  setTaxDetails,
} from "@/utils/calculation/salesCalculation";
import { formatElasticResponse } from "@/utils/elasticsearch/format-response";
import { assignPricelistDiscountsDataToProducts } from "@/utils/functionalUtils";
import filter from "lodash/filter";
import find from "lodash/find";
import map from "lodash/map";
import round from "lodash/round";

// Currency can be number (ID) or object with id/currencyCode
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CurrencyType = any;

interface GetLatestTaxDataParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  isCloneReOrder?: boolean;
  taxExemption?: boolean;
  isInter?: boolean;
  isSprRequested?: boolean;
  isPlaceOrder?: boolean;
  currency?: CurrencyType;
  companyId?: number;
  userId?: number;
  tenantCode?: string;
  sellerCurrency?: CurrencyType;
  // user's currency object from useCurrentUser
  userCurrency?: CurrencyType;
  roundOff?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quoteSettings?: any;
  elasticIndex?: string;
  context?: RequestContext;
}

/**
 * Get latest tax data and update products with current pricing, discounts, and taxes
 * Uses existing DiscountService.getDiscount() and SearchService.getProductsByIds()
 */
export async function getLatestTaxData({
  products,
  isCloneReOrder = false,
  taxExemption = false,
  isInter = true,
  isSprRequested = false,
  isPlaceOrder = false,
  currency,
  companyId,
  userId,
  tenantCode,
  sellerCurrency,
  userCurrency,
  roundOff = 2,
  quoteSettings,
  elasticIndex = "pgproduct",
  context,
}: GetLatestTaxDataParams) {
  try {
    if (!products || products.length === 0) {
      return products;
    }

    // Extract product IDs
    const prdIds = map(filter(products, "productId"), "productId") as number[];

    if (prdIds.length === 0) {
      return products;
    }

    // Build request context if not provided
    const requestContext: RequestContext | undefined =
      context ||
      (userId && companyId && tenantCode
        ? {
            userId,
            companyId,
            tenantCode,
          }
        : undefined);

    // Extract currency IDs - handle both number and object formats
    // Fallback to user's currency if order currency is 0 or undefined
    let currencyId =
      typeof currency === "number" ? currency : currency?.id || 0;
    let baseCurrencyId =
      typeof sellerCurrency === "number"
        ? sellerCurrency
        : sellerCurrency?.id || 0;

    // If currency IDs are 0 or invalid, fall back to user's currency ID
    const userCurrencyId =
      typeof userCurrency === "number" ? userCurrency : userCurrency?.id;

    if ((!currencyId || currencyId === 0) && userCurrencyId) {
      currencyId = userCurrencyId;
    }

    if ((!baseCurrencyId || baseCurrencyId === 0) && userCurrencyId) {
      baseCurrencyId = userCurrencyId;
    }

    // Extract currency code - try from currency object, sellerCurrency, userCurrency, or default to INR
    const currencyCode =
      typeof currency === "object" && currency?.currencyCode
        ? currency.currencyCode
        : typeof sellerCurrency === "object" && sellerCurrency?.currencyCode
          ? sellerCurrency.currencyCode
          : typeof userCurrency === "object" && userCurrency?.currencyCode
            ? userCurrency.currencyCode
            : "INR"; // Default to INR

    // Ensure we have userId, companyId, and tenantCode for the discount API
    if (!userId || !companyId || !tenantCode) {
      throw new Error(
        "Missing required parameters: userId, companyId, or tenantCode"
      );
    }

    // Parallel API calls using existing services
    const [discountsResult, elasticProducts] = await Promise.all([
      // Use DiscountService.getDiscount() with proper payload structure
      // Payload format: { userId, tenantId, body: { Productid, CurrencyId, BaseCurrencyId, companyId, currencyCode } }
      DiscountService.getDiscount({
        userId,
        tenantId: tenantCode,
        body: {
          Productid: prdIds,
          CurrencyId: currencyId,
          BaseCurrencyId: baseCurrencyId,
          companyId,
          currencyCode,
        },
      }),
      // Use SearchService.getProductsByIds() - calls Elasticsearch directly
      SearchService.getProductsByIds(prdIds, elasticIndex, requestContext),
    ]);

    // Handle response structure: { success: true, data: [...] } or { data: [...] }
    // The old API route returned { success: true, data: data?.data }
    // Keep discountsData as object with data property to match old JS logic
    let discountsData: { data?: any[] } | null = null; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (discountsResult) {
      const result = discountsResult as {
        success?: boolean;
        data?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
      };

      if (result.success !== undefined && result.data) {
        // Response format: { success: true, data: [...] }
        discountsData = { data: result.data };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dataResult = discountsResult as { data?: any[] };
        if (dataResult.data) {
          // Response format: { data: [...] }

          discountsData = { data: dataResult.data };
        } else if (Array.isArray(discountsResult)) {
          // Response is directly an array - wrap it
          discountsData = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: discountsResult as any[],
          };
        }
      }
    }

    // Format and manipulate Elasticsearch data
    // formatElasticResponse expects response structure, so we create a compatible structure
    const pdData = formatElasticResponse(
      elasticProducts.length > 0 ? { data: elasticProducts } : { data: [] }
    );
    const formattedData = manipulateProductsElasticData(
      (Array.isArray(pdData) ? pdData : [pdData]) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    ) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    const formattedDataArray = Array.isArray(formattedData)
      ? formattedData
      : [formattedData];

    let tempProducts: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!isPlaceOrder) {
      // Edit order flow
      // Match old JS: if (formattedData && discountsData?.data)
      if (
        formattedDataArray.length > 0 &&
        discountsData?.data &&
        discountsData.data.length > 0
      ) {
        tempProducts = await Promise.all(
          products.map(async item => {
            // Find matching discount data
            // Match old JS: find(discountsData?.data || [], (disc) => disc["ProductVariantId"] === item["productId"])
            const prd_wise_discData =
              find(
                discountsData.data || [],
                disc => disc["ProductVariantId"] === item["productId"]
              ) || {};

            // Assign pricelist discounts to product
            item = assignPricelistDiscountsDataToProducts(
              item,
              prd_wise_discData,
              false
            );

            // Check for latest product discounts (equivalent to check_latest_product_discounts)
            if (!isCloneReOrder) {
              // Check if discountsList exists and find suitable discount
              if (item.discountsList && item.discountsList.length > 0) {
                const { suitableDiscount } = getSuitableDiscountByQuantity(
                  item.quantity || 1,
                  item.discountsList,
                  item.packagingQuantity || 1
                );
                if (suitableDiscount) {
                  item.discountDetails = { ...suitableDiscount };
                  item.discount = suitableDiscount.Value || 0;
                  item.discountPercentage = item.discount;
                }
              }
              // Also check if discountDetails exists from pricelist assignment
              if (item.discountDetails?.Value !== undefined) {
                item.discountPercentage = item.discountDetails.Value || 0;
                item.discount = item.discountPercentage || 0;
              }
            }

            // Find matching Elasticsearch data
            const temp = find(formattedDataArray, [
              "productId",
              item.productId,
            ]);

            // Update tax and category info
            if (temp) {
              item.taxInclusive =
                (temp as any)?.taxInclusive ?? item.taxInclusive; // eslint-disable-line @typescript-eslint/no-explicit-any
              item.primary_products_categoryObjects =
                (temp as any)?.primary_products_categoryObjects ?? // eslint-disable-line @typescript-eslint/no-explicit-any
                item.primary_products_categoryObjects;
              item.hsnDetails = (temp as any)?.hsnDetails || item.hsnDetails; // eslint-disable-line @typescript-eslint/no-explicit-any
              item.listPricePublic =
                (temp as any)?.listPricePublic ?? item.listPricePublic; // eslint-disable-line @typescript-eslint/no-explicit-any
              item.showPrice =
                (temp as any)?.showPrice ?? item.priceNotAvailable; // eslint-disable-line @typescript-eslint/no-explicit-any
            }

            // Clone/Reorder specific logic
            if (isCloneReOrder) {
              // Add bundle products (equivalent to addBundleProducts_In_AddMoreProducts)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (temp && (temp as any).bundleProducts) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                item.bundleProducts = (temp as any).bundleProducts;
              }

              item.addonCost = 0;
              item.quantity = item.askedQuantity || item.quantity;
              item.listPricePublic =
                (temp as any)?.listPricePublic ?? item.listPricePublic; // eslint-disable-line @typescript-eslint/no-explicit-any
              item.showPrice =
                (temp as any)?.showPrice ?? item.priceNotAvailable; // eslint-disable-line @typescript-eslint/no-explicit-any
              item.hsnDetails = (temp as any)?.hsnDetails || item.hsnDetails; // eslint-disable-line @typescript-eslint/no-explicit-any

              // Resetting latest unitListPrice
              item.initial_unitListPrice_fe =
                (temp as any)?.unitListPrice ?? item.unitListPrice; // eslint-disable-line @typescript-eslint/no-explicit-any

              item.discountPercentage = item.discountDetails?.Value || 0;
              item.discount = item.discountPercentage || 0;
              item.quantity = item.askedQuantity || item.quantity;

              item = assignPricelistDiscountsDataToProducts(
                item,
                prd_wise_discData
              );

              // This unitprice will sets the default pricing while reorder and clone.
              item.unitPrice = round(
                item.unitListPrice -
                  (item.unitListPrice * parseFloat(item.discount || 0)) / 100,
                roundOff
              );
            }

            return item;
          })
        );
      } else {
        // If no formatted data or discounts, return original products
        tempProducts = products;
      }
    } else {
      // Place order flow
      // Match old JS: if (discountsData?.data)
      if (discountsData?.data && discountsData.data.length > 0) {
        tempProducts = products.map(item => {
          let BasePrice: number | undefined;
          let MasterPrice: number | undefined;
          let CantCombineWithOtherDisCounts: boolean | undefined;

          // Match old JS: find(discountsData?.data, (disc) => { ... })
          const discountsList = find(discountsData.data, disc => {
            if (disc["ProductVariantId"] === item["productId"]) {
              BasePrice = disc["BasePrice"];
              MasterPrice = disc["MasterPrice"];
              CantCombineWithOtherDisCounts =
                disc["CantCombineWithOtherDisCounts"];
              return disc["ProductVariantId"] === item["productId"];
            }
            return false;
          });

          item.MasterPrice = MasterPrice;
          item.BasePrice = BasePrice;
          item.CantCombineWithOtherDisCounts = CantCombineWithOtherDisCounts;

          const discounts = discountsList?.["discounts"] || [];

          // Find suitable discount
          const { suitableDiscount } = getSuitableDiscountByQuantity(
            item?.quantity || 1,
            discounts,
            item.quantity || 1
          );

          if (suitableDiscount?.Value === item.discount) {
            item.discountDetails = {
              ...suitableDiscount,
              BasePrice,
            };
          } else {
            item.discountDetails = {
              ...(item.discountDetails || {}),
            };
            item.discountDetails.Value = item.discount;
            item.discountPercentage = item.discountDetails?.Value || 0;
            item.discount = item.discountPercentage || 0;
          }

          item.discountDetails.BasePrice = item.BasePrice;
          item.discountDetails.plnErpCode = item.plnErpCode;
          item.discountDetails.priceListCode = item.priceListCode;
          item.CantCombineWithOtherDisCounts =
            item.discountDetails.CantCombineWithOtherDisCounts;

          // Update with Elasticsearch data
          const temp = find(formattedDataArray, ["productId", item.productId]);
          if (temp) {
            item.taxInclusive =
              (temp as any)?.taxInclusive ?? item.taxInclusive; // eslint-disable-line @typescript-eslint/no-explicit-any
            item.primary_products_categoryObjects =
              (temp as any)?.primary_products_categoryObjects ?? // eslint-disable-line @typescript-eslint/no-explicit-any
              item.primary_products_categoryObjects;
            item.hsnDetails = (temp as any)?.hsnDetails || item.hsnDetails; // eslint-disable-line @typescript-eslint/no-explicit-any
          }

          if (!isSprRequested) {
            item.discountPercentage = item.discountDetails?.Value || 0;
            item.discount = item.discountPercentage || 0;
          }

          return item;
        });
      } else {
        // If no discounts, return original products
        tempProducts = products;
      }
    }

    // Pre-process products with discountDetails
    // Cast to CartItem[] as discountDetails expects CartItem[]
    const processedProducts = discountDetails(
      (tempProducts.length > 0 ? tempProducts : products) as any[], // eslint-disable-line @typescript-eslint/no-explicit-any
      false, // isSeller
      taxExemption,
      roundOff
    );

    // Set tax details
    // Cast processedProducts to ExistingProduct[] as setTaxDetails expects it
    const resultSet = setTaxDetails(
      processedProducts as any[], // eslint-disable-line @typescript-eslint/no-explicit-any
      formattedDataArray as any[], // eslint-disable-line @typescript-eslint/no-explicit-any
      isInter,
      taxExemption
    );

    // Final calculation if clone/reorder
    // Match old JS: resultSet = cloneCalculation(roundOff, tempProducts, taxExemption, isInter, quoteSettings)
    // cloneCalculation returns the processed products array (not CartValue)
    // Use calculateCart instead of cartCalculation to get processedItems
    if (isCloneReOrder && resultSet) {
      const calculated = calculateCart({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cartData: resultSet as any[],
        isInter,
        insuranceCharges: 0,
        precision: roundOff,
        settings: quoteSettings || {},
      });
      // calculateCart returns { cartValue, processedItems }
      // cloneCalculation returns the processed items array
      return calculated.processedItems;
    }

    return resultSet || products;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in getLatestTaxData:", error);
    return products; // Return original products on error
  }
}
