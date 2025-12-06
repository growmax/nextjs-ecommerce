"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigationWithLoader } from "@/hooks/useNavigationWithLoader";
import { FileText, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const router = useNavigationWithLoader();
  const { user } = useCurrentUser();
  const t = useTranslations("cart");

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
            {t("createLead")}
          </Button>
        )}
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push("/login")}
          disabled={disabled || isLoading}
        >
          {t("loginToContinue")}
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
        <FileText className="mr-2 h-5 w-5" />
        {t("requestQuote")}
      </Button>
      <Button
        className="w-full"
        size="lg"
        onClick={handlePlaceOrder}
        disabled={disabled || isLoading}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {t("createOrder")}
      </Button>
    </div>
  );
}
