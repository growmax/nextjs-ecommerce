"use client";

import { CartProvider } from "@/contexts/CartContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function CartProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useCurrentUser();

  return <CartProvider userId={user?.userId ?? null}>{children}</CartProvider>;
}
