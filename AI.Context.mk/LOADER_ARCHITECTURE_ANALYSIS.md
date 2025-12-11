# Hybrid Loader Architecture Migration Analysis

**Date:** December 1, 2025  
**Repository:** nextjs-ecommerce  
**Branch:** refactor/51  
**Purpose:** Document current loader system for migration to Hybrid Loader Architecture

---

## 1. Current Loader Implementation Overview

Your project uses a **multi-instance loader system** with a combination of:

### A. Global Loader Context (`LoadingProvider`)

- **Location:** `src/hooks/useGlobalLoader.tsx`
- **Type:** React Context API with local state management
- **Architecture:** Centralized context-based state management
- **Loader Instances Supported:** Multiple (using `loadingIds` Set to track concurrent loaders)

### B. Navigation-Specific Loaders

- **`useNavigationProgress`** - Auto-detects route transitions
- **`useNavigationWithLoader`** - Manual navigation wrapper
- **`usePageLoader`** - Handoff mechanism from navigation to page loaders

### C. Specialized Loader Hooks

- `useLogoutLoader()` - Logout-specific loader
- `useSubmissionLoader()` - Form submission loader
- `useProcessingLoader()` - Generic processing loader

### Implementation Pattern:

```
Global LoadingContext (state holder)
  ├── useLoading() [base hook]
  ├── useGlobalLoader() [main interface]
  ├── useNavigationProgress() [navigation detection]
  ├── useNavigationWithLoader() [manual nav wrapper]
  ├── usePageLoader() [handoff mechanism]
  └── Specialized hooks (logout, submission, processing)
```

---

## 2. Loader State Ownership

| **Loader Type**         | **State Location**                           | **Who Starts It**                                                                  | **Who Stops It**                                                  | **Unmounts During Navigation?**                         |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- |
| **Global Navigation**   | `LoadingContext` (Set-based tracking)        | `useNavigationProgress` auto-detection OR `useNavigationWithLoader.push/replace()` | `useNavigationProgress` pathname change detection + 200ms timeout | **NO** - intentionally persists across page transitions |
| **Page-Level (Logout)** | `LoadingContext` with ID="logout"            | `useHybridAuth.showLogoutLoader()` or `useLogout.handleLogout()`                   | `useLogout.finally()` block calls `hideLoading("logout")`         | **N/A** - redirects to homepage                         |
| **Form Submission**     | `LoadingContext` with ID="submission"        | Direct call to `showSubmittingLoader()`                                            | Manual `hideLoading("submission")`                                | **Possibly** - depends on form location                 |
| **API Call Processing** | `LoadingContext` with ID="processing"        | Direct call to `showProcessingLoader()`                                            | Manual `hideLoading("processing")`                                | **Possibly** - depends on component lifecycle           |
| **Component-Local**     | Component state (e.g., `OrdersLandingTable`) | Component state setter                                                             | Component state setter or effect cleanup                          | **YES** - component unmounts during navigation          |

### Critical Details:

**Navigation Loader:**

- **Starts:** On link click (via `useNavigationProgress` click detector) OR on `router.push/replace` call (via `useNavigationWithLoader`)
- **Stops:** After pathname change detected + 200ms delay (GET request completion detection)
- **State Structure:** `{ isLoading, message, loadingIds: Set }`
- **Concurrency:** Supports multiple parallel loaders via Set-based ID tracking

**Logout Loader:**

```tsx
// Start: showLogoutLoader() in useLogout hook
showLoading("Logging out...", "logout");

// Stop: In finally block
hideLoading("logout");
```

**Page Loader Handoff:**

- `usePageLoader()` immediately calls `hideLoading("navigation")` on mount
- This ensures the global navigation spinner hides when the page component mounts
- Allows page's local skeleton to show instead

---

## 3. Navigation Integration

### Route Transition Triggers:

