"use client";

import QuoteDetailsClient from "./components/QuoteDetailsClient";

export default function QuoteDetailsPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  return <QuoteDetailsClient params={params} />;
}
