# Team Claude Code Configuration

## UI Design System - shadcn/ui with TweakCN Theme Integration & Mobile-First

**CRITICAL: This project uses shadcn/ui design system with TweakCN theme builder integration and mobile-first responsive design. Always follow these guidelines:**

### shadcn/ui Component Usage

- **NEVER create custom UI components** - Use existing shadcn/ui components from `/src/components/ui/`
- **Check available components first**: accordion, button, card, carousel, form, input, label, menubar, navigation-menu, sonner, tabs
- **Add new shadcn/ui components**: Use `npx shadcn@latest add [component-name]`
- **Use cn() utility**: Always import `cn` from `@/lib/utils` for className merging
- **Follow shadcn/ui patterns**: Use the same prop interfaces and styling patterns

### Current shadcn/ui Configuration

- **Style**: new-york
- **Base Color**: neutral (dynamically overridden by TweakCN theme)
- **CSS Variables**: enabled (CRITICAL for TweakCN theme integration)
- **Color Format**: OKLCH (CRITICAL - TweakCN uses OKLCH format)
- **Icon Library**: lucide-react
- **RSC**: enabled (React Server Components)

## 📱 Mobile-First Responsive Design (MANDATORY)

**CRITICAL: Every component MUST be mobile-first and fully responsive**

### Mobile-First Rules

- **ALWAYS start with mobile styles (base classes)**
- **Use responsive prefixes to scale up**: `sm:` `md:` `lg:` `xl:`
- **Touch targets minimum 44px**: `h-11` or larger for buttons
- **Readable text minimum 16px**: Start with `text-sm` or `text-base`
- **Test on mobile first**: Design for 375px width minimum

### Mobile-First Breakpoint System

```typescript
// ✅ ALWAYS follow this pattern - mobile first, then scale up
<div className="
  p-4 text-sm flex-col gap-2         // Mobile (default)
  sm:p-6 sm:text-base sm:flex-row    // Tablet (640px+)
  md:p-8 md:text-lg                  // Desktop (768px+)
  lg:p-12 lg:text-xl                 // Large (1024px+)
  xl:p-16 xl:text-2xl                // XL (1280px+)
">

// ❌ WRONG - Never use desktop-first
<div className="p-16 text-2xl md:p-4 md:text-sm">
```

### Required Mobile-First Patterns

#### Navigation (Always Mobile-First)

```typescript
// ✅ CORRECT - Mobile hamburger, desktop horizontal
<nav className="flex items-center justify-between p-4">
  {/* Mobile menu */}
  <Sheet>
    <SheetTrigger asChild className="md:hidden">
      <Button variant="ghost" size="icon">
        <Menu className="h-6 w-6" />
      </Button>
    </SheetTrigger>
  </Sheet>

  {/* Desktop menu */}
  <div className="hidden md:flex md:items-center md:space-x-4">
    {/* Desktop nav items */}
  </div>
</nav>
```

#### Grid Layouts (Always Responsive)

```typescript
// ✅ CORRECT - Responsive grids
<div className="
  grid gap-4
  grid-cols-1           // 1 column mobile
  sm:grid-cols-2        // 2 columns tablet
  lg:grid-cols-3        // 3 columns desktop
  xl:grid-cols-4        // 4 columns large
">
```

#### Components (Always Scale Up)

```typescript
// ✅ CORRECT - Mobile-first component sizing
<Card className="
  w-full p-4 mb-4      // Mobile: full width, compact
  sm:p-6               // Tablet: more padding
  md:p-8 md:max-w-2xl  // Desktop: max width
">
```

### Required Mobile Components

```bash
# Add these mobile-essential components
npx shadcn@latest add sheet          # Mobile navigation
npx shadcn@latest add drawer         # Mobile bottom sheets
npx shadcn@latest add popover        # Touch-friendly popovers
npx shadcn@latest add dropdown-menu  # Mobile dropdowns
```