| **Component**               | **Method**                     | **Loader Trigger**                         | **Scope**       |
| --------------------------- | ------------------------------ | ------------------------------------------ | --------------- |
| Next.js Links (UI)          | Click → Router.push()          | `useNavigationProgress` auto-detects click | Auto-detected   |
| `useNavigationWithLoader()` | Explicit `push()`/`replace()`  | Manual `startNavigation()` call            | Programmatic    |
| Brand Filter                | Click → `push(navigationPath)` | `useNavigationWithLoader` via `push()`     | Category filter |
| Cart Buttons                | Click → `push(path)`           | `useNavigationWithLoader` via `push()`     | Cart operations |
| Table Row Clicks            | Click → `push(detailsPath)`    | `useNavigationWithLoader` via `push()`     | Details pages   |
| Header Navigation           | Click → `push(path)`           | `useNavigationWithLoader` via `push()`     | App-wide nav    |

### Auto-Detection Mechanism:

```tsx
// useNavigationProgress sets up a global click listener (capture phase)
document.addEventListener("click", handleClick, true);

// On Next.js Link click:
// 1. Link element detected
// 2. href validated (internal only)
// 3. startNavigation() called BEFORE pathname changes
// 4. Router actually performs the navigation
// 5. Pathname changes in browser
// 6. useNavigationProgress detects change via usePathname() hook
// 7. Waits 200ms for GET request completion
// 8. Calls endNavigation() to hide loader
```

### Loader Lifecycle:

```
User clicks link
    ↓
useNavigationProgress detects click → startNavigation()
    ↓
Navigation starts in Next.js App Router
    ↓
Pathname changes (detected via usePathname hook)
    ↓
Wait 200ms (for GET request completion)
    ↓
endNavigation() → hideLoading("navigation")
    ↓
TopProgressBar and MainContentLoader respond to isLoading state change
    ↓
Page skeleton or real content shows
```

### Lifecycle Dependency:

- ✅ **Does NOT rely on component unmount** - uses pathname hook instead
- ✅ **Does NOT rely on component mount** - detection happens at router level
- ⚠️ **Potential Race Condition:** If component unmounts before `hideLoading()` executes, the loader could hang (mitigated by 30s safety timeout)

---

## 4. Global Loader Provider (If exists)

### Provider Setup:

**Location:** Multiple nested providers in `src/app/[locale]/(app)/layout.tsx`

**Nesting Structure:**

```tsx
// In (app) layout.tsx (line 91-105):
<LoadingProvider>
  <TopProgressBarProvider />
  <NavigationProgressProvider>
    <PrefetchMainRoutes />
    <CartProviderWrapper>
      <SidebarProviderWrapper>{/* App content */}</SidebarProviderWrapper>
    </CartProviderWrapper>
  </NavigationProgressProvider>
</LoadingProvider>
```

**Also in (auth) layout.tsx:**

```tsx
<LoadingProvider>{/* Auth content */}</LoadingProvider>
```

### Provider Responsibilities:

1. **LoadingProvider** (Global State)
   - Holds: `{ isLoading, message, loadingIds }`
   - Provides: `useLoading()` context hook
   - Location: Wraps app content in both (app) and (auth) layouts

2. **NavigationProgressProvider** (Navigation Detection)
   - Calls: `useNavigationProgress()` with autoDetect=true
   - Trigger: Detects all Next.js Link clicks globally
   - No children rendering - just hook side effects

3. **TopProgressBarProvider** (UI Component)
   - Renders: `<TopProgressBar />` component
   - Consumes: `useLoading()` context
   - Shows: Thin progress bar at top of page

### Potential Conflicts:

⚠️ **CONFLICT DETECTED:** Multiple LoadingProviders

- (app) layout has `LoadingProvider`
- (auth) layout has separate `LoadingProvider` instance
- **Issue:** Auth state and App state have different loaders
- **Impact:** Loader state NOT shared between auth and app sections
- **Workaround:** Each section manages its own loading independently

⚠️ **CONFLICT DETECTED:** `NavigationProgressProvider` instantiates its own `useNavigationProgress()`

