"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export function ThemeTestComponent() {
  const [customTheme, setCustomTheme] = useState(false);

  const applyCustomTheme = () => {
    const root = document.documentElement;
    if (!customTheme) {
      // Apply custom tenant theme
      root.style.setProperty("--primary", "200 100% 50%"); // Bright cyan
      root.style.setProperty("--secondary", "280 100% 70%"); // Purple
      root.style.setProperty("--accent", "120 100% 50%"); // Green
      root.classList.add("tenant-theme-override");
      setCustomTheme(true);
    } else {
      // Reset to default
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--accent");
      root.classList.remove("tenant-theme-override");
      setCustomTheme(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md sm:max-w-lg">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          🎨 TweakCN Theme Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button variant="default" className="w-full">
            Primary Button
          </Button>
          <Button variant="secondary" className="w-full">
            Secondary Button
          </Button>
          <Button variant="outline" className="w-full sm:col-span-2">
            Outline Button
          </Button>
        </div>

        <Button
          onClick={applyCustomTheme}
          variant={customTheme ? "destructive" : "default"}
          className="w-full"
        >
          {customTheme ? "Reset Theme" : "Apply Custom Tenant Theme"}
        </Button>

        <div className="rounded-lg bg-secondary p-3">
          <p className="text-sm">
            <strong>Test Status:</strong>{" "}
            {customTheme ? "Custom Theme Active" : "Default Theme"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            CSS Variables:{" "}
            {customTheme ? "hsl(200 100% 50%)" : "hsl(24 95% 53%)"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
