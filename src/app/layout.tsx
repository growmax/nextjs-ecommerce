import { GlobalLoaderWrapper } from "@/components/custom/global-loader-wrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ServerAuth } from "@/lib/auth-server";
import { ServerThemeAPI } from "@/lib/theme-server";
import { QueryProvider } from "@/providers/QueryProvider";
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-commerce Store",
  description: "Multi-tenant e-commerce platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch theme CSS on the server
  const themeResult = await ServerThemeAPI.fetchThemeCSS();
  const themeCSS = themeResult.success
    ? themeResult.css
    : ServerThemeAPI.getFallbackCSS();

  // Get authentication state on the server
  const authState = await ServerAuth.getAuthState();

  return (
    <html>
      <head>
        {/* Inject theme CSS directly into HTML head for perfect SSR */}
        <style
          id="ssr-theme-styles"
          dangerouslySetInnerHTML={{
            __html: themeCSS,
          }}
        />
        {/* Pass auth state to client via meta tags */}
        <meta name="auth-state" content={JSON.stringify(authState)} />
        {/* Disable double effects in development */}
        <meta name="next-strict-mode" content="false" />
      </head>
      <body suppressHydrationWarning={true}>
        <div suppressHydrationWarning={true}>
          <ErrorBoundary>
            <QueryProvider>
              <LoadingProvider>
                <Suspense
                  fallback={
                    <div className="flex min-h-screen items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                        <p className="mt-4 text-sm text-muted-foreground">
                          Loading...
                        </p>
                      </div>
                    </div>
                  }
                >
                  {children}
                </Suspense>
                <GlobalLoaderWrapper />
              </LoadingProvider>
            </QueryProvider>
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}
