import { GlobalLoaderWrapper } from "@/components/custom/global-loader-wrapper";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ServerThemeAPI } from "@/lib/theme-server";
import { ServerAuth } from "@/lib/auth-server";
import type { Metadata } from "next";
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
      </head>
      <body suppressHydrationWarning={true}>
        <LoadingProvider>
          {children}
          <GlobalLoaderWrapper />
        </LoadingProvider>
      </body>
    </html>
  );
}
