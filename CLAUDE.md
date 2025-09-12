# Team Claude Code Configuration

## UI Design System - shadcn/ui

**CRITICAL: This project uses shadcn/ui design system. Always follow these guidelines:**

### shadcn/ui Component Usage

- **NEVER create custom UI components** - Use existing shadcn/ui components from `/src/components/ui/`
- **Check available components first**: accordion, button, card, carousel, form, input, label, menubar, navigation-menu, sonner, tabs
- **Add new shadcn/ui components**: Use `npx shadcn@latest add [component-name]`
- **Use cn() utility**: Always import `cn` from `@/lib/utils` for className merging
- **Follow shadcn/ui patterns**: Use the same prop interfaces and styling patterns

### Current shadcn/ui Configuration

- **Style**: new-york
- **Base Color**: neutral
- **CSS Variables**: enabled
- **Icon Library**: lucide-react
- **RSC**: enabled (React Server Components)

### shadcn/ui Component Rules

```typescript
// ✅ CORRECT - Use existing shadcn/ui component
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ✅ CORRECT - Extend with cn() utility
<Button className={cn("custom-class", someCondition && "conditional-class")}>

// ❌ WRONG - Don't create custom UI primitives
const CustomButton = ({ children }) => <button>{children}</button>
```

### Adding New shadcn/ui Components

```bash
# Always use this command to add new components
npx shadcn@latest add [component-name]

# Examples:
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
```

## SEO Standards (CRITICAL - Always Consider SEO) 🎯

**MANDATORY: Every page, component, and feature MUST consider SEO implications**

### Next.js 15 SEO Requirements

- **Always export metadata** for every page route
- **Use semantic HTML** elements with shadcn/ui components
- **Implement proper heading hierarchy** (h1 → h2 → h3)
- **Add alt text** to all images using Next.js Image component
- **Use structured data** where applicable

### Page-Level SEO (REQUIRED for all routes)

```typescript
// ✅ REQUIRED - Every page MUST export metadata
// File: src/app/about/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Your Brand Name',
  description: 'Learn about our company mission, values, and team. Discover why we\'re the leading solution for [your industry].',
  keywords: ['about', 'company', 'team', 'mission'],
  openGraph: {
    title: 'About Us | Your Brand Name',
    description: 'Learn about our company mission, values, and team.',
    url: 'https://yourdomain.com/about',
    siteName: 'Your Brand Name',
    images: [{
      url: 'https://yourdomain.com/og-about.jpg',
      width: 1200,
      height: 630,
      alt: 'About Us - Your Brand Name',
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Your Brand Name',
    description: 'Learn about our company mission, values, and team.',
    images: ['https://yourdomain.com/twitter-about.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function AboutPage() {
  return (
    <main>
      <h1>About Us</h1> {/* ✅ REQUIRED - One h1 per page */}
      {/* ... rest of page content */}
    </main>
  )
}
```

### SEO-Optimized Component Structure

```typescript
// ✅ SEO-OPTIMIZED - Use semantic HTML with shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ProductCardProps {
  title: string
  description: string
  price: string
  imageUrl: string
  imageAlt: string
}

export function ProductCard({ title, description, price, imageUrl, imageAlt }: ProductCardProps) {
  return (
    <Card as="article" itemScope itemType="https://schema.org/Product">
      <CardHeader>
        <CardTitle as="h2" itemProp="name">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={300}
          height={200}
          itemProp="image"
          priority={false}
        />
        <p itemProp="description">{description}</p>
        <span itemProp="price">{price}</span>
        <Button aria-label={`Buy ${title} for ${price}`}>
          Buy Now
        </Button>
      </CardContent>
    </Card>
  )
}
```

### SEO Checklist for Every Page/Component