- This hook calls `useLoading()` internally
- Creates a dependency loop where the provider uses its own provided hook
- **Works because:** React allows this pattern with providers instantiating hooks they provide
- **Potential Issue:** If `NavigationProgressProvider` unmounts, click detection stops

---

## 5. List All Components That Start Loaders

### A. Page Navigation Triggers (with `useNavigationWithLoader`)

| **Component**      | **File**                                                                                 | **Trigger**     | **Navigation Method**                |
| ------------------ | ---------------------------------------------------------------------------------------- | --------------- | ------------------------------------ |
| BrandFilter        | `components/CategoryFilters/filters/BrandFilter.tsx:22`                                  | Brand click     | `push(navigationPath)`               |
| AppHeader          | `components/AppHeader/app-header.tsx:45`                                                 | Nav click       | `router.push(path)`                  |
| CartProceedButton  | `components/cart/CartProceedButton.tsx:26`                                               | Checkout button | `router.push()`                      |
| QuotesLandingTable | `app/[locale]/(app)/landing/quoteslanding/.../QuotesLandingTable.tsx:43`                 | Row click       | `router = useNavigationWithLoader()` |
| OrdersLandingTable | `app/[locale]/(app)/landing/orderslanding/.../OrdersLandingTable.tsx:101`                | Row click       | `router = useNavigationWithLoader()` |
| QuoteDetailsClient | `app/[locale]/(app)/details/quoteDetails/[quoteId]/components/QuoteDetailsClient.tsx:78` | Navigation      | `push(path)`                         |
| OrderDetailsClient | `app/[locale]/(app)/details/orderDetails/[orderId]/components/OrderDetailsClient.tsx:82` | Navigation      | `push(path)`                         |
| OrderEditPage      | `app/[locale]/(app)/details/orderDetails/[orderId]/edit/page.tsx:114`                    | Navigation      | `push()`                             |
| QuoteEditPage      | `app/[locale]/(app)/details/quoteDetails/[quoteId]/edit/page.tsx:118`                    | Navigation      | `push()`                             |

### B. Auto-Detected Navigation (Click Detection)

**All Next.js Link clicks** via `useNavigationProgress` auto-detection:

- Scans all document clicks (capture phase)
- Detects `<a>` elements with `href` attribute
- Validates internal links (starts with `/`)
- Ignores external, mailto, tel, etc.

### C. Global/Logout Triggers

| **Component** | **File**                              | **Trigger**         | **Type**                              |
| ------------- | ------------------------------------- | ------------------- | ------------------------------------- |
| useLogout     | `hooks/Auth/useLogout.tsx:12`         | Logout button click | `showLogoutLoader()`                  |
| useHybridAuth | `hooks/useHybridAuth.ts:91`           | Auth state change   | `showLogoutLoader()`                  |
| AuthAwareNav  | `components/auth/AuthAwareNav.tsx:35` | Logout handler      | `showLogoutLoader()`, `hideLoading()` |

### D. API Call & Form Triggers

| **Component**      | **File**                                                                                 | **Trigger**     | **Type**                               |
| ------------------ | ---------------------------------------------------------------------------------------- | --------------- | -------------------------------------- |
| OrderDetailsClient | `app/[locale]/(app)/details/orderDetails/[orderId]/components/OrderDetailsClient.tsx:95` | API calls       | `showLoading()`, `hideLoading()`       |
| LoginPage          | `app/[locale]/(auth)/login/page.tsx:66`                                                  | Form submission | `showLoading()`, `hideLoading()`       |
| Custom Components  | Various                                                                                  | Manual control  | Direct `showLoading/hideLoading` calls |

### E. Page-Level Loaders (Hidden)

| **Component**      | **File**                            | **Purpose**                           |
| ------------------ | ----------------------------------- | ------------------------------------- |
| usePageLoader      | `hooks/usePageLoader.ts`            | Hides navigation loader on page mount |
| OrdersLandingTable | `OrdersLandingTable.tsx:98`         | Calls `usePageLoader()`               |
| OrderDetailsClient | `OrderDetailsClient.tsx` (implicit) | Calls `usePageLoader()`               |

