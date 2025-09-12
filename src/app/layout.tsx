import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-commerce Store",
  description: "Multi-tenant e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
