# Server-Side Layout Solutions for Next.js App Router

## Overview

This document outlines 6 different approaches to achieve conditional layouts server-side, avoiding client-side rendering while maintaining SEO benefits.

## 1. Route Groups with Separate Layouts (IMPLEMENTED ✅)

**Structure:**

```
src/app/[locale]/
├── (auth)/
│   ├── layout.tsx          # No nav, no footer
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/
│   ├── layout.tsx          # Nav + conditional footer
│   ├── page.tsx
│   ├── settings/
│   │   ├── layout.tsx      # Special settings layout
│   │   └── ...
│   └── ...
└── layout.tsx              # Minimal locale validation
```

**Pros:**

- ✅ Completely server-side
- ✅ Perfect SEO
- ✅ Clean separation of concerns
- ✅ Type-safe
- ✅ Optimal performance

**Cons:**

- ❌ File structure changes required
- ❌ Code duplication between layouts

**Implementation Notes:**

- Uses middleware to pass pathname in headers
- Locale stripping for accurate path detection
- Maintains all existing functionality

## 2. Headers() API with Conditional Components

**Example Implementation:**

```tsx
// src/app/[locale]/layout.tsx
import { headers } from "next/headers";
import ConditionalLayout from "@/components/ConditionalLayout";

export default async function LocaleLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  return <ConditionalLayout pathname={pathname}>{children}</ConditionalLayout>;
}

// src/components/ConditionalLayout.tsx (SERVER COMPONENT)
interface Props {
  children: React.ReactNode;
  pathname: string;
}

export default function ConditionalLayout({ children, pathname }: Props) {
  const pathWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
  const hideNavAndFooter = ["/login", "/register"].includes(pathWithoutLocale);
  const hideFooterOnly = pathWithoutLocale.startsWith("/settings");

  return (
    <>
      {!hideNavAndFooter && <NavBar />}
      <main
        className={cn(
          "min-h-screen",
          !hideNavAndFooter && "pt-4",
          !(hideNavAndFooter || hideFooterOnly) && "pb-8"
        )}
      >
        {children}
      </main>
      {!hideNavAndFooter && !hideFooterOnly && <Footer />}
    </>
  );
}
```

**Pros:**

- ✅ Server-side rendering
- ✅ Minimal file structure changes
- ✅ Centralized layout logic

**Cons:**

- ❌ Requires middleware modification
- ❌ Single layout file gets complex

## 3. Parallel Routes with Conditional Slots

**Structure:**

```
src/app/[locale]/
├── @header/
│   ├── (auth)/page.tsx     # Empty slot
│   ├── (app)/page.tsx      # NavBar slot
│   └── default.tsx
├── @footer/
│   ├── (auth)/page.tsx     # Empty slot
│   ├── (app)/
│   │   ├── settings/page.tsx  # Empty slot
│   │   └── page.tsx           # Footer slot
│   └── default.tsx
├── layout.tsx
└── page.tsx
```

**Example:**

```tsx
// src/app/[locale]/layout.tsx
export default function Layout({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <>
      {header}
      <main className="min-h-screen">{children}</main>
      {footer}
    </>
  );
}
```

**Pros:**

- ✅ Completely server-side
- ✅ Extremely flexible
- ✅ No middleware required

**Cons:**

- ❌ Complex file structure
- ❌ Learning curve for parallel routes
- ❌ Potential over-engineering

## 4. Server Actions with Dynamic Layout Selection

**Example:**

```tsx
// src/lib/layout-resolver.ts
export function getLayoutConfig(pathname: string) {
  const pathWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";

  if (["/login", "/register"].includes(pathWithoutLocale)) {
    return { showNav: false, showFooter: false };
  }

  if (pathWithoutLocale.startsWith("/settings")) {
    return { showNav: true, showFooter: false };
  }

  return { showNav: true, showFooter: true };
}

// src/app/[locale]/layout.tsx
import { headers } from "next/headers";
import { getLayoutConfig } from "@/lib/layout-resolver";

export default async function LocaleLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const layout = getLayoutConfig(pathname);

  return (
    <>
      {layout.showNav && <NavBar />}
      <main
        className={cn(
          "min-h-screen",
          layout.showNav && "pt-4",
          layout.showFooter && "pb-8"
        )}
      >
        {children}
      </main>
      {layout.showFooter && <Footer />}
    </>
  );
}
```

**Pros:**

- ✅ Server-side
- ✅ Centralized logic
- ✅ Easy to test

**Cons:**

- ❌ Still requires middleware
- ❌ Single point of configuration

## 5. Middleware-Based Layout Injection

**Example:**