- [ ] **Metadata exported** with title, description, OG tags
- [ ] **One h1 per page** - descriptive and keyword-focused
- [ ] **Proper heading hierarchy** (h1 → h2 → h3, no skipping)
- [ ] **Alt text on all images** using Next.js Image component
- [ ] **Semantic HTML elements** (main, article, section, nav, aside)
- [ ] **Internal linking** with descriptive anchor text
- [ ] **Loading performance** optimized (lazy loading, image optimization)
- [ ] **Mobile responsive** design with shadcn/ui
- [ ] **Accessibility** attributes (aria-labels, roles)
- [ ] **Structured data** when applicable (JSON-LD)

### Required SEO Components to Create

```bash
# Add these SEO-focused shadcn/ui components
npx shadcn@latest add breadcrumb
npx shadcn@latest add navigation-menu
```

### Global SEO Configuration

```typescript
// File: src/app/layout.tsx - Update the existing layout
export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),
  title: {
    default: "Your Brand Name | Professional [Industry] Solutions",
    template: "%s | Your Brand Name",
  },
  description: "Default meta description for your site (150-160 characters)",
  keywords: ["keyword1", "keyword2", "industry terms"],
  authors: [{ name: "Your Company" }],
  creator: "Your Company",
  publisher: "Your Company",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
    siteName: "Your Brand Name",
  },
  verification: {
    google: "your-google-verification-code",
  },
};
```

### Image SEO Standards

```typescript
// ✅ ALWAYS use Next.js Image component
import Image from 'next/image'

// ✅ CORRECT - SEO-optimized image
<Image
  src="/product-hero.jpg"
  alt="Professional team collaborating on innovative solutions"
  width={1200}
  height={600}
  priority // Only for above-the-fold images
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// ❌ WRONG - No alt text, not optimized
<img src="/image.jpg" />
```

### SEO Utility Functions (Available)

```typescript
// Import SEO utilities
import { generateMetadata, structuredData, generateSlug } from "@/lib/seo";

// ✅ Use utility for consistent metadata
export const metadata = generateMetadata({
  title: "About Us",
  description: "Learn about our company mission and values...",
  keywords: ["about", "company", "team"],
  path: "/about",
});

// ✅ Use structured data utilities
const organizationData = structuredData.organization;
const productData = structuredData.product({
  name: "Product Name",
  description: "Product description",
  image: "/product.jpg",
  price: "99.99",
  currency: "USD",
  availability: "InStock",
  url: "https://yourdomain.com/product",
});
```

### Common SEO Patterns

```typescript
// ✅ SEO-optimized page template
import { generateMetadata } from '@/lib/seo'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'

export const metadata = generateMetadata({
  title: 'Page Title',
  description: 'Page description for search engines...',
  keywords: ['keyword1', 'keyword2'],
  path: '/current-page'
})

export default function SEOOptimizedPage() {
  return (
    <main>
      <h1>Main Page Heading</h1> {/* One h1 per page */}

      <section aria-labelledby="section-heading">
        <h2 id="section-heading">Section Heading</h2>

        <Card as="article">
          <CardHeader>
            <CardTitle as="h3">Article Title</CardTitle>
          </CardHeader>
          <CardContent>
            <Image
              src="/article-image.jpg"
              alt="Descriptive alt text for the image"
              width={600}
              height={400}
            />
            <p>Article content with proper semantic structure...</p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
```

### SEO Command Sequence

```bash
# ALWAYS run after creating pages/components
npm run type-check
npm run lint:fix
npm run build

# Check for SEO issues
npm run lighthouse # (Add this script to package.json)
```

### Performance SEO Standards

- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Image optimization**: Use Next.js Image with proper sizes
- **Font optimization**: Use Next.js font optimization (already configured)
- **Code splitting**: Use dynamic imports for heavy components
- **Caching**: Implement proper cache headers
- **Structured data**: Use utilities from `/src/lib/seo.ts`

## Project Standards

### Code Quality

- Always run type checking: `npm run type-check`
- Always run linting: `npm run lint:fix`
- Always run formatting: `npm run format`
- Use consistent naming conventions (camelCase for variables/functions, PascalCase for components)

