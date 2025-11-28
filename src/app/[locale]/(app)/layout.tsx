import { AppSidebar } from "@/components/AppSideBar/app-sidebar";
import { CartProviderWrapper } from "@/components/providers/CartProviderWrapper";
import { NavigationProgressProvider } from "@/components/providers/NavigationProgressProvider";
import { SidebarProviderWrapper } from "@/components/providers/SidebarProviderWrapper";
import { TopProgressBarProvider } from "@/components/providers/TopProgressBarProvider";
import { SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { LoadingProvider } from "@/hooks/useGlobalLoader";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { cache, ReactNode, Suspense } from "react";

// Import the AppHeader component
import LayoutWithHeader from "@/components/LayoutWithHeader";
import { LayoutDataLoader } from "@/components/layout/LayoutDataLoader";
import { PrefetchMainRoutes } from "@/components/layout/PrefetchMainRoutes";

/**
 * Parse sidebar state from cookie string
 * Handles both old boolean format and new string format
 */
function parseSidebarStateCookie(cookieString: string): boolean {
  const match = cookieString.match(/sidebar_state=([^;]+)/);
  if (!match) return true; // default to expanded

  const value = match[1];
  // Handle new string format
  if (value === "expanded") return true;
  if (value === "collapsed") return false;
  // Handle old boolean format (backward compatibility)
  if (value === "true") return true;
  if (value === "false") return false;

  return true; // default to expanded
}

// Cache getMessages() and headers() calls per request using React cache()
// This ensures they're only called once per request, even if used multiple times
const getCachedMessages = cache(async () => {
  return await getMessages();
});

/**
 * Layout Fallback - Renders immediately with messages loading in Suspense
 * This allows children (pages) to render while async operations complete
 * Messages load in background via Suspense to avoid translation errors
 */
function LayoutFallback({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        // Minimal fallback - just show children with basic structure
        // This renders instantly while messages load
        <div className="min-h-screen bg-background">
          <div className="flex">
            <div className="w-64 bg-muted/50" /> {/* Sidebar placeholder */}
            <div className="flex-1">{children}</div>
          </div>
        </div>
      }
    >
      <LayoutFallbackWithMessages>{children}</LayoutFallbackWithMessages>
    </Suspense>
  );
}

/**
 * Layout Fallback With Messages - Loads messages for fallback
 * Wrapped in Suspense so it doesn't block initial render
 */
async function LayoutFallbackWithMessages({
  children,
}: {
  children: ReactNode;
}) {
  const messages = await getCachedMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <LayoutDataLoader>
        <LoadingProvider>
          <TopProgressBarProvider />
          <NavigationProgressProvider>
            <PrefetchMainRoutes />
            <CartProviderWrapper>
              <SidebarProviderWrapper defaultOpen={true}>
                <AppSidebar />
                <SidebarInset className="flex flex-col w-full overflow-x-hidden">
                  <LayoutWithHeader>{children}</LayoutWithHeader>
                </SidebarInset>
              </SidebarProviderWrapper>
            </CartProviderWrapper>
            <Toaster richColors position="top-right" theme="light" />
          </NavigationProgressProvider>
        </LoadingProvider>
      </LayoutDataLoader>
    </NextIntlClientProvider>
  );
}

/**
 * Layout Messages Provider - Loads messages in Suspense boundary
 * This allows immediate rendering while messages load asynchronously
 */
async function LayoutMessagesProvider({ children }: { children: ReactNode }) {
  const messages = await getCachedMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Layout Structure - Loads headers and renders layout
 * Separated to allow streaming
 */
async function LayoutStructure({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const initialSidebarOpen = parseSidebarStateCookie(cookieHeader);

  return (
    <LayoutDataLoader>
      <LoadingProvider>
        <TopProgressBarProvider />
        <NavigationProgressProvider>
          <PrefetchMainRoutes />
          <CartProviderWrapper>
            <SidebarProviderWrapper defaultOpen={initialSidebarOpen}>
              <AppSidebar />
              <SidebarInset className="flex flex-col w-full overflow-x-hidden">
                <LayoutWithHeader>{children}</LayoutWithHeader>
              </SidebarInset>
            </SidebarProviderWrapper>
          </CartProviderWrapper>
          <Toaster richColors position="top-right" theme="light" />
        </NavigationProgressProvider>
      </LoadingProvider>
    </LayoutDataLoader>
  );
}

/**
 * App Layout - Optimized for instant navigation
 * Uses Suspense boundaries to stream async operations
 *
 * Key optimization: Layout function completes immediately by using Suspense
 * This allows Next.js to render children (loading.tsx) while async ops complete
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Render immediately with Suspense boundaries
  // This allows children (pages with loading.tsx) to render while async ops complete
  return (
    <Suspense
      fallback={
        // Immediate fallback - renders while messages load
        <LayoutFallback>{children}</LayoutFallback>
      }
    >
      <LayoutMessagesProvider>
        <Suspense
          fallback={
            // Fallback while headers load
            <LayoutFallback>{children}</LayoutFallback>
          }
        >
          <LayoutStructure>{children}</LayoutStructure>
        </Suspense>
      </LayoutMessagesProvider>
    </Suspense>
  );
}

// Performance optimizations for first request
// force-dynamic is required for tenant-based routing, but we optimize with Suspense
export const dynamic = "force-dynamic";
export const revalidate = 0;
