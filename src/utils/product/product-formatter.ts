import { ProductDetail, ProductDisplayData } from "@/types/product/product-detail";

/**
 * Product Formatter Utilities
 * 
 * Transform and normalize product data from OpenSearch for display
 */

/**
 * Format product for display in cards and lists
 * 
 * @param product - Raw product data from OpenSearch
 * @returns Simplified product display data
 */
export function formatProductForDisplay(
  product: ProductDetail
): ProductDisplayData {
  const brandName = product.brand_name || product.brands_name || "Unknown Brand";
  const images = product.product_assetss || [];
  const primaryImage = images.find(img => img.isDefault)?.source || images[0]?.source || "";

  return {
    id: product.product_index_name,
    productId: product.product_id,
    title: product.title || product.product_short_description || "Untitled Product",
    shortDescription: product.product_short_description || product.product_description || "",
    brandName,
    brandProductId: product.brand_product_id || "",
    price: product.unit_list_price || 0,
    mrp: product.unit_mrp || 0,
    images,
    primaryImage,
    isAvailable: Boolean(product.is_published),
    isNew: Boolean(product.is_new),
    inStock: true, // Default to true, can be enhanced with inventory data
    slug: "", // Will be generated separately
  };
}

/**
 * Format price for display
 * 
 * @param price - Price value
 * @param currency - Currency symbol (default: "₹")
 * @param precision - Decimal places (default: 2)
 * @returns Formatted price string
 */
export function formatPrice(
  price: number,
  currency: string = "₹",
  precision: number = 2
): string {
  if (!price || isNaN(price)) return `${currency}0`;
  
  return `${currency} ${price.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Get product availability status
 * 
 * @param product - Product detail
 * @returns Availability status object
 */
export function getProductAvailability(product: ProductDetail): {
  available: boolean;
  status: "in-stock" | "out-of-stock" | "discontinued" | "coming-soon";
  message: string;
} {
  if (product.is_discontinued) {
    return {
      available: false,
      status: "discontinued",
      message: "This product has been discontinued",
    };
  }

  if (!product.is_published) {
    return {
      available: false,
      status: "coming-soon",
      message: "Coming soon",
    };
  }

  // Check inventory if available
  if (product.inventory && product.inventory.length > 0) {
    const totalAvailable = product.inventory.reduce(
      (sum, inv) => sum + (inv.availableQuantity || 0),
      0
    );

    if (totalAvailable > 0) {
      return {
        available: true,
        status: "in-stock",
        message: "In stock",
      };
    } else {
      return {
        available: false,
        status: "out-of-stock",
        message: "Out of stock",
      };
    }
  }

  // Default to available if published
  return {
    available: true,
    status: "in-stock",
    message: "Available",
  };
}

/**
 * Format dimensions string
 * 
 * @param dimensions - Dimensions string from product
 * @returns Formatted dimensions or empty string
 */
export function formatDimensions(dimensions?: string): string {
  if (!dimensions || dimensions.trim() === "") return "";
  return dimensions.trim();
}

/**
 * Format weight string
 * 
 * @param weight - Weight string from product
 * @returns Formatted weight or empty string
 */
export function formatWeight(weight?: string): string {
  if (!weight || weight.trim() === "") return "";
  return weight.trim();
}

/**
 * Get primary image URL with fallback
 * 
 * @param product - Product detail
 * @param fallbackUrl - Fallback image URL
 * @returns Image URL
 */
export function getPrimaryImageUrl(
  product: ProductDetail,
  fallbackUrl: string = "/asset/default-placeholder.png"
): string {
  const images = product.product_assetss || [];
  const primaryImage = images.find(img => img.isDefault);
  
  if (primaryImage?.source) return primaryImage.source;
  if (images[0]?.source) return images[0].source;
  
  return fallbackUrl;
}

/**
 * Get all image URLs
 * 
 * @param product - Product detail
 * @returns Array of image URLs
 */
export function getImageUrls(product: ProductDetail): string[] {
  const images = product.product_assetss || [];
  return images
    .filter(img => img.source)
    .map(img => img.source);
}

/**
 * Format lead time for display
 * 
 * @param leadTime - Lead time value
 * @param uom - Unit of measure (D=Days, W=Weeks, M=Months)
 * @returns Formatted lead time string
 */
export function formatLeadTime(leadTime?: string, uom?: string): string {
  if (!leadTime || leadTime === "0") return "Available now";
  
  const time = parseInt(leadTime, 10);
  if (isNaN(time)) return "";
  
  const unitMap: Record<string, string> = {
    D: time === 1 ? "day" : "days",
    W: time === 1 ? "week" : "weeks",
    M: time === 1 ? "month" : "months",
    Y: time === 1 ? "year" : "years",
  };
  
  const unit = uom && unitMap[uom.toUpperCase()] ? unitMap[uom.toUpperCase()] : "days";
  
  return `${time} ${unit}`;
}

/**
 * Calculate discount percentage
 * 
 * @param mrp - Maximum retail price
 * @param sellingPrice - Selling price
 * @returns Discount percentage
 */
export function calculateDiscountPercentage(mrp: number, sellingPrice: number): number {
  if (!mrp || mrp <= 0 || !sellingPrice || sellingPrice <= 0) return 0;
  if (sellingPrice >= mrp) return 0;
  
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}

/**
 * Check if product has specifications
 * 
 * @param product - Product detail
 * @returns true if product has specifications
 */
export function hasSpecifications(product: ProductDetail): boolean {
  return Boolean(
    product.product_specifications &&
    Array.isArray(product.product_specifications) &&
    product.product_specifications.length > 0
  );
}

/**
 * Get product category breadcrumb path
 * 
 * @param product - Product detail
 * @returns Array of category names for breadcrumb
 */
export function getCategoryBreadcrumb(product: ProductDetail): string[] {
  const breadcrumb: string[] = [];
  
  // Try to use product_categories first (has hierarchy info)
  if (product.product_categories && product.product_categories.length > 0) {
    const primaryCategory = product.product_categories.find(cat => cat.isPrimary);
    const category = primaryCategory || product.product_categories[0];
    
    if (category) {
      breadcrumb.push(category.categoryName);
    }
  } 
  // Fallback to products_sub_categories
  else if (product.products_sub_categories && product.products_sub_categories.length > 0) {
    const primarySubCat = product.products_sub_categories.find(cat => cat.isPrimary);
    const subCat = primarySubCat || product.products_sub_categories[0];
    
    if (subCat) {
      if (subCat.departmentName) breadcrumb.push(subCat.departmentName);
      if (subCat.majorCategoryName && subCat.majorCategoryName !== "Default") {
        breadcrumb.push(subCat.majorCategoryName);
      }
      if (subCat.categoryName) breadcrumb.push(subCat.categoryName);
      if (subCat.subCategoryName && subCat.subCategoryName !== "Default") {
        breadcrumb.push(subCat.subCategoryName);
      }
    }
  }
  
  return breadcrumb.filter(Boolean);
}

