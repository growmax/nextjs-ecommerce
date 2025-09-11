"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useSafeTranslation } from "@/hooks/use-safe-translation";
import { useLocale } from "@/hooks/use-locale";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useSafeTranslation();
  const locale = useLocale();

  return (
    <footer className={cn("border-t bg-background")}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left section */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} Your Company. All rights reserved.
          </div>

          {/* Middle section - Links using Button component */}
          <div className="flex items-center gap-2">
            <Button variant="link" size="sm" asChild>
              <Link href={`/${locale}/about`}>
                {t("navigation.about", "About")}
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href={`/${locale}/privacy`}>
                {t("navigation.privacy", "Privacy")}
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href={`/${locale}/terms`}>
                {t("navigation.terms", "Terms")}
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href={`/${locale}/contact`}>
                {t("navigation.contact", "Contact")}
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href={`/${locale}/check_out`}>
                {t("ecommerce.checkout", "Checkout")}
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href={`/${locale}/cart_page`}>
                {t("ecommerce.cart", "Cart")}
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href={`/${locale}/orders`}>
                {t("ecommerce.orders", "Orders")}
              </Link>
            </Button>
          </div>

          {/* Right section */}
          <div className="text-sm text-muted-foreground">Made with ❤️</div>
        </div>
      </div>
    </footer>
  );
}
