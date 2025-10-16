"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6">
        {/* 404 Text */}
        <h1 className="text-9xl font-bold text-primary">404</h1>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-foreground">
            {t("errors.pageNotFound") || "Page Not Found"}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("errors.pageNotFoundDescription") ||
              "The page you are looking for doesn't exist or has been moved."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              {t("navigation.home") || "Go Home"}
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("buttons.goBack") || "Go Back"}
          </Button>
        </div>
      </div>
    </div>
  );
}
