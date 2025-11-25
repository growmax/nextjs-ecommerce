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

// Import the AppHeader component
import LayoutWithHeader from "@/components/LayoutWithHeader";
import { LayoutDataLoader } from "@/components/layout/LayoutDataLoader";

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

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch messages (required for NextIntlClientProvider)
  // This is fast and doesn't need streaming
  const messages = await getMessages();

  // Read sidebar state from cookie to ensure server-rendered HTML matches client preference
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const initialSidebarOpen = parseSidebarStateCookie(cookieHeader);

  return (
    <NextIntlClientProvider messages={messages}>
      {/* 
        Wrap layout data fetching in Suspense for streaming.
        This allows the page structure to render immediately while data loads.
        On subsequent navigations, Redis cache will make this very fast (5-10ms).
      */}
      <LayoutDataLoader>
        <LoadingProvider>
          <TopProgressBarProvider />
          <NavigationProgressProvider>
            <CartProviderWrapper>
              <SidebarProviderWrapper defaultOpen={initialSidebarOpen}>
                <AppSidebar />
                <SidebarInset className="flex flex-col w-full overflow-x-hidden">
                  {/* LayoutWithHeader manages search open state and blurs main content when search is open */}
                  <LayoutWithHeader>{children}</LayoutWithHeader>
                </SidebarInset>
              </SidebarProviderWrapper>
            </CartProviderWrapper>
            {/* Toaster for logout notifications - positioned top-right like login */}
            <Toaster richColors position="top-right" theme="light" />
          </NavigationProgressProvider>
        </LoadingProvider>
      </LayoutDataLoader>
    </NextIntlClientProvider>
  );
}