---

## 6. Loader UI Types

| **UI Type**                   | **Component**           | **Location**                                    | **Trigger**                         | **Behavior**                                |
| ----------------------------- | ----------------------- | ----------------------------------------------- | ----------------------------------- | ------------------------------------------- |
| **Top Progress Bar**          | `TopProgressBar`        | `components/ui/top-progress-bar.tsx`            | During navigation/loading           | Thin animated bar at top (0-100%)           |
| **Full-Screen Modal**         | `GlobalLoader` (custom) | `components/custom/global-loader.tsx`           | Manual show (logout, processing)    | Fixed overlay with spinner + message        |
| **Inline Page Skeleton**      | `PageLoader`            | `components/Loaders/PageLoader/page-loader.tsx` | After navigation, during page mount | Center-aligned spinner with text            |
| **Main Content Loader**       | `MainContentLoader`     | `components/custom/MainContentLoader.tsx`       | During page loading                 | Fixed loader below header, respects sidebar |
| **Inline Component Spinners** | Component-specific      | Various                                         | Table loading, form submission      | Small spinner animations                    |

### UI Hierarchy:

```
1. TopProgressBar (ALWAYS first - shows during navigation start)
   ├─ Shows immediately on link click
   ├─ Thin 3px bar at top
   └─ Hidden when navigation completes

2. MainContentLoader (shows during page transition)
   ├─ Shows after pathname change
   ├─ Full-page skeleton below header
   └─ Hides when page content loads

3. GlobalLoader (manual full-screen)
   ├─ Shows for logout, processing
   ├─ Modal overlay with backdrop
   └─ Hidden manually via hideLoading()

4. PageLoader (Skeleton/inline spinners)
   ├─ Component-specific loaders
   ├─ Conditional rendering inside components
   └─ Controlled by component state
```

---

## 7. Current Pain Points / Bugs

### ⚠️ POTENTIAL ISSUE 1: Zombie Navigation Loader

- **Scenario:** Component unmounts during navigation before `hideLoading("navigation")` executes
- **Example:** OrdersLandingTable navigates to OrderDetailsClient, but old table component unmounts
- **Risk Level:** LOW (mitigated by 30s safety timeout)
- **Mitigation in Place:**
  ```tsx
  // 30s safety timeout in useNavigationProgress
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isNavigatingRef.current && mountedRef.current) {
        endNavigation("safety_timeout");
      }
    }, timeoutMs * 2) as any;
  }, [autoDetect, timeoutMs, endNavigation]);
  ```

### ⚠️ POTENTIAL ISSUE 2: Loader Double-Start

- **Scenario:** `useNavigationProgress` click detection AND `useNavigationWithLoader.push()` both call `startNavigation()`
- **Example:** Link click detected → `startNavigation()`, then component calls `router.push()` → `startNavigation()` again
- **Current Behavior:** `isNavigatingRef.current` check prevents duplicate starts
  ```tsx
  if (isNavigatingRef.current || !mountedRef.current) return;
  ```
- **Risk Level:** LOW - protected by ref check

### ⚠️ POTENTIAL ISSUE 3: Loader State Desynchronization Between (app) and (auth)

- **Scenario:** User logs out → redirects from (app) to (auth)
- **Root Cause:** Separate `LoadingProvider` instances in each layout
- **Impact:** Logout loader state in (app) doesn't communicate with (auth) loader
- **Workaround:** Works because logout redirects to homepage, clearing all state
- **Risk Level:** MEDIUM - could cause issues if conditional rendering between sections

### ✅ RESOLVED ISSUE 4: Page Loader Flashing

- **Previous Issue:** Navigation spinner visible even when page has skeleton
- **Current Solution:** `usePageLoader()` hook hides navigation loader on component mount
- **Implementation:** `hideLoading("navigation")` called immediately in useEffect
- **Result:** Smooth transition from top progress bar → page skeleton

