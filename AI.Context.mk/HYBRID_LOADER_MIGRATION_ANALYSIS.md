# Hybrid Loader Architecture Migration - Real Code Analysis

**Generated:** December 1, 2025  
**Repository:** nextjs-ecommerce  
**Branch:** refactor/51

---

## 1. 🌐 GLOBAL LOADER CURRENT BEHAVIOR

### Where showLoading() gets called for navigation events:

**Primary Navigation Triggers:**

```tsx
// File: src/hooks/useNavigationProgress.ts:114
showLoading(message || "Loading...", loadingId);

// File: src/hooks/useNavigationWithLoader.ts:65
startNavigation("Loading page...");

// File: src/hooks/useNavigationWithLoader.ts:114
startNavigation("Loading page...");
```

**Auto-Detection Mechanism:**

- `useNavigationProgress` sets up global click listener (capture phase)
- Detects Next.js Link clicks and calls `showLoading("Loading...", "navigation")`
- `useNavigationWithLoader` manually calls `startNavigation()` which internally calls `showLoading()`

### Where hideLoading("navigation") gets called:

**Primary Hide Triggers:**

```tsx
// File: src/hooks/usePageLoader.ts:23
hideLoading("navigation");

// File: src/hooks/useNavigationProgress.ts:97
hideLoading(loadingId); // where loadingId = "navigation"
```

**Hide Mechanism:**

- `usePageLoader()` immediately hides navigation loader on component mount
- `useNavigationProgress` hides after pathname change + 200ms timeout
- Safety timeout after 30 seconds

### Global Loader UI Components and LoadingContext Usage:

| **Component**         | **File**                                        | **Uses Same Context?** | **Purpose**                         |
| --------------------- | ----------------------------------------------- | ---------------------- | ----------------------------------- |
| **TopProgressBar**    | `src/components/ui/top-progress-bar.tsx:53`     | ✅ YES                 | Thin animated bar at top            |
| **MainContentLoader** | `src/components/custom/MainContentLoader.tsx:9` | ✅ YES                 | Full-page skeleton below header     |
| **GlobalLoader**      | `src/components/custom/global-loader.tsx`       | ❌ NO                  | Manual modal loader (not connected) |

**Context Usage:**

- All use `const { isLoading, message } = useLoading()`
- Single `LoadingProvider` instance per layout section
- Set-based tracking: `loadingIds: Set<string>`

---

## 2. 📦 PLACES THAT MUST SWITCH TO GLOBAL ROUTE LOADER

### Components Currently Using useNavigationWithLoader():

| **Component**          | **File:Line**                                                         | **Why It Starts Loader** | **Should Use Global?**       |
| ---------------------- | --------------------------------------------------------------------- | ------------------------ | ---------------------------- |
| **BrandFilter**        | `CategoryFilters/filters/BrandFilter.tsx:22`                          | Navigate to brand page   | ✅ YES - Route navigation    |
| **AppHeader**          | `AppHeader/app-header.tsx:45`                                         | Nav menu clicks          | ✅ YES - App-wide navigation |
| **CartProceedButton**  | `cart/CartProceedButton.tsx:26`                                       | Checkout flow navigation | ✅ YES - Route navigation    |
| **QuotesLandingTable** | `landing/quoteslanding/.../QuotesLandingTable.tsx:43`                 | Row click → details      | ✅ YES - Route navigation    |
| **OrdersLandingTable** | `landing/orderslanding/.../OrdersLandingTable.tsx:101`                | Row click → details      | ✅ YES - Route navigation    |
| **QuoteDetailsClient** | `details/quoteDetails/[quoteId]/components/QuoteDetailsClient.tsx:78` | Navigate to edit page    | ✅ YES - Route navigation    |
| **OrderDetailsClient** | `details/orderDetails/[orderId]/components/OrderDetailsClient.tsx:82` | Navigate to edit page    | ✅ YES - Route navigation    |
| **OrderEditPage**      | `details/orderDetails/[orderId]/edit/page.tsx:114`                    | Navigate after save      | ✅ YES - Route navigation    |
| **QuoteEditPage**      | `details/quoteDetails/[quoteId]/edit/page.tsx:118`                    | Navigate after save      | ✅ YES - Route navigation    |
| **CartPageClient**     | `cart/components/CartPageClient.tsx:32`                               | Cart navigation          | ✅ YES - Route navigation    |

