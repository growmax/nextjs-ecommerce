import type { Metadata } from "next";
import { headers } from "next/headers";
import { ServerAuth } from "@/lib/auth-server";
import { getHomepageConfig } from "@/lib/utils/homepageConfig";
import HomepageClient from "@/components/homepage/HomepageClient";
import BuyerFooter from "@/components/homepage/BuyerFooter";

export const metadata: Metadata = {
  title: "Home | E-Commerce",
  description: "Browse and add products to your cart",
};

// Enable ISR for homepage - revalidate every hour
// This allows the page to be statically generated and served from cache
// while still being updated periodically
export const revalidate = 3600; // 1 hour

// Force dynamic rendering to see Redis cache in action during development
// Remove this line in production to re-enable ISR for better performance
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Get domain from headers
  const headersList = await headers();
  const domain =
    headersList.get("x-tenant-domain") ||
    headersList.get("host") ||
    process.env.DEFAULT_DOMAIN ||
    "localhost:3000";

  // Get access token if available
  const accessToken = await ServerAuth.getAccessToken();

  // Fetch homepage config server-side
  const initialConfig = await getHomepageConfig(domain, accessToken);

  return (
    <>
      <HomepageClient initialConfig={initialConfig} domain={domain} />
      <BuyerFooter initialConfig={initialConfig} domain={domain} />
    </>
  );
}