### Mobile-First Checklist (MANDATORY)

- [ ] **Touch targets**: Buttons minimum `h-11` (44px)
- [ ] **Readable text**: Minimum `text-sm` (14px) on mobile
- [ ] **Proper spacing**: Use `p-4` or larger on mobile
- [ ] **Responsive images**: Always use Next.js Image with `sizes` prop
- [ ] **Flexible layouts**: Flex/grid that adapts to screen size
- [ ] **Test mobile**: Verify 375px width works

## 🎨 TweakCN Theme Integration System (CRITICAL)

**MANDATORY: All components must support TweakCN theme variables with OKLCH color format**

### TweakCN Integration Rules

- **ALL components MUST use CSS variables**: `bg-primary`, `text-foreground`, etc.
- **OKLCH format REQUIRED**: TweakCN generates OKLCH colors (not HSL)
- **CSS variables MUST be TweakCN compatible**: Follow exact variable naming
- **Theme updates MUST affect entire app**: Global CSS variable approach
- **API integration PREPARED**: Ready for TweakCN API calls

### TweakCN Theme Structure (REQUIRED)

The theme CSS will be provided by TweakCN in this exact format:

```css
/* This is what TweakCN provides - NEVER modify this structure */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.2686 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2686 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2686 0 0);
  --primary: oklch(0.7686 0.1647 70.0804);
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.967 0.0029 264.5419);
  --secondary-foreground: oklch(0.4461 0.0263 256.8018);
  --muted: oklch(0.9846 0.0017 247.8389);
  --muted-foreground: oklch(0.551 0.0234 264.3637);
  --accent: oklch(0.9869 0.0214 95.2774);
  --accent-foreground: oklch(0.4732 0.1247 46.2007);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.9276 0.0058 264.5313);
  --input: oklch(0.9276 0.0058 264.5313);
  --ring: oklch(0.7686 0.1647 70.0804);
  --chart-1: oklch(0.7686 0.1647 70.0804);
  --chart-2: oklch(0.6658 0.1574 58.3183);
  --chart-3: oklch(0.5553 0.1455 48.9975);
  --chart-4: oklch(0.4732 0.1247 46.2007);
  --chart-5: oklch(0.4137 0.1054 45.9038);
  --sidebar: oklch(0.9846 0.0017 247.8389);
  --sidebar-foreground: oklch(0.2686 0 0);
  --sidebar-primary: oklch(0.7686 0.1647 70.0804);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.9869 0.0214 95.2774);
  --sidebar-accent-foreground: oklch(0.4732 0.1247 46.2007);
  --sidebar-border: oklch(0.9276 0.0058 264.5313);
  --sidebar-ring: oklch(0.7686 0.1647 70.0804);
  --font-sans: Inter, sans-serif;
  --font-serif: Source Serif 4, serif;
  --font-mono: JetBrains Mono, monospace;
  --radius: 0.375rem;
  /* ... shadow and spacing variables */
}

.dark {
  /* Dark mode overrides with OKLCH values */
  --background: oklch(0.2046 0 0);
  --foreground: oklch(0.9219 0 0);
  /* ... other dark mode variables */
}
```

### Global CSS Structure (REQUIRED)

