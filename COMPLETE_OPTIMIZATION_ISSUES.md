# Complete Bundle Optimization Issues - Ranked by Priority

**Codebase**: Next.js 15 E-commerce Application  
**Total Bundle Estimate**: 3-5 MB (Target: <1 MB)  
**Analysis Date**: 2025-11-27

---

## 🔴 CRITICAL Priority Issues (MUST FIX - Build Blocking)

### Issue #1: Duplicate Link Imports Causing Build Failures

**Priority**: 🔴 CRITICAL  
**Impact**: Build cannot complete, blocks production deployment  
**Current Impact**: Application cannot be built for production  
**Estimated Savings**: 0 KB (but enables build)

**Issue Description**:
Multiple files import `Link` component from both `@/i18n/navigation` (next-intl) and `next/link`, causing TypeScript compilation errors: "the name `Link` is defined multiple times".

**Affected Files** (5 files):

1. `/src/components/ProductGrid/ProductGridServer.tsx` (Lines 5 & 7)
2. `/src/app/[locale]/(app)/search/page.tsx` (Lines 3 & 6)
3. `/src/components/AppHeader/app-header.tsx` (Lines 17 & 27)
4. `/src/app/[locale]/(app)/details/orderDetails/[orderId]/components/OrderDetailsClient.tsx`
5. `/src/app/[locale]/(app)/details/quoteDetails/[quoteId]/components/QuoteDetailsClient.tsx`

**Current Code**:

```tsx
// ❌ ERROR - Duplicate imports
import { Link } from "@/i18n/navigation";
import Link from "next/link"; // Causes conflict
```

**Solution**:

```tsx
// ✅ CORRECT - Use only i18n Link
import { Link } from "@/i18n/navigation";

// Remove this line:
// import Link from "next/link";
```

**Action Required**:

- Remove `import Link from "next/link";` from all 5 files
- Keep only `import { Link } from "@/i18n/navigation";`
- Test build with `yarn build`

---

## 🔴 HIGH Priority Issues (Major Bundle Impact)

### Issue #2: Large Static Data in Client Components

**Priority**: 🔴 HIGH  
**Impact**: 31 KB hardcoded in every page load  
**Current Impact**: 31,370 bytes in initial bundle  
**Estimated Savings**: ~31 KB

**Issue Description**:
The country code selector component has an entire database of 241 countries (1620 lines) hardcoded directly in the component. This data is marked with `"use client"` and loads with the layout on every page.

**Affected Files**:

- `/src/components/custom/countrycode.tsx` (1,620 lines, 31 KB)

**Current Code**:

```tsx
"use client";

// 1600+ lines of hardcoded country data
const countries: Country[] = [
  { name: "Andorra", code: "AD", phone: "+376", flag: "..." },
  { name: "United Arab Emirates", code: "AE", phone: "+971", flag: "..." },
  // ... 239 more countries
];
```

**Solution**:

```tsx
// 1. Create /public/data/countries.json
// Extract all country data to JSON file

// 2. Update component to lazy load
"use client";
import { useState, useEffect } from "react";

const CountryCode = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check localStorage cache first
    const cached = localStorage.getItem("countries_v1");
    if (cached) {
      setCountries(JSON.parse(cached));
      return;
    }

    // Load on demand when component mounts
    setLoading(true);
    fetch("/data/countries.json")
      .then(res => res.json())
      .then(data => {
        setCountries(data);
        localStorage.setItem("countries_v1", JSON.stringify(data));
      })
      .finally(() => setLoading(false));
  }, []);

  // Rest of component...
};
```

**Action Required**:

1. Extract countries array to `/public/data/countries.json`
2. Implement lazy loading with localStorage caching
3. Add loading state UI
4. Test country selector functionality

---

### Issue #3: Non-Optimized Lodash Imports (Largest Impact)

**Priority**: 🔴 HIGH  
**Impact**: ~3 MB across 48 files  
**Current Impact**: ~60-70 KB per file  
**Estimated Savings**: ~2.5-3 MB total

