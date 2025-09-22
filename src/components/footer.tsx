"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations();

  return (
    <footer className={cn("border-t bg-background overflow-x-hidden")}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          {/* Copyright section */}
          <div className="text-sm text-muted-foreground text-center">
            © {currentYear} Your Company. All rights reserved.
          </div>

          {/* Links section - Responsive grid */}
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/about">{t("navigation.about")}</Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/privacy">{t("navigation.privacy")}</Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/terms">{t("navigation.terms")}</Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/contact">{t("navigation.contact")}</Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/check_out">{t("ecommerce.checkout")}</Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/card_page">{t("ecommerce.cart")}</Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/orders">{t("ecommerce.orders")}</Link>
            </Button>
          </div>

          {/* Made with love section */}
          <div className="text-sm text-muted-foreground text-center">
            Made with ❤️
          </div>
        </div>
      </div>
    </footer>
  );
}
