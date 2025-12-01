"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DashboardChartSkeleton() {
  const chartBarHeightClasses = [
    "h-dashboard-chart-lg",
    "h-dashboard-chart-md",
    "h-dashboard-chart-xl",
    "h-dashboard-chart-lg",
    "h-dashboard-chart-xl",
    "h-dashboard-chart-sm",
    "h-dashboard-chart-lg",
    "h-dashboard-chart-xl",
    "h-dashboard-chart-md",
    "h-dashboard-chart-xl",
    "h-dashboard-chart-lg",
    "h-dashboard-chart-xl",
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4 text-sm">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="rounded-xl border border-dashed border-border bg-muted/50 p-4">
          <div className="flex h-dashboard-chart-area items-end gap-3">
            {chartBarHeightClasses.map((heightClass, index) => (
              <Skeleton
                key={`chart-bar-${index}`}
                className={`w-4 flex-1 ${heightClass}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export function DashboardOrdersTableSkeleton() {
  return (
    <Card className="w-full bg-background rounded-lg shadow-sm border border-border !py-0 !gap-0">
      <CardHeader className="px-4 pt-4 !pb-0 border-b border-border">
        <div className="flex justify-start">
          <CardTitle className="text-sm font-medium text-foreground">
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted border-b border-border">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <TableHead
                      key={`table-head-${index}`}
                      className={`px-3 py-2 text-left text-xs font-medium text-foreground ${
                        index === 3 ? "text-right" : ""
                      }`}
                    >
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-background divide-y divide-border">
                {Array.from({ length: 8 }).map((_, rowIndex) => (
                  <TableRow key={`table-row-${rowIndex}`} className="hover:bg-transparent">
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end px-2 py-2 !pt-2 border-t border-border">
        <Skeleton className="h-8 w-20 rounded" />
      </CardFooter>
    </Card>
  );
}