**Issue Description**:
48 files import the entire lodash library instead of specific functions. Each import adds 60-70KB to that chunk, and with 48 files, this creates massive bundle bloat.

**Affected Files** (48 total):

**Utilities** (19 files):

- `/src/utils/cart/cartValidation.ts`
- `/src/utils/elasticsearch/format-response.ts`
- `/src/utils/pricing/getProductPricing.ts`
- `/src/utils/calculation/tax-breakdown.ts`
- `/src/utils/calculation/product-margin.ts`
- `/src/utils/order/orderUtils/orderUtils.ts`
- `/src/utils/order/getLatestTaxData/getLatestTaxData.ts`
- `/src/utils/calculation/sellerCartUtils/sellerCartUtils.ts`
- `/src/utils/order/orderPaymentDTO/orderPaymentDTO.ts`
- `/src/utils/calculation/cart-calculation.ts`
- `/src/utils/calculation/product-utils.ts`
- `/src/utils/calculation/salesCalculation/salesCalculation.ts`
- `/src/utils/quote/quoteSubmissionDTO/quoteSubmissionDTO.ts`
- `/src/utils/calculation/cartCalculation.ts`
- `/src/utils/calculation/tax-calculation/tax-calculation.ts`
- `/src/utils/summary/summaryReqDTO.ts`
- `/src/utils/calculation/discountCalculation/discountCalculation.ts`
- `/src/utils/calculation/volume-discount-calculation/volume-discount-calculation.ts`
- `/src/utils/quote/quotationPaymentDTO/quotationPaymentDTO.ts`

**Hooks** (19 files):

- `/src/hooks/useCart.ts`
- `/src/hooks/useMultipleSellerPricing.ts`
- `/src/hooks/useMultipleSellerCart.ts`
- `/src/hooks/useOrderCalculation/useOrderCalculation.ts`
- `/src/hooks/useProductAssets.tsx`
- `/src/hooks/useCartPrice.ts`
- `/src/hooks/useModuleSettings.ts`
- `/src/hooks/useCashDiscountHandlers/useCashDiscountHandlers.ts`
- `/src/hooks/useCalculation/useCalculation.ts`
- `/src/hooks/useGetCurrencyModuleSettings/useGetCurrencyModuleSettings.ts`
- `/src/hooks/summary/useSummaryForm.ts`
- `/src/hooks/summary/useGetDivision.ts`
- `/src/hooks/summary/useSummaryDefault.ts`
- `/src/hooks/summary/useGetDefaultBusinessUnit.ts`
- `/src/hooks/summary/useSummarySubmission.ts`
- `/src/hooks/summary/useDefaultPreference.ts`
- `/src/hooks/summary/useDefaultAccSupportOwner.ts`
- `/src/hooks/summary/useMultipleDiscount.ts`
- `/src/hooks/summary/useDefaultSellerAddress.ts`

**Components** (4 files):

- `/src/components/homepage/HomepageClient.tsx`
- `/src/components/summary/ApplyVolumeDiscountBtn.tsx`
- `/src/components/homepage/BuyerFooter.tsx`
- `/src/components/Global/Products/AddMoreProducts.tsx`

**Pages** (6 files):

- `/src/app/[locale]/(app)/details/orderDetails/[orderId]/edit/page.tsx`
- `/src/app/[locale]/(app)/details/quoteDetails/[quoteId]/edit/page.test.tsx`
- `/src/app/[locale]/(app)/details/quoteDetails/[quoteId]/edit/page.tsx`
- `/src/app/[locale]/(app)/quotesummary/components/QuoteSummaryContent.tsx`
- `/src/app/[locale]/(app)/ordersummary/component/OrderSummaryContent.tsx`

**Current Code**:

