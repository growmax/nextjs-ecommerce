"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Mock data array for cart items
const mockCartItems = [
  {
    title: "foodball combo !......",
    brandName: "Generic",
    brandProductId: "adsfasd",
    hsnCode: "22011010",
    minOrderQuantity: 0,
    packagingQty: "1",
    image: "/images/default-placeholder.png",
    description: "",
    price: 6546,
    total: 99999,
    off: 50,
  },
];

function CartItemCard() {
  const item = mockCartItems[0];
  const [quantity, setQuantity] = useState(1);

  if (!item) {
    return null;
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="p-4">
      <Card className="p-4">
        <div className="flex gap-6">
          {/* Image Display Box */}
          <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-lg">
            <Image
              src={item?.image || "/images/default-placeholder.png"}
              alt={item?.brandName || "Product"}
              fill
              className="object-cover rounded-lg"
              sizes="80px"
            />
          </div>
          {/* Product Info */}
          <div className="flex-1">
            <Link href={`#`} className="hover:text-primary">
              <h3 className="font-medium">{item.title}</h3>
            </Link>
            <p className="text-sm text-gray-600">Brand: {item.brandName}</p>
            <p className="text-sm text-gray-600">HSN: {item.hsnCode}</p>

            {/* Price Section */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-semibold text-foreground">
                ₹{item.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₹{item.total.toLocaleString()}
              </span>
              <Badge
                variant="secondary"
                className="text-xs text-green-700 bg-green-100"
              >
                {item.off}% OFF
              </Badge>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-none"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="w-12 h-8 flex items-center justify-center border-x text-sm font-medium">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-none"
                  onClick={handleIncrement}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">
                ₹{(item.price * quantity).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Packaging Qty: {item.packagingQty}</span>
          <span>Min Order Qty: {item.minOrderQuantity}</span>
        </div>
      </Card>
    </div>
  );
}

export default CartItemCard;