### ⚠️ POTENTIAL ISSUE 5: Navigation Timeout Too Short

- **Current Value:** 200ms after pathname change before hiding loader
- **Scenario:** Slow network or large page bundle takes >200ms to parse
- **Risk:** Loader hides but page still rendering (appears broken)
- **Compensation:** `MainContentLoader` provides visual feedback during render

### ⚠️ POTENTIAL ISSUE 6: Multiple Concurrent Loaders Confusion

- **Scenario:** Logout starts (`id="logout"`) while navigation also starts (`id="navigation"`)
- **Current Behavior:**
  ```tsx
  const hideLoading = useCallback((loadingId = "default") => {
    setState(prev => {
      const newLoadingIds = new Set(prev.loadingIds);
      newLoadingIds.delete(loadingId);
      return {
        ...prev,
        isLoading: newLoadingIds.size > 0, // Loader stays visible if ANY id exists
        loadingIds: newLoadingIds,
      };
    });
  }, []);
  ```
- **Risk:** Navigation hides but logout is still running → no feedback
- **Risk Level:** MEDIUM - could confuse users if logout is slow

### ⚠️ POTENTIAL ISSUE 7: usePageLoader() Relies on Component Mount

- **Scenario:** Page component never mounts (error during render)
- **Impact:** Navigation loader stays visible forever
- **Mitigation:** 30s timeout eventually hides it
- **Risk Level:** LOW

---

## 8. Current Routing Structure

### Layout Hierarchy:

```
app/
├── layout.tsx (Root)
│   └── QueryProvider
│       └── ErrorBoundary
│
├── [locale]/
│   ├── (app)/
│   │   └── layout.tsx (APP LAYOUT)
│   │       ├── LoadingProvider ✅
│   │       ├── LayoutDataLoader (Server: fetches tenant, user, auth)
│   │       ├── TopProgressBarProvider ✅
│   │       ├── NavigationProgressProvider ✅
│   │       ├── CartProviderWrapper
│   │       ├── SidebarProviderWrapper
│   │       └── AppSidebar (Persistent)
│   │
│   │   ├── landing/
│   │   │   ├── orderslanding/
│   │   │   │   └── OrdersLandingTable (uses usePageLoader, useNavigationWithLoader)
│   │   │   └── quoteslanding/
│   │   │       └── QuotesLandingTable (uses usePageLoader, useNavigationWithLoader)
│   │   │
│   │   └── details/
│   │       ├── orderDetails/[orderId]/
│   │       │   ├── page.tsx (RSC)
│   │       │   └── components/OrderDetailsClient.tsx (uses usePageLoader, useNavigationWithLoader)
│   │       └── quoteDetails/[quoteId]/
│   │           ├── page.tsx (RSC)
│   │           └── components/QuoteDetailsClient.tsx (uses usePageLoader, useNavigationWithLoader)
│   │
│   └── (auth)/
│       └── layout.tsx (AUTH LAYOUT)
│           ├── LoadingProvider ✅ (Separate instance)
│           ├── TopProgressBarProvider
│           ├── NavigationProgressProvider
│           └── Pages: login, signup, etc.
```

### Persistence Across Navigation:

| **Component**           | **Scope**        | **Persists?** | **Details**                                        |
| ----------------------- | ---------------- | ------------- | -------------------------------------------------- |
| **AppSidebar**          | (app) layout     | ✅ YES        | Entire sidebar persists; only content area changes |
| **SidebarProvider**     | (app) layout     | ✅ YES        | State persists (expanded/collapsed)                |
| **CartProviderWrapper** | (app) layout     | ✅ YES        | Cart state persists across all (app) pages         |
| **Header/Navigation**   | LayoutWithHeader | ✅ YES        | Header persists, only content below changes        |
| **LoadingProvider**     | (app) layout     | ✅ YES        | Loading state persists for all (app) pages         |

### Page-Level Mounting/Unmounting:

