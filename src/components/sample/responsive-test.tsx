"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ResponsiveTestComponent() {
  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg lg:text-xl">
          📱 Mobile-First Responsive Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Breakpoint Indicators */}
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="rounded bg-red-100 p-2 text-red-800 sm:hidden">
            📱 Mobile (&lt; 640px) - Currently Active
          </div>
          <div className="hidden rounded bg-blue-100 p-2 text-blue-800 sm:block md:hidden">
            📱 Small (640px - 768px) - Currently Active
          </div>
          <div className="hidden rounded bg-green-100 p-2 text-green-800 md:block lg:hidden">
            💻 Medium (768px - 1024px) - Currently Active
          </div>
          <div className="hidden rounded bg-purple-100 p-2 text-purple-800 lg:block">
            🖥️ Large (1024px+) - Currently Active
          </div>
        </div>

        {/* Responsive Grid Test */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-3">
            <h4 className="font-medium text-sm sm:text-base">Card 1</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Mobile: Full width
              <br />
              Tablet: 2 columns
              <br />
              Desktop: 3 columns
            </p>
          </Card>
          <Card className="p-3">
            <h4 className="font-medium text-sm sm:text-base">Card 2</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Responsive spacing and typography
            </p>
          </Card>
          <Card className="p-3">
            <h4 className="font-medium text-sm sm:text-base">Card 3</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Touch targets: 44px minimum
            </p>
          </Card>
        </div>

        {/* Button Size Test */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button className="w-full min-h-[44px] sm:w-auto">
            Mobile-First Button
          </Button>
          <Button variant="outline" className="w-full min-h-[44px] sm:w-auto">
            Touch-Friendly Size
          </Button>
        </div>

        {/* Typography Scale Test */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
            H1: Mobile-First Typography
          </h1>
          <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl">
            H2: Responsive Scaling
          </h2>
          <h3 className="text-base font-medium sm:text-lg">H3: Fluid Design</h3>
          <p className="text-sm sm:text-base">
            Body text scales from 14px mobile to 16px desktop
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
