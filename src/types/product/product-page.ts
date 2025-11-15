/**
 * Product Page Types
 *
 * TypeScript interfaces for product page components
 */

export interface ProductPageProps {
  // In some app-router contexts Next may supply `params` as a Promise.
  // Use the Promise wrapper to remain compatible with different page typing
  // conventions used across the codebase.
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}