| **Page Transition**                        | **Components Unmount**         | **Time**                   |
| ------------------------------------------ | ------------------------------ | -------------------------- |
| Landing → OrderDetails                     | OrdersLandingTable             | Instant on pathname change |
| OrderDetails → OrderDetails (different ID) | OrderDetailsClient             | Instant on pathname change |
| (app) → (auth) (logout)                    | Entire (app) tree + AppSidebar | Instant on redirectTo("/") |
| Filter Click (BrandFilter)                 | Current page tree              | Instant on navigation      |

### Data Loading:

- **Server-Side:** `LayoutDataLoader` fetches tenant, user, auth (cached per request)
- **Client-Side:** `React Query` handles detail pages, orders, quotes
- **Hydration:** Pages hydrate with server data, then client-side data fetching begins

---

## 9. State Management Tools

### Identified State Management:

| **Tool**              | **Purpose**               | **Location**                                          | **Scope**       | **Loader Interaction**                                |
| --------------------- | ------------------------- | ----------------------------------------------------- | --------------- | ----------------------------------------------------- |
| **React Context API** | Global loading state      | `useGlobalLoader.tsx`                                 | All pages       | **DIRECT** - loaders depend on this                   |
| **React Query**       | API cache & data fetching | `@tanstack/react-query`                               | Components      | **INDIRECT** - components show loaders during queries |
| **Zustand**           | App configuration/tenant  | `store/useTenantStore.ts`, `store/useProductStore.ts` | All pages       | NONE - independent                                    |
| **React Local State** | Component UI state        | Individual components                                 | Component level | **INDEPENDENT** - local spinners                      |
| **URL State**         | Navigation/Filtering      | URL query params                                      | Page level      | **Via useRouter**                                     |
| **Server State**      | Auth/User/Tenant          | `LayoutDataLoader` (SSR)                              | Page level      | Via context after SSR                                 |

### Context API Deep Dive:

```tsx
// LoadingContext structure
interface LoadingContextType {
  isLoading: boolean; // Any loader active?
  message: string; // Current message
  loadingIds: Set<string>; // Concurrent loader tracking
  showLoading: (msg?, id?) => void; // Start loader
  hideLoading: (id?) => void; // Stop loader
  updateMessage: (msg: string) => void; // Update message
  showLogoutLoader: () => void; // Preset: logout
  showProcessingLoader: () => void; // Preset: processing
  showSubmittingLoader: () => void; // Preset: form submit
}
```

### Zustand Store Usage:

```tsx
// useTenantStore - Configuration management
export const useTenantStore = create<TenantStore>()(
  persist(
    set => ({
      tenantData: null,
      loading: false,
      setTenantData: data => set({ tenantData: data }),
    }),
    { name: "tenant-storage" }
  )
);
```

### React Query Usage:

```tsx
// Example: OrderDetailsClient
const { data: orderDetails, isLoading } = useQuery({
  queryKey: ["orderDetails", orderId],
  queryFn: async () => OrderDetailsService.fetchOrderDetails(...),
  staleTime: 5 * 60 * 1000,
});

// Local isLoading state controls Skeleton component
// Global loader stays independent
```

### State Management Interaction Map:

```
Navigation Triggered
  ↓
useNavigationProgress (click detection)
  ↓
useLoading() → showLoading() [Context API]
  ↓
Global state updates
  ↓
TopProgressBar + MainContentLoader re-render
  ↓
Page component mounts
  ↓
usePageLoader() → hideLoading()
  ↓
React Query queries begin (independent)
  ↓
Component-level loaders show during query
  ↓
Query completes → component shows data
```

---

## 10. Anything Else Relevant for Hybrid Loader Migration

### A. Race Conditions

1. **Click During Navigation**
   - **Scenario:** User clicks another link while loader is already showing
   - **Current:** Debounce (200ms) prevents duplicate navigation
   - **Risk:** LOW

   ```tsx
   const now = Date.now();
   if (now - lastClickTimeRef.current < 200) return; // Prevent duplicates
   ```

