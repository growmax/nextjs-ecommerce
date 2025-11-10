"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ShoppingCart, 
  Eye, 
  ArrowRight,
  Package,
  TrendingUp,
  DollarSign
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ProductSearchResult {
  id: string;
  name: string;
  category: string;
  price?: string | null;
  image?: string | null;
  type: "order" | "quote" | "product";
  productData?: {
    productId: number;
    brandsName?: string | null;
    unitListPrice?: number | null;
    productAssetss?: any;
  };
}

interface ProductSearchResultsProps {
  products: ProductSearchResult[];
  isLoading?: boolean;
  onSelectProduct: (product: ProductSearchResult) => void;
  searchQuery: string;
  className?: string;
}

export default function ProductSearchResults({
  products,
  isLoading = false,
  onSelectProduct,
  searchQuery,
  className = ""
}: ProductSearchResultsProps) {
  const router = useRouter();

  // Get display image for product
  const getProductImage = (product: ProductSearchResult) => {
    if (product.image) {
      return product.image;
    }
    
    // Fallback: use first letter of product name
    return null;
  };

  // Format price for display
  const formatPrice = (price: string | null | undefined) => {
    if (!price) return null;
    return price;
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          Products
          <Badge variant="secondary" className="ml-1">Loading...</Badge>
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          Products
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="font-medium text-sm">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">
              No products match "{searchQuery}"
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Try different keywords or browse categories
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          Products
          <Badge variant="secondary" className="ml-1">
            {products.length} result{products.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-6 px-2"
          onClick={() => router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
        >
          View all
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-2">
        {products.map((product, index) => {
          const productImage = getProductImage(product);
          const formattedPrice = formatPrice(product.price);
          const brandName = product.category;

          return (
            <Card
              key={`${product.id}-${index}`}
              className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-0 bg-gradient-to-r from-background to-muted/20"
              onClick={() => onSelectProduct(product)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Product Image/Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-100 dark:border-purple-800 flex items-center justify-center">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 text-sm font-bold">
                            {product.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-medium text-sm text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className="h-5 text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                          >
                            {brandName}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Product ID: {product.id}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      {formattedPrice && (
                        <div className="flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {formattedPrice}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart functionality
                        }}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Action Arrow */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/20 transition-colors">
                      <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View All Products Link */}
      {products.length >= 3 && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            onClick={() => router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            See all {products.length}+ products
          </Button>
        </div>
      )}
    </div>
  );
}