```tsx
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  // Set layout hints
  if (pathname.endsWith("/login") || pathname.endsWith("/register")) {
    response.headers.set("x-layout-type", "auth");
  } else if (pathname.includes("/settings")) {
    response.headers.set("x-layout-type", "settings");
  } else {
    response.headers.set("x-layout-type", "app");
  }

  return response;
}

// src/app/[locale]/layout.tsx
import { headers } from "next/headers";

export default async function LocaleLayout({ children }) {
  const headersList = await headers();
  const layoutType = headersList.get("x-layout-type") || "app";

  switch (layoutType) {
    case "auth":
      return <main className="min-h-screen">{children}</main>;

    case "settings":
      return (
        <>
          <NavBar />
          <main className="min-h-screen pt-4">{children}</main>
        </>
      );

    default:
      return (
        <>
          <NavBar />
          <main className="min-h-screen pt-4 pb-8">{children}</main>
          <Footer />
        </>
      );
  }
}
```

**Pros:**

- ✅ Clean switch logic
- ✅ Server-side
- ✅ Easy to extend

**Cons:**

- ❌ Middleware complexity
- ❌ Less flexible than route groups

## 6. Template-Based Dynamic Layouts

**Example:**

```tsx
// src/app/[locale]/template.tsx
import { headers } from "next/headers";
import { LayoutTemplate } from "@/components/layouts/LayoutTemplate";

export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  return <LayoutTemplate pathname={pathname}>{children}</LayoutTemplate>;
}

// src/components/layouts/LayoutTemplate.tsx
const LAYOUT_CONFIGS = {
  auth: { nav: false, footer: false },
  settings: { nav: true, footer: false },
  app: { nav: true, footer: true },
} as const;

export function LayoutTemplate({ children, pathname }: Props) {
  const layoutType = getLayoutType(pathname);
  const config = LAYOUT_CONFIGS[layoutType];

  return (
    <>
      {config.nav && <NavBar />}
      <main className={getMainClasses(config)}>{children}</main>
      {config.footer && <Footer />}
    </>
  );
}
```

**Pros:**

- ✅ Templates run on every route
- ✅ Highly configurable
- ✅ Server-side

**Cons:**

- ❌ Templates reset state
- ❌ May cause unwanted re-renders

## Performance Comparison

| Approach        | SSR Score  | Bundle Size | Complexity | Maintainability |
| --------------- | ---------- | ----------- | ---------- | --------------- |
| Route Groups    | 🟢 Perfect | 🟢 Smallest | 🟡 Medium  | 🟢 Excellent    |
| Headers API     | 🟢 Perfect | 🟢 Small    | 🟢 Low     | 🟢 Good         |
| Parallel Routes | 🟢 Perfect | 🟡 Medium   | 🔴 High    | 🟡 Complex      |
| Server Actions  | 🟢 Perfect | 🟢 Small    | 🟢 Low     | 🟢 Good         |
| Middleware      | 🟢 Perfect | 🟢 Small    | 🟡 Medium  | 🟡 Medium       |
| Templates       | 🟢 Perfect | 🟡 Medium   | 🟡 Medium  | 🟡 Medium       |

## Recommendation

**Use Route Groups (Approach #1)** for new projects or when you can refactor.

**Use Headers API (Approach #2)** for existing projects with minimal changes.

Both approaches provide:

- ✅ Perfect SEO (server-side rendering)
- ✅ No layout shift
- ✅ Optimal performance
- ✅ Type safety
- ✅ Easy to test

## Migration Checklist

If implementing Route Groups:

- [ ] Create `(auth)` and `(app)` route groups
- [ ] Move auth pages to `(auth)` group
- [ ] Move app pages to `(app)` group
- [ ] Update middleware to pass pathname
- [ ] Create route-specific layouts
- [ ] Update imports and references
- [ ] Test all routing scenarios
- [ ] Update any hardcoded path references

## Testing Strategy

```typescript
// __tests__/layouts.test.tsx
import { render } from "@testing-library/react";
import { headers } from "next/headers";

jest.mock("next/headers");

describe("Layout Rendering", () => {
  it("should hide nav and footer on auth pages", async () => {
    (headers as jest.Mock).mockReturnValue(
      new Map([["x-pathname", "/en/login"]])
    );

    // Test your layout component
  });

  it("should hide footer on settings pages", async () => {
    (headers as jest.Mock).mockReturnValue(
      new Map([["x-pathname", "/en/settings/profile"]])
    );

    // Test your layout component
  });
});
```

This comprehensive analysis shows that server-side conditional layouts are not only possible but also provide better performance and SEO than client-side solutions.