2. **Logout While Navigating**
   - **Scenario:** User clicks logout while page is loading
   - **Current:** Logout starts its own loader with ID="logout"; navigation ID="navigation"
   - **Potential Issue:** Two loaders show different messages; hard to know which is which
   - **Risk:** MEDIUM

3. **API Call During Navigation**
   - **Scenario:** Page API call starts just as navigation completes
   - **Current:** They're independent - navigation loader hides, API loader shows
   - **User Experience:** Works fine - smooth transition
   - **Risk:** LOW

### B. Multiple Parallel Loaders

**Current Implementation:**

```tsx
// Multiple loaders tracked via Set<string>
loadingIds: new Set([...prev.loadingIds, loadingId]);

// isLoading true if ANY loader active
isLoading: newLoadingIds.size > 0;
```

**Scenarios:**

- Navigation (`id="navigation"`) + Logout (`id="logout"`) → Both show simultaneously
- Navigation + Form submission (`id="submission"`) → Both tracked
- Multiple API calls with same ID → Overwrite previous

**UI Consequence:**

- Only ONE message shown (`message` state singular)
- Message from last `showLoading()` call wins
- No priority system for concurrent loaders

### C. API Fetching Strategy

**Server-Side (RSC):**

- `LayoutDataLoader` uses React `cache()` for deduplication
- Fetches: Auth token, User data, Tenant data (parallelized)
- No loading UI - happens during SSR

**Client-Side (CSR):**

- `React Query` manages all client data fetching
- Orders, Quotes, Details pages use `useQuery`
- Local component state for loading UI
- Independent from global navigation loader

**No Built-In Debouncing/Request Deduplication:**

- `useRequestDeduplication` hook exists (in some components)
- Only used in `OrdersLandingTable` to prevent duplicate API calls
- Not global - component-level only

### D. Suspense Boundaries

**Current Usage:**

- `Suspense` used in `LayoutDataLoader` and some layout components
- NOT used for route-level code splitting
- Manual `loading.tsx` files NOT implemented (would create separate skeleton)

**Potential for Hybrid Arch:**

- Route-level `loading.tsx` files could replace some manual loaders
- Suspense boundaries could replace React Query loading states
- Not currently leveraged

### E. RSC vs Client Components

**RSC (Server Components):**

- `LayoutDataLoader` - Fetches initial data
- `page.tsx` files - Order/Quote detail pages (RSC wrapper)
- Renders quickly, passes data to client

**Client Components:**

- `OrderDetailsClient.tsx`, `QuoteDetailsClient.tsx`
- All loaders (useNavigationProgress, useGlobalLoader, etc.)
- All hooks and interactivity

**Loader Implication:**

- Loaders only work in Client Components
- RSCs can't directly trigger loaders
- Must pass `initialData` to clients via props

### F. Server Actions Impacting Loader Timing

**Not Explicitly Found:** No Server Actions currently in codebase

- All mutations appear to use `fetch()` or API services
- No "use server" directives detected

**Potential Future Issue:**

- If Server Actions added, they could have different loading timing
- Server Actions might not trigger `useNavigationProgress`
- Would need explicit loader management

### G. Bundle Size & Code Splitting

**Loader-Related Imports:**

- `useGlobalLoader` - ~2KB
- `useNavigationProgress` - ~3KB
- `useNavigationWithLoader` - ~1KB
- Total: ~6KB for all loader logic

**No Dynamic Imports:**

- All loaders eagerly loaded
- Could be optimized with lazy loading (low priority)

### H. Potential Zombie/Stuck States

**Timeouts in Place:**

1. 200ms after pathname change → Hide navigation loader
2. 30s max navigation time → Safety timeout
3. Component-level: Manual cleanup in effects

**Unprotected Scenarios:**

- If component unmounts during `hideLoading()` execution (race condition)
- If `showLoading()` called but component redirects before `hideLoading()`
- If API fails and component error boundary catches it

### I. Hydration Issues

**Current:**