### Components Currently Using startNavigation():

**Direct calls found in:**

- `NavigationLoadingProvider.tsx:33` - Should be removed (duplicate detection)
- All `useNavigationWithLoader()` calls above

### Migration Action Required:

**All these components should:**

1. ❌ **STOP** manually starting loaders for route navigation
2. ✅ **RELY** on Global Route Loader to detect navigation automatically
3. ✅ **KEEP** using `useRouter()` directly instead of `useNavigationWithLoader()`

---

## 3. 🏠 LOCAL LOADER SCOPE AUDIT

### Loaders That SHOULD Remain Local:

| **Category**        | **Component**                          | **File:Line**                                             | **Current State**                  | **Migration Action**           |
| ------------------- | -------------------------------------- | --------------------------------------------------------- | ---------------------------------- | ------------------------------ |
| **Form Submission** | LoginPage                              | `(auth)/login/page.tsx:117`                               | ✅ Component state                 | Keep local                     |
| **API Processing**  | OrderDetailsClient                     | `orderDetails/.../OrderDetailsClient.tsx:247,289,331,497` | ✅ Global context with specific ID | Keep as local component loader |
| **Logout Action**   | useLogout                              | `hooks/Auth/useLogout.tsx:12,42`                          | ✅ Global context with "logout" ID | Keep as specialized loader     |
| **Button Spinners** | Various components                     | Throughout app                                            | ✅ Component state                 | Keep local                     |
| **Table Loading**   | OrdersLandingTable, QuotesLandingTable | Component level                                           | ✅ Component state                 | Keep local                     |

### State Ownership Analysis:

**Form Submission Loaders:**

- **Where:** Component state (`useState`)
- **Breaking Risk:** ❌ LOW - Independent of navigation
- **Global Dependency:** ❌ NONE

**API Call Loaders:**

- **Where:** Global context with specific IDs ("order-details-page")
- **Breaking Risk:** ⚠️ MEDIUM - If component unmounts during API call
- **Global Dependency:** ✅ YES - Uses same LoadingProvider

**Logout Loader:**

- **Where:** Global context with "logout" ID
- **Breaking Risk:** ❌ LOW - Redirects immediately
- **Global Dependency:** ✅ YES - Uses global showLogoutLoader()

---

## 4. 🔄 HANDOFF MECHANISMS

### usePageLoader() Analysis:

```tsx
// File: src/hooks/usePageLoader.ts
export function usePageLoader() {
  const { hideLoading } = useLoading();

  useEffect(() => {
    hideLoading("navigation"); // Hides global navigation loader
  }, [hideLoading]);
}
```

**Current Function:**

- Immediately hides navigation loader when page component mounts
- Enables handoff from global spinner to page skeleton

**Migration Assessment:**

- ✅ **Keep:** Handoff mechanism still needed
- ✅ **Belongs to:** Local Component Loaders
- ⚠️ **Issue:** Relies on component mount - could fail if component errors

### useNavigationProgress() Analysis:

```tsx
// File: src/hooks/useNavigationProgress.ts:105-125
const startNavigation = useCallback(
  (message?: string) => {
    if (isNavigatingRef.current || !mountedRef.current) return;

    isNavigatingRef.current = true;
    startTimeRef.current = Date.now();

    if (!prefersReducedMotion && autoDetect) {
      showLoading(message || "Loading...", loadingId); // loadingId = "navigation"
    }

    clearNavigationTimeout();
    timeoutRef.current = setTimeout(() => {
      endNavigation("timeout");
    }, timeoutMs) as any;
  },
  [
    /* deps */
  ]
);
```

**Current Function:**

- Auto-detects navigation clicks
- Shows/hides global navigation loader
- Pathname change detection with 200ms timeout

**Migration Assessment:**

- ✅ **Belongs to:** Global Route Loader
- ✅ **Keep:** Click detection logic
- ❌ **Remove:** Manual `startNavigation()` exposure
- ✅ **Keep:** Pathname change detection

