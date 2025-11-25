import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export default function RelatedProducts() {
  // Placeholder data for related products
  const products = [
    {
      id: "1",
      name: "Milwaukee Safety Helmet",
      imageUrl:
        "https://m.media-amazon.com/images/I/71ad8U0pLpL._AC_SL1500_.jpg",
      price: "₹ 5,000.00",
      link: "/en/products/milwaukee-safety-helmet-prod000001",
    },
    {
      id: "2",
      name: "Milwaukee Work Gloves",
      imageUrl:
        "https://m.media-amazon.com/images/I/81xU21w-Y6L._AC_SL1500_.jpg",
      price: "₹ 1,500.00",
      link: "/en/products/milwaukee-work-gloves-prod000002",
    },
    {
      id: "3",
      name: "Milwaukee Respirator Mask",
      imageUrl:
        "https://m.media-amazon.com/images/I/61+oA9V9P2L._AC_SL1500_.jpg",
      price: "₹ 3,000.00",
      link: "/en/products/milwaukee-respirator-mask-prod000003",
    },
    {
      id: "4",
      name: "Milwaukee Steel Toe Boots",
      imageUrl:
        "https://m.media-amazon.com/images/I/71R2c3+gqFL._AC_SL1500_.jpg",
      price: "₹ 8,000.00",
      link: "/en/products/milwaukee-steel-toe-boots-prod000004",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <Link href={product.link} prefetch={true} key={product.id}>
            <div className="border rounded-lg p-4 flex flex-col items-center text-center">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={150}
                height={150}
                objectFit="contain"
                className="mb-4"
              />
              <p className="font-semibold text-lg">{product.name}</p>
              <p className="text-gray-700">{product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
