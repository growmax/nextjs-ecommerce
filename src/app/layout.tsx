import type { Metadata } from "next";
import { ABeeZee, Alegreya_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Load TweakCN Custom Fonts - Updated with ABeeZee
const abeeZee = ABeeZee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-abeezee",
  display: "swap",
});

const alegreyaSC = Alegreya_SC({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-alegreya-sc",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
    <html
      className={`${abeeZee.variable} ${alegreyaSC.variable} ${jetBrainsMono.variable}`}
    >
      <body
        className={`${abeeZee.className} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
