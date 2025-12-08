import { Link } from "@/i18n/navigation";
import { BreadcrumbItem } from "@/lib/services/CategoryResolutionService";

interface CategoryBreadcrumbServerProps {
  breadcrumbs: BreadcrumbItem[];
}

/**
 * CategoryBreadcrumbServer Component
 * Server-side rendered breadcrumb navigation for SEO
 */
export function CategoryBreadcrumbServer({
  breadcrumbs,
}: CategoryBreadcrumbServerProps) {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1.5 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && (
                <span className="mx-1.5 text-muted-foreground/60">/</span>
              )}
              {isLast ? (
                <span
                  className="text-foreground font-semibold"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  prefetch={true}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-2"
                >
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