```ts
// ❌ BAD - Imports entire library (60-70 KB)
import _ from "lodash";
import lodash from "lodash";

// Usage
_.isEmpty(obj);
_.isEqual(a, b);
_.cloneDeep(obj);
```

**Solution Option A - Native JavaScript (BEST)**:

```ts
// ✅ BEST - Use native JS (0 KB import)

// Instead of _.isEmpty
Object.keys(obj).length === 0;

// Instead of _.isEqual (use library only if needed)
import isEqual from "lodash-es/isEqual"; // 2-3 KB

// Instead of _.cloneDeep (use library only if needed)
import cloneDeep from "lodash-es/cloneDeep"; // 3-4 KB

// Instead of _.map
array.map(fn);

// Instead of _.filter
array.filter(fn);

// Instead of _.find
array.find(fn);

// Instead of _.get (with optional chaining)
obj?.a?.b?.c ?? defaultValue;
```

**Solution Option B - Specific Imports**:

```ts
// ✅ GOOD - Import only what you need (2-5 KB each)
import isEqual from "lodash-es/isEqual";
import cloneDeep from "lodash-es/cloneDeep";
import debounce from "lodash-es/debounce";
```

**Action Required**:

1. Audit each file individually
2. Identify which lodash functions are actually used
3. Replace with native JS where possible
4. Use lodash-es specific imports for complex functions
5. Test all calculations and business logic thoroughly

---

### Issue #4: Icon Library Duplication

**Priority**: 🟡 MEDIUM-HIGH  
**Impact**: 15-20 KB unnecessary dependency  
**Current Impact**: Loading 2 icon libraries  
**Estimated Savings**: 15-20 KB

**Issue Description**:
Application uses both `lucide-react` (optimized, main library) and `@tabler/icons-react` (only 4 files). This creates unnecessary bundle duplication.

**Affected Files** (4 files):

- `/src/components/custom/CartPriceDetails.tsx`
- `/src/components/sample/Button.tsx`
- `/src/components/sales/CartPriceDetails.tsx`
- And 1 more file

**Current Code**:

```tsx
// Using @tabler icons in some files
import { IconShoppingCart, IconPlus } from "@tabler/icons-react";
```

**Solution**:

```tsx
// Replace with lucide-react equivalents
import { ShoppingCart, Plus } from "lucide-react";

// Common mappings:
// @tabler → lucide-react
// IconShoppingCart → ShoppingCart
// IconPlus → Plus
// IconMinus → Minus
// IconX → X
// IconCheck → Check
```

**Action Required**:

1. Find all @tabler icon imports
2. Map each to lucide-react equivalent
3. Replace imports in all 4 files
4. Remove `@tabler/icons-react` from package.json
5. Run `yarn install`
6. Test icon displays

---

## 🟡 MEDIUM Priority Issues (Code Splitting & Performance)

### Issue #5: Missing Dynamic Imports for Heavy Components

**Priority**: 🟡 MEDIUM  
**Impact**: 150-200 KB in initial bundle that could be lazy-loaded  
**Current Impact**: Large components loaded immediately  
**Estimated Savings**: 150-200 KB moved to on-demand chunks

**Issue Description**:
Large dialog and form components (500-1400 lines) are imported statically and included in the initial bundle, even though they're only used on user interaction.

**Current Good Examples** (already dynamic):

- DashboardChart ✅
- DashboardOrdersTable ✅
- OrderProductsTable ✅
- OrderPriceDetails ✅
- OrderStatusTracker ✅

**Missing Opportunities** (should be dynamic):

1. **AddAddressDialog** - 1,429 lines
   - File: `/src/components/dialogs/company/AddAddressDialog.tsx`
   - Used only when user clicks "Add Address"
2. **QuoteFilterForm** - 665 lines
   - File: `/src/components/sales/QuoteFilterForm.tsx`
   - Used only in filter dialog

3. **ContactDetails** - 830 lines
   - File: `/src/components/sales/contactdetails.tsx`
   - Could be lazy loaded