```css
/* File: src/app/globals.css - MUST follow this exact structure */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* TweakCN theme variables will be injected here */
  /* DO NOT modify these - they come from TweakCN API */
  :root {
    /* Default fallback theme (OKLCH format) */
    --background: oklch(1 0 0);
    --foreground: oklch(0.2686 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.2686 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.2686 0 0);
    --primary: oklch(0.7686 0.1647 70.0804);
    --primary-foreground: oklch(0 0 0);
    --secondary: oklch(0.967 0.0029 264.5419);
    --secondary-foreground: oklch(0.4461 0.0263 256.8018);
    --muted: oklch(0.9846 0.0017 247.8389);
    --muted-foreground: oklch(0.551 0.0234 264.3637);
    --accent: oklch(0.9869 0.0214 95.2774);
    --accent-foreground: oklch(0.4732 0.1247 46.2007);
    --destructive: oklch(0.6368 0.2078 25.3313);
    --destructive-foreground: oklch(1 0 0);
    --border: oklch(0.9276 0.0058 264.5313);
    --input: oklch(0.9276 0.0058 264.5313);
    --ring: oklch(0.7686 0.1647 70.0804);
    --chart-1: oklch(0.7686 0.1647 70.0804);
    --chart-2: oklch(0.6658 0.1574 58.3183);
    --chart-3: oklch(0.5553 0.1455 48.9975);
    --chart-4: oklch(0.4732 0.1247 46.2007);
    --chart-5: oklch(0.4137 0.1054 45.9038);
    --sidebar: oklch(0.9846 0.0017 247.8389);
    --sidebar-foreground: oklch(0.2686 0 0);
    --sidebar-primary: oklch(0.7686 0.1647 70.0804);
    --sidebar-primary-foreground: oklch(1 0 0);
    --sidebar-accent: oklch(0.9869 0.0214 95.2774);
    --sidebar-accent-foreground: oklch(0.4732 0.1247 46.2007);
    --sidebar-border: oklch(0.9276 0.0058 264.5313);
    --sidebar-ring: oklch(0.7686 0.1647 70.0804);
    --font-sans: Inter, sans-serif;
    --font-serif: Source Serif 4, serif;
    --font-mono: JetBrains Mono, monospace;
    --radius: 0.375rem;
  }

  .dark {
    --background: oklch(0.2046 0 0);
    --foreground: oklch(0.9219 0 0);
    --card: oklch(0.2686 0 0);
    --card-foreground: oklch(0.9219 0 0);
    --popover: oklch(0.2686 0 0);
    --popover-foreground: oklch(0.9219 0 0);
    --primary: oklch(0.7686 0.1647 70.0804);
    --primary-foreground: oklch(0 0 0);
    --secondary: oklch(0.2686 0 0);
    --secondary-foreground: oklch(0.9219 0 0);
    --muted: oklch(0.2686 0 0);
    --muted-foreground: oklch(0.7155 0 0);
    --accent: oklch(0.4732 0.1247 46.2007);
    --accent-foreground: oklch(0.9243 0.1151 95.7459);
    --destructive: oklch(0.6368 0.2078 25.3313);
    --destructive-foreground: oklch(1 0 0);
    --border: oklch(0.3715 0 0);
    --input: oklch(0.3715 0 0);
    --ring: oklch(0.7686 0.1647 70.0804);
    --chart-1: oklch(0.8369 0.1644 84.4286);
    --chart-2: oklch(0.6658 0.1574 58.3183);
    --chart-3: oklch(0.4732 0.1247 46.2007);
    --chart-4: oklch(0.5553 0.1455 48.9975);
    --chart-5: oklch(0.4732 0.1247 46.2007);
    --sidebar: oklch(0.1684 0 0);
    --sidebar-foreground: oklch(0.9219 0 0);
    --sidebar-primary: oklch(0.7686 0.1647 70.0804);
    --sidebar-primary-foreground: oklch(1 0 0);
    --sidebar-accent: oklch(0.4732 0.1247 46.2007);
    --sidebar-accent-foreground: oklch(0.9243 0.1151 95.7459);
    --sidebar-border: oklch(0.3715 0 0);
    --sidebar-ring: oklch(0.7686 0.1647 70.0804);
    --font-sans: Inter, sans-serif;
    --font-serif: Source Serif 4, serif;
    --font-mono: JetBrains Mono, monospace;
    --radius: 0.375rem;
  }
}

/* Mobile-first responsive utilities */
@layer utilities {
  .container-responsive {
    @apply w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16;
  }

  .text-responsive {
    @apply text-sm sm:text-base md:text-lg lg:text-xl;
  }

  .space-responsive {
    @apply space-y-4 sm:space-y-6 md:space-y-8;
  }

  .grid-responsive {
    @apply grid gap-4 sm:gap-6 md:gap-8;
  }
}

/* Ensure OKLCH support */
@supports (color: oklch(1 0 0)) {
  /* OKLCH is supported - all good */
}

@supports not (color: oklch(1 0 0)) {
  /* Fallback for browsers that don't support OKLCH */
  :root {
    /* Convert OKLCH to fallback values if needed */
  }
}
```

