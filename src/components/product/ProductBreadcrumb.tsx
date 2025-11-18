import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { ProductCategory, ProductDetail } from "@/types/product/product-detail";
import React from "react";

type ProductBreadcrumbProps = {
  product: ProductDetail;
};

interface BreadcrumbNode {
  label: string;
  href?: string;
}

function generateBreadcrumbNodes(
  productCategories: ProductCategory[]
): BreadcrumbNode[] {
  const nodes: BreadcrumbNode[] = [];

  nodes.push({ label: "Home", href: "/" });
  nodes.push({ label: "Products", href: "/products" });

  // First try to find a primary category
  let categoryToUse = productCategories.find(cat => cat.isPrimary);

  // If no primary category found, use the first category that has fullPathNames
  if (!categoryToUse) {
    categoryToUse = productCategories.find(cat => cat.fullPathNames);
  }

  // If still no category found, use the first category
  if (!categoryToUse && productCategories.length > 0) {
    categoryToUse = productCategories[0];
  }

  if (categoryToUse?.fullPathNames) {
    // Split on '<' to get the hierarchy
    const pathSegments = categoryToUse.fullPathNames.split("<");

    pathSegments.forEach(segment => {
      const trimmedSegment = segment.trim();
      if (
        trimmedSegment &&
        !["default", "home", "products"].includes(trimmedSegment.toLowerCase())
      ) {
        // Try to find the matching category to get the slug
        const category = productCategories.find(
          cat =>
            cat.categoryName === trimmedSegment ||
            cat.categorySlug === trimmedSegment
        );
        const categorySlug =
          category?.categorySlug ||
          trimmedSegment.toLowerCase().replace(/\s+/g, "-");
        nodes.push({
          label: trimmedSegment,
          href: `/products?category=${categorySlug}`,
        });
      }
    });
  } else if (categoryToUse) {
    const categorySlug =
      categoryToUse.categorySlug ||
      categoryToUse.categoryName.toLowerCase().replace(/\s+/g, "-");
    if (
      categoryToUse.categoryName &&
      !["default"].includes(categoryToUse.categoryName.toLowerCase())
    ) {
      nodes.push({
        label: categoryToUse.categoryName,
        href: `/products?category=${categorySlug}`,
      });
    }
  }

  return nodes;
}

export default async function ProductBreadcrumb({
  product,
}: ProductBreadcrumbProps): Promise<React.JSX.Element> {
  const breadcrumbNodes = generateBreadcrumbNodes(product.product_categories);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbNodes.map((node, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {node.href ? (
                <BreadcrumbLink asChild>
                  <Link href={node.href}>{node.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{node.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbNodes.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {product.product_short_description || "Product"}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
