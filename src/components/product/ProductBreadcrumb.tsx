import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { ProductDetail } from "@/types/product/product-detail";
import { getTranslations } from "next-intl/server";

type ProductBreadcrumbProps = {
  product: ProductDetail;
  locale: string;
};

export default async function ProductBreadcrumb({
  product,
  locale,
}: ProductBreadcrumbProps) {
  const t = await getTranslations({ locale, namespace: "navigation" });

  // Find primary category if available
  const primaryCategory = product.product_categories?.find(
    cat => cat.isPrimary
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t("home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/products">Products</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {primaryCategory && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/products?category=${primaryCategory.categorySlug || primaryCategory.categoryName}`}
                >
                  {primaryCategory.categoryName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{product.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