### TweakCN Theme Integration Utilities (REQUIRED)

```typescript
// File: src/lib/theme-integration.ts (REQUIRED)
export interface TweakCNTheme {
  css: string; // The complete CSS from TweakCN API
}

// Function to apply TweakCN theme (for future API integration)
export async function fetchThemeFromTweakCN(
  clientId: string
): Promise<TweakCNTheme> {
  try {
    // This will be the actual API call to TweakCN
    const response = await fetch(`/api/tweakcn/theme/${clientId}`);
    const theme = await response.json();
    return theme;
  } catch (error) {
    console.error("Failed to fetch TweakCN theme:", error);
    return getDefaultTweakCNTheme();
  }
}

// Apply theme CSS to document (for manual testing)
export function applyTweakCNTheme(themeCSS: string) {
  const styleId = "tweakcn-theme";
  const existingStyle = document.getElementById(styleId);

  if (existingStyle) {
    existingStyle.textContent = themeCSS;
  } else {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = themeCSS;
    document.head.appendChild(style);
  }
}

// Default theme for fallback
function getDefaultTweakCNTheme(): TweakCNTheme {
  return {
    css: `
      :root {
        --background: oklch(1.0000 0 0);
        --foreground: oklch(0.2686 0 0);
        --primary: oklch(0.7686 0.1647 70.0804);
        /* ... all default OKLCH values */
      }
    `,
  };
}

// Manual theme replacement for development (TEMPORARY)
export function replaceThemeInGlobalCSS(newThemeCSS: string) {
  console.log("🎨 Replacing theme in global CSS for development");
  console.log("📝 In production, this will be handled by TweakCN API");

  // For development: manually replace the CSS variables section
  // In production: this will be automated via API call
}
```

### TweakCN-Compatible Component Pattern (REQUIRED)

```typescript
// ✅ CORRECT - Components that work with TweakCN themes
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TweakCNCardProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'secondary' | 'sidebar'
  className?: string
  title?: string
}

export function TweakCNCard({
  children,
  variant = 'default',
  className,
  title
}: TweakCNCardProps) {
  return (
    <Card className={cn(
      // Mobile-first responsive
      "w-full p-4 sm:p-6 md:p-8",

      // TweakCN theme-aware variants (using exact CSS variable names)
      variant === 'default' && "bg-card border-border text-card-foreground",
      variant === 'accent' && "bg-accent/10 border-accent/20 text-accent-foreground",
      variant === 'secondary' && "bg-secondary/10 border-secondary/20 text-secondary-foreground",
      variant === 'sidebar' && "bg-sidebar border-sidebar-border text-sidebar-foreground",

      className
    )}>
      {title && (
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className={cn(
            "text-lg sm:text-xl md:text-2xl",
            variant === 'accent' && "text-accent-foreground",
            variant === 'secondary' && "text-secondary-foreground",
            variant === 'sidebar' && "text-sidebar-foreground"
          )}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : ""}>
        {children}
      </CardContent>
    </Card>
  )
}

// ✅ CORRECT - Button with TweakCN support
export function TweakCNButton({
  children,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        // Mobile-first touch targets
        "h-11 px-4 sm:h-10 sm:px-6 md:px-8",

        // Text scales responsively
        "text-sm sm:text-base",

        // TweakCN colors handled automatically by shadcn/ui CSS variables
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
```

