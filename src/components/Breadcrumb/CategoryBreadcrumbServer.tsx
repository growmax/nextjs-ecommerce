import Link from "next/link";
import { Home } from "lucide-react";
import { BreadcrumbItem } from "@/lib/services/CategoryResolutionService";

interface CategoryBreadcrumbServerProps {
  breadcrumbs: BreadcrumbItem[];
}

/**
 * CategoryBreadcrumbServer Component
 * Server-side rendered breadcrumb navigation for SEO
 */
export function CategoryBreadcrumbServer({ breadcrumbs }: CategoryBreadcrumbServerProps) {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
              {isLast ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

