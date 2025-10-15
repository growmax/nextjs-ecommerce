"use client";
import dynamic from "next/dynamic";

const CartPage = dynamic(() => import("./components/CartPageClient"), {
  ssr: false,
});

export default function Page() {
  return <CartPage />;
}
