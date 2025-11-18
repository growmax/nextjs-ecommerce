/**
 * Product Page Types
 *
 * TypeScript interfaces for product page components
 */

export interface ProductPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}
