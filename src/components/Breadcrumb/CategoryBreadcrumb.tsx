"use client";

import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { BreadcrumbItem } from "@/lib/services/CategoryResolutionService";
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemComponent,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CategoryBreadcrumbProps {
  breadcrumbs: BreadcrumbItem[];
}

/**
 * CategoryBreadcrumb Component
 * Displays breadcrumb navigation with Schema.org structured data
 */
export function CategoryBreadcrumb({ breadcrumbs }: CategoryBreadcrumbProps) {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={crumb.href}>
              {index > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbItemComponent>
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                </BreadcrumbItemComponent>
              ) : (
                <BreadcrumbItemComponent>
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>
                      {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItemComponent>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

