import createNextIntlPlugin from "next-intl/plugin";
import { dirname } from "path";
import { fileURLToPath } from "url";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Bundle analyzer (run with ANALYZE=true npm run build)
import withBundleAnalyzer from "@next/bundle-analyzer";
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React.StrictMode in development to prevent duplicate RSC calls
  // Keep enabled in production via environment variable if needed
  reactStrictMode: process.env.NODE_ENV === "production",
  // Allow cross-origin requests in development (prevents warnings)
  // Format: full URLs with protocol or host:port
  allowedDevOrigins: process.env.NODE_ENV === "development" 
    ? [
        "http://192.168.1.8:3000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "192.168.1.8:3000",
        "localhost:3000",
        "127.0.0.1:3000"
      ]
    : undefined,
  typescript: {
    // Allow production builds to succeed even when there are TypeScript errors
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@/components/ui",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "@tanstack/react-table",
      "@tanstack/react-query",
      "date-fns",
      "react-hook-form",
      "@hookform/resolvers",
    ],
  },
  poweredByHeader: false,
  compress: true,
  // Windows-specific optimizations for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      config.infrastructureLogging = {
        level: "error",
      };
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        crypto: false,
      };

      config.externals = config.externals || [];
      config.externals.push({
        ioredis: "ioredis",
      });
    }

    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "**.myapptino.com",
      },
      {
        protocol: "https",
        hostname: "schwing-dev-app-assets.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "growmax-dev-app-assets.s3.ap-northeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.ap-northeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.acmetools.com",
      },
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.s3.*.amazonaws.com",
      },
    ],
    unoptimized: false,
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        // CORS headers for API calls
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        },
        {
          key: "Access-Control-Allow-Headers",
          value:
            "Content-Type, Authorization, X-Requested-With, Accept, Origin, x-tenant, x-csrf-token",
        },
        {
          key: "Access-Control-Allow-Credentials",
          value: "true",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        },
        {
          key: "Access-Control-Allow-Headers",
          value:
            "Content-Type, Authorization, X-Requested-With, Accept, Origin, x-tenant, x-csrf-token",
        },
        {
          key: "Access-Control-Allow-Credentials",
          value: "true",
        },
      ],
    },
    {
      source: "/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default withNextIntl(bundleAnalyzer(nextConfig));