### useNavigationWithLoader() Analysis:

```tsx
// File: src/hooks/useNavigationWithLoader.ts:65
startNavigation("Loading page...");
```

**Current Function:**

- Wraps router navigation with loader display
- Calls `startNavigation()` manually for programmatic navigation

**Migration Assessment:**

- ❌ **Delete Entirely:** Should be replaced by auto-detection
- ❌ **Remove:** All manual loader triggering
- ✅ **Replace with:** Standard `useRouter()` calls

---

## 5. ⚠️ ALL POTENTIAL BREAKING POINTS

### 1. Multiple LoadingProvider Instances

**Location:**

- `src/app/[locale]/(app)/layout.tsx:91` - App layout LoadingProvider
- `src/app/[locale]/(auth)/layout.tsx:57` - Auth layout LoadingProvider

**Issue:** Separate loader states between app and auth sections
**Migration Risk:** 🔴 **HIGH** - Logout from app won't show loader in auth
**Fix Required:** Consolidate to single provider at root level

### 2. Components Unmounting Before hideLoading()

**Locations:**

- `OrdersLandingTable.tsx:101` → navigates → component unmounts
- `QuotesLandingTable.tsx:43` → navigates → component unmounts
- All detail page components navigating away

**Issue:** Navigation loader could hang if component unmounts before `hideLoading("navigation")`
**Migration Risk:** ⚠️ **MEDIUM** - Mitigated by 30s timeout
**Current Mitigation:** Safety timeout in `useNavigationProgress.ts:293`

### 3. Parallel Loaders ID Collision

**Location:** `src/hooks/useGlobalLoader.tsx:28-45`

```tsx
const showLoading = useCallback(
  (message = "Loading...", loadingId = "default") => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      message, // ⚠️ Last message overwrites previous
      loadingIds: new Set([...prev.loadingIds, loadingId]),
    }));
  },
  []
);
```

**Issue:** Multiple loaders with same message override each other
**Migration Risk:** ⚠️ **MEDIUM** - Confusing UX when navigation + logout run together
**Fix Required:** Message prioritization system

### 4. NavigationProgressProvider Self-Dependency

**Location:** `src/components/providers/NavigationProgressProvider.tsx:18`

```tsx
export function NavigationProgressProvider({ children }) {
  useNavigationProgress({
    autoDetect: true,
    delayMs: 0,
  });
  return <>{children}</>;
}
```

**Issue:** Provider instantiates hook that depends on same provider's context
**Migration Risk:** ⚠️ **MEDIUM** - Works but creates circular dependency
**Fix Required:** Move hook instantiation outside provider

### 5. Suspense Boundary Conflicts

**Location:** No explicit Suspense boundaries for loaders found
**Issue:** React Query + navigation loaders could conflict with future Suspense usage
**Migration Risk:** ❌ **LOW** - Not currently used
**Watch:** Future Suspense implementation

### 6. React Query + Loader Conflicts

**Location:** All detail pages use React Query independently
**Issue:** Navigation loader hides while React Query still loading
**Migration Risk:** ❌ **LOW** - Intended behavior (handoff to page skeletons)
**Current Behavior:** Works as designed

### 7. Timeout Masking Real Problems

**Location:** `src/hooks/useNavigationProgress.ts:116-120`

```tsx
timeoutRef.current = setTimeout(() => {
  endNavigation("timeout");
}, timeoutMs) as any; // 30 seconds
```

**Issue:** 30s timeout hides real navigation failures
**Migration Risk:** ⚠️ **MEDIUM** - Could mask bundle loading failures
**Fix Required:** Error boundary integration + timeout reporting

---

## 6. 🎨 FULL LIST OF LOADER UI TYPES WE MUST PRESERVE

### Currently Implemented Loader UIs:

| **UI Component**       | **File**                             | **Purpose**                 | **Global/Local** | **Migration Status**        |
| ---------------------- | ------------------------------------ | --------------------------- | ---------------- | --------------------------- |
| **TopProgressBar**     | `ui/top-progress-bar.tsx`            | Thin animated bar at top    | Global           | ✅ Keep unchanged           |
| **MainContentLoader**  | `custom/MainContentLoader.tsx`       | Full-page skeleton          | Global           | ✅ Keep unchanged           |
| **PageLoader**         | `Loaders/PageLoader/page-loader.tsx` | Center spinner with message | Local            | ✅ Keep unchanged           |
| **GlobalLoader**       | `custom/global-loader.tsx`           | Modal overlay spinner       | Manual           | ⚠️ Not connected to context |
| **Component Spinners** | Various                              | Inline loading states       | Local            | ✅ Keep unchanged           |

### UI Behavior Mapping:

**Navigation Flow:**

1. **TopProgressBar** → Shows immediately on navigation start
2. **MainContentLoader** → Shows after pathname change
3. **PageLoader/Skeleton** → Shows when page component mounts
4. **Real Content** → Shows when data loads

**Manual Actions:**

- **GlobalLoader** → Used for logout, processing (if connected)
- **Button spinners** → Form submission, API calls

### Accessibility Status:

| **Component**     | **ARIA Labels**                         | **Role**                | **Live Region** |
| ----------------- | --------------------------------------- | ----------------------- | --------------- |
| TopProgressBar    | ✅ `aria-label="Page loading progress"` | ✅ `role="progressbar"` | ❌ Missing      |
| MainContentLoader | ✅ Uses PageLoader labels               | Inherited               | ❌ Missing      |
| PageLoader        | ✅ `aria-label="Loading spinner"`       | ✅ `role="status"`      | ❌ Missing      |
| GlobalLoader      | ✅ `aria-label={message}`               | ✅ `role="dialog"`      | ❌ Missing      |

---

## 7. 🧭 ROUTING BEHAVIOR MAPPING

### Pages That Unmount Immediately:

| **Transition Type** | **Unmounts**                               | **Timing** | **Loader Impact**               |
| ------------------- | ------------------------------------------ | ---------- | ------------------------------- |
| Landing → Details   | `OrdersLandingTable`, `QuotesLandingTable` | Instant    | ⚠️ Could hang navigation loader |
| Details → Edit      | `OrderDetailsClient`, `QuoteDetailsClient` | Instant    | ⚠️ Could hang navigation loader |
| Edit → Details      | Edit page components                       | Instant    | ⚠️ Could hang navigation loader |
| App → Auth (logout) | Entire app tree                            | Instant    | ⚠️ Separate LoadingProvider     |

### Layouts That Remain Persistent:

| **Component**    | **Scope**    | **Persists Across**           |
| ---------------- | ------------ | ----------------------------- |
| AppSidebar       | (app) layout | ✅ All (app) pages            |
| LayoutWithHeader | (app) layout | ✅ All (app) pages            |
| LoadingProvider  | Both layouts | ✅ Within each layout section |

### Pages That Hydrate Slowest:

Based on code analysis:

1. **OrderDetails** - Complex React Query dependencies
2. **QuoteDetails** - Complex React Query dependencies
3. **Landing Tables** - Large data sets with filtering

### usePathname() Usage for Navigation Detection:

**Location:** `src/hooks/useNavigationProgress.ts:53`

```tsx
const pathname = usePathname();
```

**Usage:** Detects pathname changes to trigger loader hide
**Migration:** ✅ Keep - Essential for route change detection

---

## 8. 🛠️ TECHNICAL DEBT TO FIX BEFORE MIGRATION

### Hardcoded Loader Messages:

```tsx
// File: src/hooks/useNavigationProgress.ts:114
showLoading(message || "Loading...", loadingId); // ❌ English hardcoded

// File: src/hooks/useGlobalLoader.tsx:58,62,66
showLoading("Logging out...", "logout"); // ❌ English hardcoded
showLoading("Processing...", "processing"); // ❌ English hardcoded
showLoading("Submitting...", "submission"); // ❌ English hardcoded

// File: src/hooks/useNavigationWithLoader.ts:65,114
startNavigation("Loading page..."); // ❌ English hardcoded
```

**Fix Required:** Use `useTranslations()` hook

```tsx
const t = useTranslations("loaders");
showLoading(t("navigation"), "navigation");
```

### Missing ARIA / Accessibility:

**Current Issues:**