- TopProgressBar + MainContentLoader are client-only
- No server-side skeleton rendering
- Instant client hydration ensures loader appears quickly

**Risk:**

- Hydration mismatch possible if loading state inconsistent
- Currently mitigated: LoadingProvider state initialized to `false`

### J. Locale/i18n Integration

**Loader Messages:**

```tsx
showLoading("Loading page..."); // Hard-coded English
showLoading("Logging out..."); // Hard-coded English
```

**Not Internationalized:**

- All loader messages are hard-coded
- No translation keys used
- Should use `useTranslations()` hook for i18n

### K. Accessibility Considerations

**Current ARIA Labels:**

```tsx
// TopProgressBar has:
// - No ARIA (just display: none when not visible)

// GlobalLoader has:
// - role="dialog"
// - aria-modal="true"
// - aria-label={message || "Loading"}

// PageLoader has:
// - role="status" for spinner
// - aria-label="Loading spinner"
```

**Missing:**

- Live regions for message updates
- Screen reader announcements for loader state changes

---

## SUMMARY TABLE: Component Usage Map

```
┌─────────────────────┬──────────────────────┬──────────────┬───────────────┐
│ Component           │ Loader Hooks Used    │ Start Method │ Auto/Manual   │
├─────────────────────┼──────────────────────┼──────────────┼───────────────┤
│ BrandFilter         │ useNavigationWithLoader  │ push()   │ Manual        │
│ AppHeader           │ useNavigationWithLoader  │ push()   │ Manual        │
│ CartProceedButton   │ useNavigationWithLoader  │ push()   │ Manual        │
│ OrdersLandingTable  │ usePageLoader +         │ Manual + │ Hybrid        │
│                     │   useNavigationWithLoader   Auto    │               │
│ OrderDetailsClient  │ useLoading             │ Manual   │ Manual        │
│ LoginPage           │ useGlobalLoader        │ Manual   │ Manual        │
│ useLogout           │ useGlobalLoader        │ Manual   │ Manual        │
│ TopProgressBar      │ useLoading             │ Auto     │ Auto          │
│ MainContentLoader   │ useLoading             │ Auto     │ Auto          │
│ (any page)          │ useNavigationProgress  │ Auto     │ Auto          │
└─────────────────────┴──────────────────────┴──────────────┴───────────────┘
```

---

## FINAL ASSESSMENT

### Current System Characteristics:

- ✅ **Centralized state** via React Context
- ✅ **Auto-detection** of navigation events
- ✅ **Multi-instance support** via Set-based tracking
- ✅ **Multiple UI types** for different scenarios
- ⚠️ **Potential conflicts** between separate (app)/(auth) loaders
- ⚠️ **No message prioritization** for concurrent loaders
- ⚠️ **Hard-coded messages** (no i18n)
- ⚠️ **Limited safety against zombie states** (relies on timeouts)

### Ready for Hybrid Architecture Migration:

Your system is **well-structured** for migration to Hybrid Loader Architecture:

- Clear separation of concerns (navigation vs. page vs. action)
- Existing handoff mechanism (`usePageLoader`)
- Modular loader hooks ready for decomposition
- Multiple concurrent loader support already implemented

---

## Recommendations for Migration Planning

### Phase 1: Preparation

1. Consolidate LoadingProvider to single instance (merge (app) and (auth))
2. Add message prioritization system for concurrent loaders
3. Implement i18n for loader messages
4. Add live region announcements for a11y

### Phase 2: Architecture Refactor

1. Split into Global Route Loader (handles navigation)
2. Create Local Component Loader abstraction
3. Establish clear handoff points between loaders
4. Implement lazy loading for loader utilities

### Phase 3: Implementation & Testing

1. Migrate navigation detection to new architecture
2. Update all component loaders to new system
3. Test race conditions and edge cases
4. Monitor bundle size impact

---

**Document Generated:** December 1, 2025  
**Analysis Scope:** Complete loader system (10 analysis areas)  
**Status:** Ready for AI-driven migration planning
