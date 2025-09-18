import { GlobalLoaderWrapper } from "@/components/ui/global-loader-wrapper";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ServerThemeAPI } from "@/lib/theme-server";
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