4. **OrderPriceDetails** - 633 lines
   - File: `/src/components/sales/order-price-details.tsx`
   - Already done in some places, ensure consistent

**Current Code**:

```tsx
// ❌ BAD - Loads immediately
import AddAddressDialog from "@/components/dialogs/company/AddAddressDialog";
```

**Solution**:

```tsx
// ✅ GOOD - Loads on demand
import dynamic from "next/dynamic";

const AddAddressDialog = dynamic(
  () => import("@/components/dialogs/company/AddAddressDialog"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    ),
    ssr: false, // Dialogs don't need SSR
  }
);
```

**Action Required**:

1. Convert AddAddressDialog to dynamic import
2. Convert QuoteFilterForm to dynamic import
3. Review other 500+ line components
4. Add loading skeletons
5. Test dialog opening behavior

---

### Issue #6: Excessive Client Components

**Priority**: 🟡 MEDIUM  
**Impact**: 200-500 KB potential savings  
**Current Impact**: 301 files marked "use client"  
**Estimated Savings**: Variable, 200-500 KB

**Issue Description**:
301 components use `"use client"` directive. Many of these could be server components with only interactive parts as client components, reducing JavaScript sent to browser.

**Largest Client Components**:

1. `/src/components/custom/countrycode.tsx` - 1,620 lines (being addressed)
2. `/src/components/dialogs/company/AddAddressDialog.tsx` - 1,429 lines
3. `/src/components/sales/contactdetails.tsx` - 830 lines
4. `/src/components/ui/sidebar.tsx` - 800 lines
5. `/src/components/sales/QuoteFilterForm.tsx` - 665 lines
6. `/src/components/sales/order-price-details.tsx` - 633 lines
7. `/src/components/sales/CartPriceDetails.tsx` - 554 lines
8. `/src/components/Global/DataTable/DataTable.tsx` - 520 lines
9. `/src/components/sales/order-products-table.tsx` - 490 lines
10. `/src/components/homepage/CollectionSlider.tsx` - 477 lines

**Current Pattern**:

```tsx
// ❌ Entire component is client
"use client";

export function MyComponent() {
  // Mix of static rendering and interactive parts
  return (
    <div>
      <StaticContent /> {/* Could be server */}
      <InteractiveButton /> {/* Needs client */}
    </div>
  );
}
```

**Solution**:

```tsx
// ✅ Split into server parent + client child

// MyComponent.tsx (Server Component - no directive)
import { InteractiveButton } from "./InteractiveButton";

export function MyComponent() {
  return (
    <div>
      <StaticContent /> {/* Rendered on server */}
      <InteractiveButton /> {/* Client component */}
    </div>
  );
}

// InteractiveButton.tsx (Client Component)
("use client");

export function InteractiveButton() {
  const [state, setState] = useState();
  // Interactive logic here
}
```

**Action Required**:

1. Audit top 20 largest client components
2. Identify static vs interactive parts
3. Split into server parent + client interactive child
4. Test functionality maintained
5. Measure bundle size reduction

---

### Issue #7: Date-fns Import Inconsistency

**Priority**: 🟡 MEDIUM  
**Impact**: 5-10 KB  
**Current Impact**: Mixed import patterns  
**Estimated Savings**: 5-10 KB

**Issue Description**:
Date-fns imports use inconsistent patterns. Some use tree-shakeable sub-path imports, others don't. Consistent sub-path imports ensure maximum tree-shaking.

**Affected Files** (7 files):

- `/src/components/summary/SummaryAdditionalInfo.tsx` (Lines 16, 23)
- `/src/utils/date-format/date-format.ts` (Lines 2-4)
- `/src/hooks/summary/useSummarySubmission.ts` (Line 12)
- `/src/utils/details/orderdetails/payment/payment.ts` (Line 1)

**Current Code** (mixed patterns):

```ts
// ⚠️ MIXED - Some optimized, some not
import { addDays } from "date-fns"; // Not ideal
import { format } from "date-fns/format"; // Good
import { isValid } from "date-fns"; // Not ideal
```

