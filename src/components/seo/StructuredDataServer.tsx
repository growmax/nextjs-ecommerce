interface StructuredDataServerProps {
  data: Record<string, unknown>;
}

/**
 * StructuredDataServer Component
 * Server-side rendered JSON-LD structured data for SEO
 * Renders directly in HTML for search engines
 */
export function StructuredDataServer({ data }: StructuredDataServerProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

