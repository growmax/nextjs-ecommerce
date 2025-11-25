import { AppSidebar } from "@/components/AppSideBar/app-sidebar";
import { CartProviderWrapper } from "@/components/providers/CartProviderWrapper";
import { NavigationProgressProvider } from "@/components/providers/NavigationProgressProvider";
import { TopProgressBarProvider } from "@/components/providers/TopProgressBarProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { LoadingProvider } from "@/hooks/useGlobalLoader";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

// Import the AppHeader component
import { AppHeader } from "@/components/AppHeader/app-header";
import { LayoutDataLoader } from "@/components/layout/LayoutDataLoader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch messages (required for NextIntlClientProvider)
  // This is fast and doesn't need streaming
  const messages = await getMessages();

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
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="flex flex-col w-full overflow-x-hidden">
                  <AppHeader />
                  <main className="w-full overflow-x-hidden">{children}</main>
                </SidebarInset>
              </SidebarProvider>
            </CartProviderWrapper>
            {/* Toaster for logout notifications - positioned top-right like login */}
            <Toaster richColors position="top-right" theme="light" />
          </NavigationProgressProvider>
        </LoadingProvider>
      </LayoutDataLoader>
    </NextIntlClientProvider>
  );
}