**Solution**:

```ts
// ✅ BEST - Consistent sub-path imports
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import isValid from "date-fns/isValid";
import differenceInDays from "date-fns/differenceInDays";
import isAfter from "date-fns/isAfter";
```

**Action Required**:

1. Standardize all date-fns imports to sub-path pattern
2. Update 7 affected files
3. Test date functionality

---

### Issue #8: Recharts Bundle Size

**Priority**: 🟡 MEDIUM  
**Impact**: ~90 KB (already partially optimized)  
**Current Impact**: Chart library loaded on dashboard  
**Estimated Savings**: Already in config, verify effectiveness

**Issue Description**:
Recharts is a heavy library (~90KB). Currently configured in `next.config.mjs` for optimization, but one file imports entire library as namespace.

**Affected Files**:

- `/src/components/ui/chart.tsx` (Line 4) - Namespace import
- `/src/app/[locale]/(app)/dashboard/components/DashboardChart/DashboardChart.tsx` (Line 6) - Specific imports ✅

**Current Code**:

```tsx
// chart.tsx - imports everything
import * as RechartsPrimitive from "recharts";

// DashboardChart.tsx - specific imports (good)
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
```

**Solution**:

```tsx
// Option 1: Verify namespace import is necessary for chart.tsx
// If needed for re-exports, keep but ensure next.config handles it

// Option 2: Consider code-splitting dashboard
const DashboardChart = dynamic(
  () => import("./components/DashboardChart/DashboardChart"),
  {
    loading: () => <ChartSkeleton />,
    ssr: true, // Charts should SSR for SEO
  }
);
```

**Already Configured**:

```js
// next.config.mjs
optimizePackageImports: [
  "recharts",
  // ...
];
```

**Action Required**:

1. Verify chart.tsx namespace import necessity
2. Ensure next.config optimization is working
3. Consider dynamic import for dashboard
4. Check bundle analyzer for recharts size

---

## 🟢 LOW-MEDIUM Priority Issues (Polish & Best Practices)

### Issue #9: XLSX Library (Already Optimized ✅)

**Priority**: 🟢 LOW  
**Impact**: 0 KB (already optimized)  
**Current Impact**: ~100 KB library size  
**Estimated Savings**: Already implemented correctly

**Status**: ✅ **ALREADY OPTIMIZED - NO ACTION NEEDED**

**Affected Files**:

- `/src/app/[locale]/(app)/landing/quoteslanding/Components/QuotesLandingTable/QuotesLandingTable.tsx` (Line 754)
- `/src/app/[locale]/(app)/landing/orderslanding/components/OrdersLandingTable/OrdersLandingTable.tsx` (Line 543)

**Current Implementation** (CORRECT):

```tsx
// ✅ GOOD - Already using dynamic import
const handleExport = async () => {
  const XLSX = await import("xlsx");
  // Use XLSX here
};
```

**No Action Required** - Already following best practices!

---

### Issue #10: Radix UI Bundle Size

**Priority**: 🟢 LOW  
**Impact**: Already optimized in config  
**Current Impact**: Extensive use across UI  
**Estimated Savings**: Already configured

**Status**: ✅ **ALREADY CONFIGURED - MONITOR ONLY**

**Usage**: 50+ UI component files use Radix UI primitives

**Current Configuration**:
``js
// next.config.mjs - Already optimized
optimizePackageImports: [
"@radix-ui/react-dialog",
"@radix-ui/react-dropdown-menu",
"@radix-ui/react-select",
"@radix-ui/react-popover",
"@tanstack/react-table",
"@tanstack/react-query",
"date-fns",
"react-hook-form",
"@hookform/resolvers",
]

````

