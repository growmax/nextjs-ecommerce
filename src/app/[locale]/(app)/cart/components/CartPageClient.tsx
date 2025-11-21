"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CartPageClient() {
  const { user } = useCurrentUser();
  const { cart, cartCount, refreshCart, isLoading: isCartLoading } = useCart();

  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  // If user is not logged in, show a message
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Please log in to view your cart
            </h2>
            <p className="text-gray-600">
              You need to be signed in to see your shopping cart items.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If cart is loading, show loading state
  if (isCartLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty, show empty state
  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">
              Start adding some products to your cart.
            </p>
            <Button onClick={() => (window.location.href = "/products")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Update quantity handler
  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      // Here you would implement the actual cart update logic
      // await CartService.updateQuantity(productId, newQuantity);
      toast.success("Cart updated successfully");
      await refreshCart();
    } catch {
      toast.error("Failed to update cart");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Remove item handler
  const removeItem = async (productId: number) => {
    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      // Here you would implement the actual cart removal logic
      // await CartService.removeFromCart(productId);
      toast.success("Item removed from cart");
      await refreshCart();
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, index) => (
            <Card key={`${item.productId}-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {item.productName || `Product ${item.productId}`}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {item.shortDescription || "No description available"}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">
                        ${item.unitPrice?.toFixed(2) || "0.00"}
                      </span>
                      <span className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        disabled={updatingItems.has(item.productId)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        disabled={updatingItems.has(item.productId)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item.productId)}
                      disabled={updatingItems.has(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} items)</span>
                <span>$0.00</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>$0.00</span>
              </div>

              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/products")}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