### Development Workflow

1. Before making changes, run: `npm run type-check && npm run lint`
2. After changes, run: `npm run format && npm run lint:fix`
3. Test changes with: `npm run dev`
4. Verify build works: `npm run build`

### Component Structure

- **UI Components**: Only use shadcn/ui components in `/src/components/ui/` - DO NOT modify these
- **App Components**: Place app-specific components in `/src/app/Components/`
- **Composition**: Create app components by composing shadcn/ui components
- **Props**: Always use TypeScript interfaces for all props
- **Styling**: Use Tailwind CSS classes with cn() utility for conditional styling

### File Conventions

- Use `.tsx` for React components
- Use `.ts` for utility functions
- Keep component files focused (one main component per file)
- Use barrel exports where appropriate

### Code Style

- Use Tailwind CSS for styling
- Prefer composition over inheritance
- Use React Hook Form for form handling
- Use Zod for schema validation
- Implement proper error boundaries

### Testing

- Use Vitest for unit testing
- Use Storybook for component documentation
- Test components in isolation when possible

### Performance

- Use Next.js 15 with Turbopack for development
- Implement proper code splitting
- Use dynamic imports for heavy components
- Optimize images and assets

## Team Commands

When working on this project, always use these commands in sequence:

```bash
# Before starting work
npm run type-check
npm run lint

# After making changes
npm run format
npm run lint:fix
npm run type-check

# Before committing
npm run build
```

## Common Patterns

### API Routes

- Place in `/src/app/api/`
- Use proper HTTP status codes
- Implement error handling
- Use TypeScript for request/response types

### Form Handling

```typescript
// Use shadcn/ui Form components with React Hook Form + Zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema)
})

// Always wrap forms with shadcn/ui Form component
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="email@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### Component Props

```typescript
// Always define interfaces for props
interface ComponentProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}
```

## Consistency Rules

1. **Never** create files without checking existing patterns first
2. **Always** follow the established folder structure
3. **Always** use existing UI components before creating new ones
4. **Always** run the full command sequence before considering work complete
5. **Never** commit code that doesn't pass type checking and linting

## Git Hooks

This project uses Husky and lint-staged for pre-commit hooks:

- Automatically runs ESLint fix and Prettier on staged files
- Ensures code quality before commits

## IDE Integration

Recommended VS Code extensions:

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag

## Project Structure Standards

### Current Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── Components/         # App-specific components (compose shadcn/ui)
│   ├── api/               # API routes
│   ├── login/             # Auth pages
│   └── register/          # Auth pages
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components (DO NOT MODIFY)
│   └── NoSSR.tsx         # Utility components
├── lib/
│   └── utils.ts          # cn() utility and helpers
└── stories/              # Storybook documentation
```

### shadcn/ui Specific Structure Rules

- **Never modify `/src/components/ui/`** - These are generated shadcn/ui components
- **App components go in `/src/app/Components/`** - Compose using shadcn/ui primitives
- **Use shadcn/ui aliases**: `@/components/ui/*`, `@/lib/utils`
- **Add new shadcn components**: `npx shadcn@latest add [component-name]`

### When Adding New shadcn/ui Components

1. Always use: `npx shadcn@latest add [component-name]`
2. Component will be added to `/src/components/ui/[component-name].tsx`
3. Update imports in app components to use the new component
4. Never manually create UI primitives - always use shadcn/ui

### Component Creation Workflow

```typescript
// ✅ CORRECT - Compose app components using shadcn/ui
// File: src/app/Components/UserCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"

interface UserCardProps {
  name: string
  email: string
}

export function UserCard({ name, email }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{email}</p>
        <Button>View Profile</Button>
      </CardContent>
    </Card>
  )
}
```

---

_This configuration ensures all team members using Claude Code follow the same standards and workflows._