### Available TweakCN CSS Variables (REFERENCE)

```typescript
// ✅ ALWAYS use these exact CSS variable names for TweakCN compatibility
export const TWEAKCN_VARIABLES = {
  // Background & Surface
  background: "bg-background", // Main page background
  card: "bg-card", // Card backgrounds
  popover: "bg-popover", // Popover/dropdown backgrounds
  sidebar: "bg-sidebar", // Sidebar background

  // Text Colors
  foreground: "text-foreground", // Main text
  cardForeground: "text-card-foreground", // Text on cards
  popoverForeground: "text-popover-foreground", // Text on popovers
  sidebarForeground: "text-sidebar-foreground", // Text in sidebar

  // Brand Colors
  primary: "bg-primary", // Primary brand color
  primaryForeground: "text-primary-foreground", // Text on primary
  secondary: "bg-secondary", // Secondary brand color
  secondaryForeground: "text-secondary-foreground", // Text on secondary
  accent: "bg-accent", // Accent color
  accentForeground: "text-accent-foreground", // Text on accent

  // Interactive Elements
  muted: "bg-muted", // Muted backgrounds
  mutedForeground: "text-muted-foreground", // Muted text
  destructive: "bg-destructive", // Error/danger color
  destructiveForeground: "text-destructive-foreground", // Text on destructive

  // Borders & Inputs
  border: "border-border", // Border color
  input: "border-input", // Input border color
  ring: "ring-ring", // Focus ring color

  // Charts
  chart1: "fill-chart-1", // Chart color 1
  chart2: "fill-chart-2", // Chart color 2
  chart3: "fill-chart-3", // Chart color 3
  chart4: "fill-chart-4", // Chart color 4
  chart5: "fill-chart-5", // Chart color 5
} as const;
```

### TweakCN API Integration (PREPARED)

```typescript
// File: src/app/api/tweakcn/theme/[clientId]/route.ts (PREPARED FOR FUTURE)
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // This will call TweakCN API when ready
    const tweakCNResponse = await fetch(
      `${process.env.TWEAKCN_API_URL}/themes/${params.clientId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWEAKCN_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!tweakCNResponse.ok) {
      throw new Error("Failed to fetch theme from TweakCN");
    }

    const themeData = await tweakCNResponse.json();

    return NextResponse.json({
      css: themeData.css, // The complete CSS with OKLCH values
      metadata: themeData.metadata || {},
    });
  } catch (error) {
    console.error("TweakCN theme fetch error:", error);

    // Return default theme on error
    return NextResponse.json(getDefaultTweakCNTheme());
  }
}

