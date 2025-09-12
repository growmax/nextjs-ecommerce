# Tech Stack Consistency Guide

## Current Tech Stack Status ✅

### Core Framework

- **Next.js 15.5.2** - App Router with Turbopack
- **React 19.1.0** - Latest version with Server Components
- **TypeScript 5** - Strict mode enabled

### UI Design System

- **shadcn/ui** - New York style with CSS variables
- **Tailwind CSS 4** - Latest version with new architecture
- **Radix UI** - Headless components (via shadcn/ui)
- **Lucide React** - Icon library
- **class-variance-authority** - Component variants
- **tailwind-merge + clsx** - Conditional styling utilities

### Form Handling

- **React Hook Form 7.62.0** - Form state management
- **Zod 4.1.5** - Schema validation
- **@hookform/resolvers** - Zod integration

### Development Tools

- **ESLint 9** - Flat config with Next.js rules
- **Prettier 3.6.2** - Code formatting
- **Husky 9.1.7** - Git hooks
- **lint-staged 16.1.6** - Pre-commit linting

### Testing (Configured but can be extended)

- **Vitest 3.2.4** - Unit testing
- **@vitest/browser** - Browser testing
- **Playwright 1.55.0** - E2E testing
- **Storybook 9.1.5** - Component documentation

## Areas for Future Consistency Updates 📋

### 1. State Management (⚠️ NEEDS STANDARDIZATION)

**Current State**: No global state management defined
**Recommendation**: Choose one approach for team consistency

**Options to standardize:**

```bash
# Option A: Zustand (Recommended for most projects)
npm install zustand

# Option B: Redux Toolkit
npm install @reduxjs/toolkit react-redux

# Option C: Jotai (for atomic state)
npm install jotai
```

**Update Location**: Add to `CLAUDE.md` under "State Management Standards"

### 2. Data Fetching (⚠️ NEEDS STANDARDIZATION)

**Current State**: No data fetching strategy defined
**Recommendation**: Choose and document pattern

**Options to standardize:**

```bash
# Option A: TanStack Query (Recommended)
npm install @tanstack/react-query

# Option B: SWR
npm install swr

# Option C: Native fetch with Next.js patterns
# (Document patterns in CLAUDE.md)
```

**Update Location**: Add to `CLAUDE.md` under "Data Fetching Standards"

### 3. Database & ORM (⚠️ NEEDS STANDARDIZATION)

**Current State**: No database integration
**Recommendation**: Choose based on project needs

**Popular options for Next.js:**

```bash
# Option A: Prisma + PostgreSQL
npm install prisma @prisma/client

# Option B: Drizzle ORM
npm install drizzle-orm

# Option C: Supabase
npm install @supabase/supabase-js
```

**Update Location**: Add to `CLAUDE.md` under "Database Standards"

### 4. Authentication (⚠️ NEEDS STANDARDIZATION)

**Current State**: Basic auth routes exist but no provider defined
**Files to review**: `src/app/api/auth/` directory

**Options to standardize:**

```bash
# Option A: NextAuth.js/Auth.js (Recommended)
npm install next-auth

# Option B: Clerk
npm install @clerk/nextjs

# Option C: Supabase Auth
npm install @supabase/auth-ui-react
```

**Update Location**: Add to `CLAUDE.md` under "Authentication Standards"

### 5. Deployment & Environment (✅ PARTIALLY DONE)

**Current State**: Next.js deployment ready
**Needs**: Environment variable standards

**Add to project:**

```bash
# Create environment files
touch .env.local.example
touch .env.production.example
```

**Update Location**: Add to `CLAUDE.md` under "Environment Standards"

### 6. Error Handling (⚠️ NEEDS STANDARDIZATION)

**Current State**: Basic error handling
**Recommendation**: Standardize error boundaries and error pages

**Add to project:**

```typescript
// Create error boundary component
// Add to src/app/Components/ErrorBoundary.tsx
```

**Update Location**: Add to `CLAUDE.md` under "Error Handling Standards"

### 7. Monitoring & Analytics (⚠️ NEEDS STANDARDIZATION)

**Current State**: Not configured
**Options to consider:**

- Vercel Analytics
- Posthog
- Mixpanel
- Google Analytics 4

**Update Location**: Add to `CLAUDE.md` under "Analytics Standards"

### 8. Performance Monitoring (⚠️ NEEDS STANDARDIZATION)

**Current State**: Not configured
**Options:**

```bash
# Option A: @vercel/speed-insights
npm install @vercel/speed-insights

# Option B: Web Vitals reporting
npm install web-vitals
```

## Immediate Actions Required 🚨

### 1. Update CLAUDE.md with Missing Standards

Add these sections to `CLAUDE.md`:

```markdown
## State Management Standards

[Choose and document your preferred solution]

## Data Fetching Standards

[Choose and document your preferred solution]

## Authentication Standards

[Choose and document your preferred solution]

## Environment Variables Standards

[Document naming conventions and required variables]
```

### 2. Create Configuration Files

```bash
# Environment examples
touch .env.local.example

# Add package.json scripts for different environments
# Update package.json with deployment scripts
```

### 3. Team Decision Points

Schedule team meetings to decide on:

1. **State Management Strategy** (Zustand vs Redux vs Jotai)
2. **Data Fetching Strategy** (TanStack Query vs SWR vs native)
3. **Database Choice** (Prisma vs Drizzle vs Supabase)
4. **Authentication Provider** (NextAuth vs Clerk vs custom)

### 4. Documentation Updates

Update these files when decisions are made:

- `CLAUDE.md` - Add new standards
- `package.json` - Add new dependencies
- `README.md` - Update setup instructions
- `.env.local.example` - Add environment variables

## Folder Structure Updates Needed 📁

### Current Structure ✅

```
src/
├── app/                     # Next.js App Router ✅
│   ├── Components/          # App-specific components ✅
│   ├── api/                # API routes ✅
│   └── (routes)/           # Route groups ✅
├── components/             # Reusable components ✅
│   └── ui/                # shadcn/ui components ✅
├── lib/                   # Utilities ✅
└── stories/               # Storybook ✅
```

### Recommended Additions 📋

```
src/
├── app/
│   ├── Components/
│   ├── api/
│   └── (auth)/            # Auth route group (ADD)
├── components/
│   └── ui/
├── lib/
│   ├── auth.ts           # Auth configuration (ADD)
│   ├── db.ts             # Database connection (ADD)
│   └── validations/      # Zod schemas (ADD)
├── hooks/                # Custom React hooks (ADD)
├── stores/               # State management (ADD)
├── types/                # TypeScript definitions (ADD)
└── constants/            # App constants (ADD)
```

## Priority Order for Implementation 🎯

### Phase 1 (Immediate - This Week)

1. ✅ shadcn/ui standards (DONE)
2. 🔄 State management decision
3. 🔄 Data fetching decision

### Phase 2 (Next Sprint)

1. Authentication implementation
2. Database integration
3. Environment variables standardization

### Phase 3 (Future Sprints)

1. Error handling standards
2. Monitoring and analytics
3. Performance optimization standards

---

_This guide should be updated as the team makes decisions about the tech stack. Each decision should be reflected in CLAUDE.md to ensure all developers and Claude Code follow the same patterns._
