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
            {t("footer.copyright", { year: currentYear })}
          </div>

          {/* Links section - Responsive grid */}
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/about" prefetch={true}>
                {t("navigation.about")}
              </Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/privacy" prefetch={true}>
                {t("navigation.privacy")}
              </Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/terms" prefetch={true}>
                {t("navigation.terms")}
              </Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/contact" prefetch={true}>
                {t("navigation.contact")}
              </Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/check_out" prefetch={true}>
                {t("ecommerce.checkout")}
              </Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/card_page" prefetch={true}>
                {t("ecommerce.cart")}
              </Link>
            </Button>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              asChild
              className="h-auto py-1 px-2"
            >
              <Link href="/orders" prefetch={true}>
                {t("ecommerce.orders")}
              </Link>
            </Button>
          </div>

          {/* Made with love section */}
          <div className="text-sm text-muted-foreground text-center">
            {t("footer.madeWith")} {t("footer.love")}
          </div>
        </div>
      </div>
    </footer>
  );
}
