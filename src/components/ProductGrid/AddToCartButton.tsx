"use client";

import AddToCartSection, { type AddToCartSectionProps } from "@/components/product/AddToCartSection";
import { DiscountItem } from "@/lib/api/services/DiscountService/DiscountService";

interface AddToCartButtonProps {
  productId: number;
  productTitle: string;
  isAvailable: boolean;
  compact?: boolean;
  className?: string;
  // Optional product data fields
  packagingQty?: number;
  minOrderQuantity?: number;
  sellerId?: number | string;
  sellerName?: string;
  sellerLocation?: string;
  unitListPrice?: number;
  itemNo?: number | string;
  productAssetss?: Array<{
    source: string;
    isDefault?: boolean;
  }>;
  brandsName?: string;
  productShortDescription?: string;
  img?: string;
  // Discount data props (from batched fetch)
  discountData?: DiscountItem[];
  discountLoading?: boolean;
  discountError?: Error | null;
}

/**
 * AddToCartButton Component
 * Wrapper component for AddToCartSection that can be used in server components
 * Supports compact mode for table view
 */
export default function AddToCartButton({
  productId,
  productTitle,
  isAvailable,
  compact = false,
  className,
  packagingQty,
  minOrderQuantity,
  sellerId,
  sellerName,
  sellerLocation,
  unitListPrice,
  itemNo,
  productAssetss,
  brandsName,
  productShortDescription,
  img,
  discountData,
  discountLoading,
  discountError,
}: AddToCartButtonProps) {
  const props: AddToCartSectionProps = {
    productId,
    productTitle,
    isAvailable,
    compact,
    ...(className && { className }),
    ...(packagingQty !== undefined && { packagingQty }),
    ...(minOrderQuantity !== undefined && { minOrderQuantity }),
    ...(sellerId !== undefined && { sellerId }),
    ...(sellerName !== undefined && { sellerName }),
    ...(sellerLocation !== undefined && { sellerLocation }),
    ...(unitListPrice !== undefined && { unitListPrice }),
    ...(itemNo !== undefined && { itemNo }),
    ...(productAssetss !== undefined && { productAssetss }),
    ...(brandsName !== undefined && { brandsName }),
    ...(productShortDescription !== undefined && { productShortDescription }),
    ...(img !== undefined && { img }),
    ...(discountData !== undefined && { discountData }),
    ...(discountLoading !== undefined && { discountLoading }),
    ...(discountError !== undefined && { discountError }),
  };

  return <AddToCartSection {...props} />;
}