**Current Pattern**:
```tsx
// Namespace imports in UI components
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
````

**Action Required**:

1. Verify bundle analyzer shows optimization working
2. Monitor Radix UI chunk sizes
3. No changes needed if optimization is effective

---

### Issue #11: Barrel File Exports (Investigation Needed)

**Priority**: 🟢 LOW-MEDIUM  
**Impact**: Unknown, needs investigation  
**Current Impact**: Potential tree-shaking issues  
**Estimated Savings**: Unknown

**Issue Description**:
Barrel files (index.ts that re-export everything) can prevent tree-shaking. Need to investigate if this is occurring.

**Files to Investigate**:

- `/src/components` - 255 files, check for index.ts files
- `/src/utils` - Check for barrel exports
- `/src/hooks` - Check for barrel exports

**Potential Problem**:

```ts
// ❌ BAD - Barrel file that prevents tree-shaking
// /src/components/index.ts
export * from "./Button";
export * from "./Card";
export * from "./Dialog";
// ... exports everything

// Import pulls in everything
import { Button } from "@/components"; // Might bundle Card, Dialog too
```

**Solution**:

```ts
// ✅ GOOD - Direct imports
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

// OR remove barrel files entirely
```

**Action Required**:

1. Search for index.ts files in components/utils/hooks
2. Analyze import patterns
3. Consider removing barrel files
4. Update imports to be direct

---

### Issue #12: Webpack Configuration Optimization

**Priority**: 🟢 LOW  
**Impact**: Build time and minor bundle size  
**Current Impact**: Already has good config  
**Estimated Savings**: 10-20 KB

**Current State**: Already well-configured in `next.config.mjs`

**Existing Good Configurations**:

- ✅ SWC minification enabled
- ✅ Code splitting configured
- ✅ Framework, UI, and lib chunks separated
- ✅ External packages for server components

**Potential Improvements**:

```js
// next.config.mjs additions
experimental: {
  // Add if not present
  turbo: {
    loaders: {
      // Optimize asset loading
    }
  },

  // Reduce client-side runtime
  optimisticClientCache: true,  // Already present ✅
}
```

**Action Required**:

1. Review bundle analyzer for chunk distribution
2. Consider further splitChunks optimization
3. Monitor build times

---

### Issue #13: Image Optimization Settings

**Priority**: 🟢 LOW  
**Impact**: Network performance, not bundle size  
**Current Impact**: Already configured for optimization  
**Estimated Savings**: N/A (affects network, not bundle)

**Current Configuration**:

```js
// next.config.mjs - Already optimized
images: {
  formats: ["image/avif", "image/webp"],  // Modern formats ✅
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],  ✅
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],  ✅
  minimumCacheTTL: 31536000,  // 1 year cache ✅
}
```

**Status**: ✅ Already well-configured

**Action Required**: None, already optimized

---

### Issue #14: Font Loading Strategy

**Priority**: 🟢 LOW  
**Impact**: Initial page load perception  
**Current Impact**: Unknown, needs investigation  
**Estimated Savings**: N/A (affects perceived performance)

**Issue Description**:
Investigate if custom fonts are being loaded and if they're optimized.

**Action Required**:

1. Check for font imports in layout/global CSS
2. Ensure using `next/font` for automatic optimization
3. Consider font-display: swap for faster FCP

**Best Practice**:

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Faster First Contentful Paint
  variable: "--font-inter",
});
```

---

### Issue #15: Unused Dependencies

**Priority**: 🟢 LOW  
**Impact**: Development bundle size  
**Current Impact**: Possibly unused packages in node_modules  
**Estimated Savings**: Cleanup only

**Issue Description**:
1.1 GB node_modules size suggests possible unused dependencies.

**Action Required**:

1. Run dependency analyzer:

   ```bash
   npx depcheck
   ```

2. Check for unused packages in package.json

3. Remove unused dependencies:

   ```bash
   yarn remove <unused-package>
   ```

4. Run dedupe to reduce duplicates:
   ```bash
   yarn dedupe
   ```

---

## Summary Table - All Issues Ranked

