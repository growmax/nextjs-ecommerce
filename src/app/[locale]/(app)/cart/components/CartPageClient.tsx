"use client";

import AddMoreProducts from "@/components/Global/Products/AddMoreProducts";
import { CartProceedButton, MultipleSellerCards } from "@/components/cart";
import CartProductCard from "@/components/cart/CartProductCard";
import { OrderPriceDetails } from "@/components/sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart as useCartContext } from "@/contexts/CartContext";
import { useTenant } from "@/contexts/TenantContext";
import useAccessControl from "@/hooks/useAccessControl";
import { useCart } from "@/hooks/useCart";
import useCartPrice from "@/hooks/useCartPrice";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useGetCurrencyModuleSettings from "@/hooks/useGetCurrencyModuleSettings/useGetCurrencyModuleSettings";
import useModuleSettings from "@/hooks/useModuleSettings";
import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import useSelectedSellerCart from "@/hooks/useSelectedSellerCart";
import DiscountService from "@/lib/api/services/DiscountService/DiscountService";
import OpenElasticSearchService from "@/lib/api/services/ElacticQueryService/openElasticSearch/openElasticSearch";
import type { CartItem } from "@/types/calculation/cart";
import { cartCalculation } from "@/utils/calculation/cartCalculation";
import {
  manipulateProductsElasticData,
} from "@/utils/calculation/salesCalculation/salesCalculation";
import {
  validateCreateOrder,
  validateRequestQuote,
} from "@/utils/cart/cartValidation";
import { assign_pricelist_discounts_data_to_products } from "@/utils/functionalUtils";
import { MoreVertical, ShoppingCart, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CartPageClient() {
  const { user, loading: userLoading } = useCurrentUser();
  const currency = user?.currency;
  const router = useNavigationWithLoader();
  const t = useTranslations("cart");
  const tenantData = useTenant();
  const { cart, cartCount, isLoading: isCartLoading } = useCartContext();
  const {
    addItemToCart,
    changeQty,
    DeleteCart,
    emptyCart,
    isCartLoading: isCartOperationLoading,
  } = useCart();

  const [_updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [_errorMessages, setErrorMessages] = useState<
    Record<number, string | false>
  >({});
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  // Access control
  const { hasQuotePermission, hasOrderPermission } = useAccessControl();
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("selectedSellerId") || null;
      }
      return null;
    }
  );
  //Module settings for minimum values
  const { quoteSettings, orderSettings } = useModuleSettings(
    user ? { userId: user.userId, companyId: user.companyId } : null
  );

  // Currency module settings for minimum values
  const { minimumOrderValue, minimumQuoteValue } = useGetCurrencyModuleSettings(
    user || {},
    quoteSettings?.isMinQuoteValueEnabled ||
      orderSettings?.isMinOrderValueEnabled,
    {}
  );
  // Get selected seller cart for multi-seller support
  // This hook already fetches discount data, applies it, and calculates pricing
  // Use selectedSellerId state to sync with accordion selection
  const {
    selectedSellerItems,
    hasMultipleSellers,
    selectedSellerId: selectedSeller,
    selectedSellerPricing,
    isPricingLoading: isMultiSellerPricingLoading,
  } = useSelectedSellerCart(cart, selectedSellerId);



  // Use useCartPrice for single-seller scenarios to ensure discount calculation is applied
  // This follows the buyer-fe pattern: fetch discounts -> apply to items -> calculate totals
  const handleSellerSelection = (sellerId: string) => {

    setSelectedSellerId(sellerId);
    // Persist to localStorage
    if (typeof window !== "undefined" && sellerId) {
      localStorage.setItem("selectedSellerId", sellerId);
    }
  };
  const {
    cartValue: singleSellerCartValue,
    processedItems: singleSellerProcessedItems,
    isLoading: isSingleSellerPricingLoading,
  } = useCartPrice(cart);

  // Determine which pricing to use:
  // - For multi-seller: use selectedSellerPricing from useSelectedSellerCart
  // - For single-seller: use singleSellerCartValue from useCartPrice (with discount calculation)
  const cartCalculationResult =
    hasMultipleSellers &&
    selectedSellerPricing &&
    Object.keys(selectedSellerPricing).length > 0
      ? selectedSellerPricing
      : singleSellerCartValue
        ? singleSellerCartValue
        : cart.length > 0
          ? cartCalculation(cart, true, 0, 2, {
              roundingAdjustment: false,
              itemWiseShippingTax: false,
            } as any)
          : null;

  // Combine pricing loading states
  const isPricingLoading = hasMultipleSellers
    ? isMultiSellerPricingLoading
    : isSingleSellerPricingLoading;

  // Combine only blocking loading states - don't wait for pricing
  // Pricing loads in background and shows loaders at product/cart level
  const isLoading = userLoading || isCartLoading;

  // Monitor cart changes to clear adding state when product is added
  useEffect(() => {
    if (addingProductId && cart) {
      // Check if the product is now in the cart
      const productInCart = cart.some(
        item => Number(item.productId) === addingProductId
      );

      if (productInCart) {
        // Product added successfully, clear adding state
        setAddingProductId(null);
      }
    }
  }, [cart, addingProductId]);

  // Fallback timeout to clear adding state after 15 seconds
  useEffect(() => {
    if (addingProductId) {
      const timeout = setTimeout(() => {
        setAddingProductId(null);
      }, 15000); // 15 seconds timeout

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [addingProductId]);
  console.log(cartCalculationResult);
  // Show skeleton loader when any loading state is active
  if (isLoading) {
    return (
      <>
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-6 relative">
                    {/* Product Image Skeleton */}
                    <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

                    {/* Product Info - Center */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <Skeleton className="h-5 w-3/4 mb-1" />
                      {/* Brand Name and Product ID */}
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-32" />
                      </div>
                      {/* Seller (optional) */}
                      <Skeleton className="h-4 w-40 mb-2" />
                      {/* Price Display */}
                      <div className="flex flex-col gap-1 mb-2">
                        <Skeleton className="h-5 w-24" />
                      </div>
                      {/* Quantity, Pack of, and MOQ */}
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>

                    {/* Right Section - Delete Button Only (No skeleton for quantity controls or total price) */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Delete Button */}
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <div className="sticky top-4 space-y-4">
              <div className="border rounded-lg p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Only show "log in" message after user loading completes and user is confirmed null
  if (!userLoading && !user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("pleaseLogin")}</h2>
          <p className="text-gray-600">{t("pleaseLoginDescription")}</p>
        </CardContent>
      </Card>
    );
  }


  // Update quantity handler using useCart hook
  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(Number(item.productId)));

    const setErrorMessage = (error: string | false) => {
      setErrorMessages(prev => ({
        ...prev,
        [Number(item.productId)]: error,
      }));
    };

    try {
      await changeQty(
        {
          productId: Number(item.productId),
          itemNo: item.itemNo,
          quantity: newQuantity,
          packagingQty: item.packagingQuantity || item.packagingQty,
          minOrderQuantity: item.minOrderQuantity,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          sellerLocation: item.sellerLocation,
          unitListPrice: item.unitListPrice,
        } as any,
        newQuantity,
        setErrorMessage
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(Number(item.productId));
        return newSet;
      });
    }
  };

  // Remove item handler using useCart hook
  const removeItem = async (item: CartItem) => {
    setUpdatingItems(prev => new Set(prev).add(Number(item.productId)));

    try {
      await DeleteCart(
        Number(item.productId),
        item.itemNo || "",
        item.sellerId
      );
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(Number(item.productId));
        return newSet;
      });
    }
  };

  // Handle request quote with validation
  const handleQuote = (sellerId?: string | number) => {
    // Get cart items for selected seller or all items
    const cartItems = sellerId
      ? cart.filter(item => String(item.sellerId) === String(sellerId))
      : cart;

    // Get pricing for selected seller or overall
    const pricing =
      sellerId && hasMultipleSellers && selectedSellerPricing
        ? selectedSellerPricing
        : cartCalculationResult;

    // Validate request quote
    const validation = validateRequestQuote({
      cart: cartItems,
      selectedSellerPricing: pricing,
      userId: user?.userId ?? null,
      ...(minimumQuoteValue !== undefined ? { minimumQuoteValue } : {}),
      isMinQuoteValueEnabled: quoteSettings?.isMinQuoteValueEnabled,
      ...(currency
        ? {
            currency: {
              currencyCode: currency.currencyCode,
              symbol: currency.symbol,
            },
          }
        : {}),
      hasAccessPermission: hasQuotePermission,
    });

    if (!validation.isValid) {
      // Show error message
      if (validation.errorMessage) {
        toast.info(validation.errorMessage, {
          duration: 4000,
        });
      }

      // Redirect to login if not authenticated
      if (validation.errorMessage?.includes("login")) {
        router.push(`/login?from=Cart&back=${window.history.length}`);
      }

      return;
    }

    // All validations passed, proceed to quote summary
    const query = sellerId ? `?sellerId=${sellerId}` : "";
    router.push(`/quotesummary${query}`);
  };

  // Handle create order with validation
  const handleOrder = (sellerId?: string | number) => {
    // Get cart items for selected seller or all items
    const cartItems = sellerId
      ? cart.filter(item => String(item.sellerId) === String(sellerId))
      : cart;

    // Get pricing for selected seller or overall
    const pricing =
      sellerId && hasMultipleSellers && selectedSellerPricing
        ? selectedSellerPricing
        : cartCalculationResult;

    // Validate create order
    const validation = validateCreateOrder({
      cart: cartItems,
      selectedSellerPricing: pricing,
      userId: user?.userId ?? null,
      ...(minimumOrderValue !== undefined ? { minimumOrderValue } : {}),
      isMinOrderValueEnabled: orderSettings?.isMinOrderValueEnabled,
      ...(currency
        ? {
            currency: {
              currencyCode: currency.currencyCode,
              symbol: currency.symbol,
            },
          }
        : {}),
      futureStock: false, // TODO: Get from module settings if needed
      hasAccessPermission: hasOrderPermission,
      buyerActive: true, // TODO: Get from buyer selection if seller-fe
    });

    if (!validation.isValid) {
      // Show error message
      if (validation.errorMessage) {
        toast.info(validation.errorMessage, {
          duration: 4000,
        });
      }

      // Redirect to login if not authenticated
      if (validation.errorMessage?.includes("login")) {
        router.push(`/login?from=Cart&back=${window.history.length}`);
      }

      return;
    }

    // All validations passed, proceed to order summary
    const query = sellerId ? `?sellerId=${sellerId}` : "";
    router.push(`/ordersummary${query}`);
  };

  // Handle callback for AddMoreProducts - adds product to cart
  // Migrated from buyer-fe/src/components/Cart/Cart.js HandleCallback
  // Following buyer-fe pattern: Use productIndexName to call ELASTIC_URL with GET request
  const handleAddMoreCallback = async (product: {
    productId: number;
    id: string;
    brandProductId?: string;
    productName?: string;
    productShortDescription?: string;
    shortDescription?: string;
    brandsName?: string;
    brandName?: string;
    productAssetss?: Array<{ source: string; isDefault?: number | boolean }>;
    productIndexName?: string;
  }) => {
    if (!user?.userId || !user?.companyId) {
      toast.error("Please login to add products to cart");
      return;
    }

    // Track product being added
    const productId = Number(product.productId);
    setAddingProductId(productId);

    try {
      // Get elastic index from tenant data
      const elasticIndex = tenantData?.tenant?.elasticCode
        ? `${tenantData.tenant.elasticCode}pgandproducts`
        : "schwingstetterpgandproducts";

      // Get product using productIndexName via GET request (following buyer-fe pattern)
      // Payload: { Elasticindex, ElasticBody: productIndexName, ElasticType: "pgproduct", queryType: "get" }
      if (!product.productIndexName) {
        setAddingProductId(null);
        toast.error("Product index name is missing");
        return;
      }

      const elasticProduct = await OpenElasticSearchService.getProduct(
        product.productIndexName,
        elasticIndex,
        "pgproduct",
        "get"
      );
      console.log(elasticProduct);
      if (!elasticProduct) {
        setAddingProductId(null);
        toast.error("Product not found");
        return;
      }
    
      // Format and manipulate Elasticsearch data
      // getProduct returns a single ProductDetail, so we need to format it
    
   
      // const pdData = formatElasticResponse(
      //   { body: { hits: { hits: elasticProduct } } } as any
      // );
      const formattedData = manipulateProductsElasticData(
        (Array.isArray(elasticProduct) ? elasticProduct : [elasticProduct]) as any
      ) as any[];
      const formattedDataArray = Array.isArray(formattedData)
        ? formattedData
        : [formattedData];

      if (!formattedDataArray || formattedDataArray.length === 0) {
        setAddingProductId(null);
        toast.error("Failed to process product data");
        return;
      }

      const newcartdata = formattedDataArray[0] as any;

      // Check for replacement/alternative products
      if (newcartdata?.replacement || newcartdata?.alternativeProduct) {
        // TODO: Handle replacement/alternative product dialog
        setAddingProductId(null);
        toast.info("Product has replacement/alternative options");
        return;
      }

      // Step 1: Call getAllSellerPrices (elastic) - following buyer-fe pattern
      const getAllSellerPricesPayload = {
        Productid: [product.productId],
        CurrencyId: typeof currency?.id === "number" ? currency.id : Number(currency?.id) || 0,
        BaseCurrencyId: typeof tenantData?.currency?.id === "number" 
          ? tenantData.currency.id 
          : Number(tenantData?.currency?.id) || 0,
        CompanyId: user.companyId,
      };

      await DiscountService.getAllSellerPrices(
        getAllSellerPricesPayload
      ).catch(() => {
        // If getAllSellerPrices fails, continue with discount call
        // This is non-blocking as discount service will still work
      });

      // Step 2: Call discount service
      const discountPayload = {
        Productid: [product.productId],
        CurrencyId: typeof currency?.id === "number" ? currency.id : Number(currency?.id) || 0,
        companyId: user.companyId,
        BaseCurrencyId: typeof tenantData?.currency?.id === "number" 
          ? tenantData.currency.id 
          : Number(tenantData?.currency?.id) || 0,
      };

      const discount = await DiscountService.getDiscount({
        userId: user.userId,
        tenantId: tenantData?.tenant?.tenantCode || "",
        body: discountPayload,
      });

      // Assign discount data to product
      const discountData = Array.isArray(discount?.data)
        ? discount.data[0]
        : discount?.data || {};
      const enrichedProduct = assign_pricelist_discounts_data_to_products(
        newcartdata as Record<string, unknown>,
        (discountData as unknown) as Record<string, unknown>,
        true
      ) as CartItem;

      // Set quantity (MOQ or packaging quantity or 1)
      enrichedProduct.quantity = enrichedProduct.minOrderQuantity
        ? parseFloat(String(enrichedProduct.minOrderQuantity))
        : enrichedProduct.packagingQuantity
          ? parseFloat(String(enrichedProduct.packagingQuantity))
          : 1;
      enrichedProduct.askedQuantity = enrichedProduct.quantity;

      // Set product description and brand
      enrichedProduct.shortDescription =
        product.productShortDescription || product.shortDescription || "";
      enrichedProduct.brandName = product.brandsName || product.brandName || "";

      // Calculate DMC if applicable
      const productCost = enrichedProduct.productCost || 0;
      if (productCost > 0 && enrichedProduct.unitPrice > 0) {
        enrichedProduct.dmc =
          (productCost / enrichedProduct.unitPrice) * 100;
        enrichedProduct.marginPercentage = 100 - enrichedProduct.dmc;
      } else {
        enrichedProduct.dmc = 0;
        enrichedProduct.marginPercentage = 0;
      }

      // Add to cart using addItemToCart hook
      const setErrorMessage = (error: string | false) => {
        if (error) {
          toast.error(String(error));
        }
      };

      await addItemToCart(
        {
          productId: Number(enrichedProduct.productId),
          quantity: enrichedProduct.quantity,
          ...(enrichedProduct.packagingQuantity && {
            packagingQty: enrichedProduct.packagingQuantity,
          }),
          ...(enrichedProduct.minOrderQuantity && {
            minOrderQuantity: enrichedProduct.minOrderQuantity,
          }),
          ...(enrichedProduct.brandName && {
            brandsName: enrichedProduct.brandName,
          }),
          ...(enrichedProduct.shortDescription && {
            productShortDescription: enrichedProduct.shortDescription,
          }),
          ...(enrichedProduct.productAssetss && {
            productAssetss: enrichedProduct.productAssetss,
          }),
          ...(enrichedProduct.img && { img: enrichedProduct.img }),
          ...(discountData?.sellerId && {
            sellerId: Number(discountData.sellerId),
          }),
          ...(discountData?.sellerName && {
            sellerName: discountData.sellerName,
          }),
          ...((discountData as any)?.sellerLocation && {
            sellerLocation: (discountData as any).sellerLocation,
          }),
          ...(enrichedProduct.unitListPrice && {
            unitListPrice: enrichedProduct.unitListPrice,
          }),
        },
        setErrorMessage,
        false,
        false
      );

    } catch (error) {
      console.error("Error adding product to cart:", error);
      setAddingProductId(null);
      toast.error("Failed to add product to cart");
    }
  };
  
  // If cart is empty, show empty state with heading and search bar
  // OR show skeleton loaders if product is being added
  if (!cart || cart.length === 0) {
    // Show skeleton loaders when adding a product
    if (addingProductId) {
      return (
        <>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
                <p className="text-muted-foreground text-sm">
                  {t("itemsInCart", { count: cartCount })}
                </p>
              </div>
              {user?.companyId && !isCartLoading && (
                <div className="w-full sm:w-auto sm:flex-1 sm:max-w-2xl flex items-center gap-2">
                  <AddMoreProducts
                    handleCallback={handleAddMoreCallback}
                    popWidth="100%"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-6 relative">
                    {/* Product Image Skeleton */}
                    <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

                    {/* Product Info - Center */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <Skeleton className="h-5 w-3/4 mb-1" />
                      {/* Brand Name and Product ID */}
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-32" />
                      </div>
                      {/* Seller (optional) */}
                      <Skeleton className="h-4 w-40 mb-2" />
                      {/* Price Display */}
                      <div className="flex flex-col gap-1 mb-2">
                        <Skeleton className="h-5 w-24" />
                      </div>
                      {/* Quantity, Pack of, and MOQ */}
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>

                    {/* Right Section - Delete Button Only (No skeleton for quantity controls or total price) */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Delete Button */}
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Details Skeleton */}
            <div>
              <div className="sticky top-4 space-y-4">
                <div className="border rounded-lg p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                  </div>
                </div>
                {/* CartProceedButton Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded" />
                  <Skeleton className="h-12 w-full rounded" />
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    // Show empty cart state when not adding a product
    return (
      <>
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
              <p className="text-muted-foreground text-sm">
                {t("itemsInCart", { count: cartCount })}
              </p>
            </div>
            {user?.companyId && !isCartLoading && (
              <div className="w-full sm:w-auto sm:flex-1 sm:max-w-2xl flex items-center gap-2">
                <AddMoreProducts
                  handleCallback={handleAddMoreCallback}
                  popWidth="100%"
                />
              </div>
            )}
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("empty")}</h2>
            <p className="text-gray-600">{t("emptyDescription")}</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground text-sm">
              {t("itemsInCart", { count: cartCount })}
            </p>
          </div>
          {user?.companyId && !isCartLoading && (
            <div className="w-full sm:w-auto sm:flex-1 sm:max-w-2xl flex items-center gap-2">
              <AddMoreProducts
                handleCallback={handleAddMoreCallback}
                popWidth="100%"
              />
              {cart.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 flex-shrink-0"
                      aria-label="Cart options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setShowClearCartDialog(true)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={
          hasMultipleSellers
            ? "w-full"
            : "grid grid-cols-1 lg:grid-cols-3 gap-6"
        }
      >
        {/* Cart Items */}
        <div className={hasMultipleSellers ? "w-full" : "lg:col-span-2"}>
          {/* Multi-seller cart display */}
          {hasMultipleSellers ? (
            <MultipleSellerCards
              isPricingLoading={isPricingLoading}
              onItemUpdate={async (item, quantity) => {
                await updateQuantity(item, quantity);
              }}
              onItemDelete={async (productId, itemNo, sellerId) => {
                await removeItem(
                  cart.find(
                    i =>
                      Number(i.productId) === productId &&
                      i.itemNo === itemNo &&
                      (sellerId ? i.sellerId == sellerId : true)
                  )!
                );
              }}
              onSellerSelect={handleSellerSelection}
              handleOrder={handleOrder}
              handleQuote={handleQuote}
              products={selectedSellerItems}
              cartCalculationResult={cartCalculationResult}
            />
          ) : (
            /* Single seller or no seller - show all items */
            // Use processed items with discount-calculated prices if available, otherwise use raw cart items
            (singleSellerProcessedItems.length > 0
              ? singleSellerProcessedItems
              : cart
            ).map((item, index) => {
              return (
                <CartProductCard
                  key={`${item.productId}-${item.itemNo}-${item.sellerId || "no-seller"}-${index}`}
                  item={item}
                  isPricingLoading={isPricingLoading}
                  onUpdate={async quantity => {
                    await updateQuantity(item, quantity);
                  }}
                  onDelete={async () => {
                    await removeItem(item);
                  }}
                />
              );
            })
          )}
        </div>

        {/* Order Summary - Only show for single seller */}
        {!hasMultipleSellers && (
          <div>
            <div className="sticky top-4 space-y-4">
              {/* {cartCalculationResult && currency && (
                <CartPriceDetails
                  cartValue={cartCalculationResult}
                  currency={currency}
                  isCart={true}
                  isPricingLoading={isPricingLoading || isCartOperationLoading}
                />
              )} */}
              <OrderPriceDetails
                products={selectedSellerItems}
                isInter={false}
                insuranceCharges={cartCalculationResult?.insuranceCharges || 0}
                loading={isPricingLoading || isCartOperationLoading}
                precision={2}
                Settings={{
                  roundingAdjustment: true,
                }}
                isSeller={false}
                taxExemption={false}
                currency={currency?.symbol || "INR ₹"}
                overallShipping={cartCalculationResult?.totalShipping || 0}
                overallTax={cartCalculationResult?.totalTax || 0}
                calculatedTotal={cartCalculationResult?.grandTotal || 0}
                subTotal={cartCalculationResult?.totalValue || 0}
                taxableAmount={cartCalculationResult?.taxableAmount || 0}
                totalCashDiscount={cartCalculationResult?.totalCashDiscount || 0}
                cashDiscountValue={cartCalculationResult?.cashDiscountValue || 0}
                totalBasicDiscount={cartCalculationResult?.totalBasicDiscount || 0}
                isCart ={true}
              />

              <CartProceedButton
                selectedSellerId={selectedSeller}
                disabled={cart.length === 0 || isCartOperationLoading}
                isLoading={isPricingLoading ||isCartOperationLoading}
                onRequestQuote={() => handleQuote(selectedSeller)}
                onPlaceOrder={() => handleOrder(selectedSeller)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Dialog */}
      <Dialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Clear Cart Items
            </DialogTitle>
            <DialogDescription className="text-base text-foreground pt-2">
              Do you want to clear items in cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowClearCartDialog(false)}
              className="min-w-[100px]"
            >
              CANCEL
            </Button>
            <Button
              variant="default"
              onClick={async () => {
                await emptyCart();
                setShowClearCartDialog(false);
              }}
              className="min-w-[100px] bg-gray-900 hover:bg-gray-800 text-white"
            >
              YES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