function getDefaultTweakCNTheme() {
  return {
    css: `
      :root {
        --background: oklch(1.0000 0 0);
        --foreground: oklch(0.2686 0 0);
        --primary: oklch(0.7686 0.1647 70.0804);
        /* ... complete default OKLCH theme */
      }
    `,
  };
}
```

### Development Workflow with TweakCN

#### For Development (Current):

1. **Get theme CSS from TweakCN builder**
2. **Copy the CSS output to `src/app/globals.css`**
3. **Replace the `:root` and `.dark` sections**
4. **All components automatically use new theme**
5. **Test across all breakpoints**

#### For Production (Future):

1. **TweakCN API will provide theme CSS**
2. **API route will fetch and serve theme**
3. **Global CSS will be updated dynamically**
4. **All components automatically reflect changes**

## SEO Standards (CRITICAL - Mobile & TweakCN Theme Aware) 🎯

**MANDATORY: Every page MUST be SEO-friendly, mobile-optimized, and TweakCN theme-compatible**

### Mobile-First SEO Requirements

```typescript
// ✅ REQUIRED - Every page MUST export this metadata pattern
export const metadata: Metadata = {
  title: 'Page Title | Brand Name',
  description: 'Mobile-optimized description (150-160 chars)',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5, // Allow zoom for accessibility
  },
  openGraph: {
    title: 'Page Title | Brand Name',
    description: 'Description for social sharing',
    url: 'https://yourdomain.com/page',
    images: [{
      url: 'https://yourdomain.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Descriptive alt text',
    }],
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ✅ REQUIRED - Mobile-first page structure with TweakCN theme support
export default function SEOPage() {
  return (
    <main className="container-responsive bg-background text-foreground">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
        One H1 Per Page
      </h1>

      <section className="mt-6 sm:mt-8 md:mt-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl text-foreground">
          Section Heading
        </h2>

        <div className="grid-responsive grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* TweakCN-compatible responsive content */}
        </div>
      </section>
    </main>
  )
}
```

### SEO + Mobile + TweakCN Component Pattern

```typescript
// ✅ REQUIRED - SEO-optimized, responsive, TweakCN-compatible
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SEOProductCardProps {
  title: string
  description: string
  image: string
  price: string
  slug: string
}

export function SEOProductCard({ title, description, image, price, slug }: SEOProductCardProps) {
  return (
    <Card
      as="article"
      itemScope
      itemType="https://schema.org/Product"
      className="w-full h-full bg-card border-border text-card-foreground" // TweakCN variables
    >
      <CardHeader className="p-4 sm:p-6">
        <CardTitle
          as="h3"
          itemProp="name"
          className="text-lg sm:text-xl line-clamp-2 text-card-foreground"
        >
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <Image
          src={image}
          alt={`${title} product image`}
          width={300}
          height={200}
          itemProp="image"
          className="w-full h-48 object-cover rounded-md"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <p
          itemProp="description"
          className="mt-3 text-sm sm:text-base text-muted-foreground line-clamp-3"
        >
          {description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span
            itemProp="price"
            className="text-lg sm:text-xl font-semibold text-primary"
          >
            {price}
          </span>

          <Button
            variant="default"
            size="sm"
            className="h-9 px-3 sm:h-10 sm:px-4 bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label={`Buy ${title} for ${price}`}
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Project Standards

### Enhanced Development Workflow with TweakCN

```bash
# Before starting work (REQUIRED)
npm run type-check
npm run lint

# After making changes (REQUIRED)
npm run format
npm run lint:fix
npm run type-check
npm run build

# Mobile testing (REQUIRED)
npm run dev
# Test at: 375px, 768px, 1024px, 1440px widths

# TweakCN theme testing (REQUIRED)
# 1. Get CSS from TweakCN builder
# 2. Replace CSS variables in globals.css
# 3. Verify all components update automatically
# 4. Test light and dark mode variants
```

### File Structure (REQUIRED)

```
src/
├── app/                           # Next.js App Router
│   ├── Components/                # App components (TweakCN compatible)
│   │   ├── TweakCNCard.tsx       # TweakCN-aware components
│   │   ├── ResponsiveNav.tsx     # Mobile-first navigation
│   │   └── SearchResults.tsx     # Feature components
│   ├── api/
│   │   └── tweakcn/
│   │       └── theme/
│   │           └── [clientId]/
│   │               └── route.ts  # TweakCN API endpoint (prepared)
│   ├── globals.css               # TweakCN CSS variables + utilities
│   └── layout.tsx                # TweakCN theme integration
├── components/
│   └── ui/                       # shadcn/ui (DON'T MODIFY)
├── lib/
│   ├── utils.ts                  # cn() utility
│   └── theme-integration.ts      # TweakCN utilities
└── stories/                      # Storybook documentation
```

### Component Creation Rules (MANDATORY)

1. **Start with mobile design** - Use mobile-first classes
2. **Add responsive breakpoints** - Scale up with `sm:` `md:` `lg:`
3. **Use TweakCN CSS variables** - Always use `bg-primary`, `text-foreground`, etc.
4. **Test with theme changes** - Verify component works when CSS variables change
5. **Follow SEO patterns** - Semantic HTML, proper headings
6. **Use shadcn/ui only** - Never create custom UI primitives
7. **OKLCH compatibility** - Ensure components work with OKLCH color format

### Required shadcn/ui Components for TweakCN Stack

```bash
# Essential mobile + TweakCN components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add sheet        # Mobile navigation
npx shadcn@latest add drawer       # Mobile sheets
npx shadcn@latest add skeleton     # Loading states
npx shadcn@latest add popover      # Touch-friendly
npx shadcn@latest add dropdown-menu
npx shadcn@latest add navigation-menu
npx shadcn@latest add breadcrumb
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add sidebar      # For sidebar components
```

### Code Quality Patterns

#### Mobile-First TweakCN Component Template

```typescript
// ✅ TEMPLATE - Use this for all new components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ComponentProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'accent' | 'secondary' | 'sidebar'
  title?: string
}

export function ResponsiveTweakCNComponent({
  children,
  className,
  variant = 'default',
  title
}: ComponentProps) {
  return (
    <Card className={cn(
      // Mobile-first base styles
      "w-full p-4",

      // Responsive scaling
      "sm:p-6 md:p-8",

      // TweakCN theme variants (exact CSS variable names)
      variant === 'default' && "bg-card border-border text-card-foreground",
      variant === 'accent' && "bg-accent/10 border-accent/20 text-accent-foreground",
      variant === 'secondary' && "bg-secondary/10 border-secondary/20 text-secondary-foreground",
      variant === 'sidebar' && "bg-sidebar border-sidebar-border text-sidebar-foreground",

      className
    )}>
      {title && (
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className={cn(
            "text-lg sm:text-xl md:text-2xl",
            variant === 'accent' && "text-accent-foreground",
            variant === 'secondary' && "text-secondary-foreground",
            variant === 'sidebar' && "text-sidebar-foreground"
          )}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : ""}>
        {children}
      </CardContent>
    </Card>
  )
}
```

#### Page Template (REQUIRED)

```typescript
// ✅ TEMPLATE - Use this for all new pages
import { Metadata } from 'next'
import { TweakCNCard } from '@/app/Components/TweakCNCard'

export const metadata: Metadata = {
  title: 'Page Name | Brand',
  description: 'Mobile-optimized description...',
  viewport: { width: 'device-width', initialScale: 1 }
}

export default function ResponsiveTweakCNPage() {
  return (
    <main className="container-responsive space-responsive bg-background text-foreground">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
        Page Title
      </h1>

      <section className="mt-6 sm:mt-8 md:mt-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl text-foreground mb-4 sm:mb-6">
          Section Heading
        </h2>

        <div className="grid-responsive grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <TweakCNCard title="Card Title" variant="default">
            Card content that adapts to TweakCN theme automatically
          </TweakCNCard>
        </div>
      </section>
    </main>
  )
}
```

### TweakCN Integration Workflow

#### Current Development Process:

1. **Build components using TweakCN CSS variables**
2. **Get theme CSS from TweakCN builder**
3. **Replace CSS variables in `src/app/globals.css`**
4. **All components automatically update with new theme**
5. **Test across all breakpoints and theme variants**

#### Future Production Process:

1. **Components use same TweakCN CSS variables**
2. **API fetches theme from TweakCN service**
3. **CSS variables updated dynamically**
4. **Entire app reflects client's brand automatically**

### Consistency Rules

1. **Never** hardcode colors - always use TweakCN CSS variables
2. **Always** test components with different TweakCN themes
3. **Always** use mobile-first responsive approach
4. **Never** modify shadcn/ui components - they're auto-generated
5. **Always** use OKLCH-compatible color handling
6. **Always** include proper SEO metadata on pages
7. **Never** create custom UI primitives - compose with shadcn/ui
8. **Always** verify theme changes affect entire application

---

_This configuration ensures all team members build TweakCN-compatible, mobile-first applications that automatically adapt to any client's brand theme through CSS variable replacement._