| #   | Issue                       | Priority       | Impact      | Savings        | Files Affected |
| --- | --------------------------- | -------------- | ----------- | -------------- | -------------- |
| 1   | Duplicate Link Imports      | 🔴 CRITICAL    | Build fails | Build succeeds | 5              |
| 2   | Large Static Country Data   | 🔴 HIGH        | 31 KB       | 31 KB          | 1              |
| 3   | Non-Optimized Lodash        | 🔴 HIGH        | ~3 MB       | 2.5-3 MB       | 48             |
| 4   | Icon Library Duplication    | 🟡 MEDIUM-HIGH | 20 KB       | 15-20 KB       | 4              |
| 5   | Missing Dynamic Imports     | 🟡 MEDIUM      | 200 KB      | 150-200 KB     | 4+             |
| 6   | Excessive Client Components | 🟡 MEDIUM      | 500 KB      | 200-500 KB     | 301            |
| 7   | Date-fns Inconsistency      | 🟡 MEDIUM      | 10 KB       | 5-10 KB        | 7              |
| 8   | Recharts Bundle Size        | 🟡 MEDIUM      | 90 KB       | Verify config  | 2              |
| 9   | XLSX Library                | 🟢 LOW         | 0 KB        | ✅ None needed | 2              |
| 10  | Radix UI                    | 🟢 LOW         | 0 KB        | ✅ Configured  | 50+            |
| 11  | Barrel File Exports         | 🟢 LOW-MEDIUM  | Unknown     | TBD            | TBD            |
| 12  | Webpack Config              | 🟢 LOW         | 20 KB       | 10-20 KB       | 1              |
| 13  | Image Optimization          | 🟢 LOW         | N/A         | ✅ None needed | 1              |
| 14  | Font Loading                | 🟢 LOW         | N/A         | TBD            | TBD            |
| 15  | Unused Dependencies         | 🟢 LOW         | N/A         | Cleanup        | N/A            |

**Total Estimated Savings**: 3.0-3.5 MB (from estimated 3-5 MB to target <1 MB)

---

## Recommended Implementation Order

### Phase 1: Critical (Week 1, Day 1-2)

1. ✅ Fix duplicate Link imports (Issue #1)
2. ✅ Verify build succeeds
3. ✅ Run initial bundle analysis

### Phase 2: High Impact (Week 1, Day 3-5)

1. ✅ Extract country data to JSON (Issue #2)
2. ✅ Replace lodash imports (Issue #3) - Most time-consuming
3. ✅ Consolidate icon libraries (Issue #4)

### Phase 3: Medium Impact (Week 2)

1. ✅ Add dynamic imports (Issue #5)
2. ✅ Optimize date-fns imports (Issue #7)
3. ✅ Verify Recharts optimization (Issue #8)

### Phase 4: Refinement (Week 3)

1. ✅ Server component audit (Issue #6)
2. ✅ Investigate barrel files (Issue #11)
3. ✅ Check fonts and unused deps (Issues #14, #15)
4. ✅ Final bundle analysis

---

## Success Metrics

**Before Optimization**:

- Bundle Size: 3-5 MB (estimated)
- Build: ❌ Failing
- Client Components: 301
- Lighthouse Score: Unknown

**Target After Optimization**:

- Bundle Size: <1 MB ✅
- Build: ✅ Passing
- Client Components: <200
- Lighthouse Score: >90
- Reduction: 60-75% smaller

---

## Quick Reference Commands

```bash
# Build and analyze
ANALYZE=true yarn build

# Type checking
yarn type-check

# Linting
yarn lint

# Find lodash usage
grep -r "import.*lodash" src/ --include="*.ts" --include="*.tsx"

# Find client components
grep -r '"use client"' src/ --include="*.tsx" | wc -l

# Check unused dependencies
npx depcheck

# Bundle size per commit
du -sh .next/static/chunks/
```

---

**End of Complete Optimization Issues Report**