- ❌ No live region announcements for loader state changes
- ❌ No screen reader feedback when loaders start/stop
- ❌ GlobalLoader not connected to global context

**Fix Required:**

```tsx
// Add live region for announcements
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading ? message : ""}
</div>
```

### Anti-Patterns Found:

**1. Provider Creating Hook Dependency (NavigationProgressProvider)**

```tsx
// ANTI-PATTERN: Provider uses hook that depends on itself
export function NavigationProgressProvider({ children }) {
  useNavigationProgress(); // This uses useLoading() from LoadingProvider
  return <>{children}</>;
}
```

**2. Multiple LoadingProvider Instances**

- App layout: `LoadingProvider`
- Auth layout: `LoadingProvider` (separate instance)

**3. Loader IDs Reused Across Features**

- "default" used by multiple components
- No namespacing for feature-specific loaders

### Missing Error-Boundary Fallback Loaders:

**Current:** No error boundaries trigger loader cleanup
**Issue:** If component crashes during loading, loader stays visible forever
**Fix Required:**

```tsx
// Add to error boundaries
componentDidCatch() {
  this.context.hideLoading(); // Clear all loaders on error
}
```

---

## 9. 🧾 FINAL SUMMARY FOR HYBRID MIGRATION

### ➡️ What Must Move to Global:

- ✅ All click detection logic from `useNavigationProgress`
- ✅ Pathname change detection and 200ms timeout logic
- ✅ TopProgressBar and MainContentLoader UI components
- ✅ Navigation loader lifecycle management (start/stop)
- ✅ Safety timeouts and error handling

### 🏠 What Must Become Local:

- ✅ `usePageLoader()` handoff mechanism
- ✅ Form submission loaders (login, profile, etc.)
- ✅ API call loaders with specific IDs ("order-details-page")
- ✅ Button spinners and inline loading states
- ✅ Table loading states and component-level skeletons

### ❌ What Must Be Deleted:

- ❌ `useNavigationWithLoader` hook entirely
- ❌ All manual `startNavigation()` calls from components
- ❌ `NavigationLoadingProvider` (duplicate functionality)
- ❌ Separate LoadingProvider instance in auth layout

### 🔧 What Needs Refactoring:

- 🔧 Consolidate LoadingProvider to single root instance
- 🔧 Add message prioritization for concurrent loaders
- 🔧 Implement i18n for all loader messages using `useTranslations()`
- 🔧 Add ARIA live regions for loader announcements
- 🔧 Connect GlobalLoader to global context
- 🔧 Add error boundary integration for loader cleanup

### ⚠️ Hidden Traps & Dependencies:

1. **LoadingContext Set Mutation:** Current implementation mutates Set directly

   ```tsx
   loadingIds: new Set([...prev.loadingIds, loadingId]); // Creates new Set each time
   ```

2. **Navigation Debouncing:** 200ms click debounce could interfere with fast navigation

3. **Reduced Motion Preference:** Loader respects `prefers-reduced-motion` but could hide all feedback

4. **Timeout Chain Dependency:** Navigation timeout → Page loader → React Query → Component state

### 🎯 Edge Cases Specific to App Structure:

1. **Tenant-Based Routing:** Dynamic routing could affect navigation detection
2. **i18n Route Prefixes:** Locale prefixes stripped for navigation comparison
3. **Sidebar State Persistence:** MainContentLoader adjusts for sidebar width
4. **React Query Caching:** Could cause navigation to appear faster than actual render
5. **Server Components:** RSC pages can't directly trigger loaders, must use client components

### 📊 Migration Priority Order:

1. **Phase 1:** Fix technical debt (i18n, ARIA, consolidate providers)
2. **Phase 2:** Implement Global Route Loader (replace auto-detection)
3. **Phase 3:** Remove manual loader triggers (delete useNavigationWithLoader)
4. **Phase 4:** Enhance Local Component Loaders (error boundaries, better handoff)
5. **Phase 5:** Test and optimize (performance, accessibility, edge cases)

---

**Analysis Complete:** All loader implementations documented  
**Risk Assessment:** Medium complexity, manageable with phased approach  
**Recommended Approach:** Incremental migration with feature flags
