"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ShoppingCart } from "lucide-react";

interface CartProceedButtonProps {
  onRequestQuote?: () => void;
  onPlaceOrder?: () => void;
  onEnquiry?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  selectedSellerId?: string | number | null;
}

export default function CartProceedButton({
  onRequestQuote,
  onPlaceOrder,
  onEnquiry,
  disabled = false,
  isLoading = false,
  selectedSellerId,
}: CartProceedButtonProps) {
  const router = useRouter();
  const { user } = useCurrentUser();

  const handleRequestQuote = () => {
    if (onRequestQuote) {
      onRequestQuote();
    } else {
      const query = selectedSellerId ? `?sellerId=${selectedSellerId}` : "";
      router.push(`/quotesummary${query}`);
    }
  };

  const handlePlaceOrder = () => {
    if (onPlaceOrder) {
      onPlaceOrder();
    } else {
      const query = selectedSellerId ? `?sellerId=${selectedSellerId}` : "";
      router.push(`/ordersummary${query}`);
    }
  };

  const handleEnquiry = () => {
    if (onEnquiry) {
      onEnquiry();
    }
  };

  if (!user) {
    return (
      <div className="space-y-2">
        {onEnquiry && (
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleEnquiry}
            disabled={disabled || isLoading}
          >
            Create Lead
          </Button>
        )}
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push("/auth/login")}
          disabled={disabled || isLoading}
        >
          Login to Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full"
        size="lg"
        onClick={handleRequestQuote}
        disabled={disabled || isLoading}
      >
        Request Quote
      </Button>
      <Button
        className="w-full"
        size="lg"
        onClick={handlePlaceOrder}
        disabled={disabled || isLoading}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Place Order
      </Button>
    </div>
  );
}
