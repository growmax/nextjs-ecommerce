# Quote and Order Summary Pages - Implementation Plan

## Overview

This plan details the step-by-step implementation of Quote Summary and Order Summary pages by migrating functionality from buyer-fe to nextjs-ecommerce. The implementation follows the buyer-fe-migration.mdc guidelines and ensures all business logic is preserved while adapting to the new architecture.

---

## Phase 1: Cleanup and Analysis

### Step 1.1: Remove Unnecessary Files

**Action Items:**

- [ ] Delete `/app/[locale]/(app)/checkout/order-summary/page.tsx` (placeholder file)
- [ ] Delete `/app/[locale]/(app)/checkout/quote-summary/page.tsx` (placeholder file)
- [ ] Keep `/app/[locale]/(app)/ordersummary/[sellerId]/page.tsx` (will be enhanced)
- [ ] Keep `/app/[locale]/(app)/quotesummary/[sellerId]/page.tsx` (will be enhanced)

**Files to Delete:**

```
src/app/[locale]/(app)/checkout/order-summary/page.tsx
src/app/[locale]/(app)/checkout/quote-summary/page.tsx
```

### Step 1.2: Analyze buyer-fe Implementation

**Reference Files to Study:**

1. `/e2e/buyer-fe/src/components/Summary/OrderSummary/orderSummary.js` (713 lines)
2. `/e2e/buyer-fe/src/components/Summary/QuoteSummary/QuoteSummary.js` (849 lines)
3. `/e2e/buyer-fe/src/components/Summary/hooks/useSummaryDefault.js` (315 lines)
4. `/e2e/buyer-fe/src/utils/summary-utils.js` (summaryReqDTO function)

**Key Features to Extract:**

- Form management with react-hook-form + yup validation
- Cart data integration with multi-seller support
- Address management (shipping, billing, seller, warehouse, register)
- Product table with quantity editing
- Price calculations (subtotal, tax, discounts, volume discounts)
- Payment terms, cash discounts, preferences
- SPR (Special Price Request) for quotes
- Document attachments and comments
- Volume discount application
- Order/Quote submission API calls

**Action Items:**

- [ ] Document all API endpoints used in buyer-fe hooks
- [ ] Document all business logic and calculations
- [ ] Document validation rules and schemas
- [ ] Document form field requirements

---

## Phase 2: API Analysis and Service Foundation (CRITICAL FIRST STEP)

### Step 2.1: Complete API Route Mapping

**MANDATORY:** Map all buyer-fe API routes to nextjs-ecommerce services before creating any hooks.

#### API Route Analysis Table

| buyer-fe API Route                | Method | Used By Hook                | nextjs-ecommerce Service | Status           | Action Required                                             |
| --------------------------------- | ------ | --------------------------- | ------------------------ | ---------------- | ----------------------------------------------------------- |
| `/api/preference`                 | POST   | `useDefaultPreference`      | `PreferenceService`      | ✅ EXISTS        | Verify endpoint matches or create `getDefaultPreferences()` |
| `/api/address/warehouse`          | POST   | `useDefaultWarehouse`       | `SellerWarehouseService` | ✅ EXISTS        | Verify `findWarehouseByBranchId()` matches POST format      |
| `/api/accSupportOwner`            | POST   | `useDefaultAccSupportOwner` | ❌ MISSING               | ❌ NEEDS SERVICE | Create `AccountOwnerService.getAccountOwners()`             |
| `/api/product/discount`           | POST   | `useMultipleDiscount`       | `DiscountService`        | ✅ EXISTS        | Verify `getDiscount()` matches payload format               |
| `/api/product/getAllSellerPrices` | POST   | `useMultipleDiscount`       | `DiscountService`        | ✅ DEPRECATED    | Replace with `getDiscount()` without sellerId               |
| `/api/sales/getVD`                | POST   | `useCheckVD`                | `DiscountService`        | ⚠️ PARTIAL       | Create `checkVolumeDiscount()` method                       |
| `/api/sales/getCurrency`          | POST   | `useCurrencyFactor`         | ❌ MISSING               | ❌ NEEDS SERVICE | Create `CurrencyService.getCurrencyFactor()`                |
| `api/sales/getDivision`           | GET    | `useGetDivision`            | ❌ MISSING               | ❌ NEEDS SERVICE | Create `SalesService.getDivision()`                         |
| `api/sales/getChannel`            | GET    | `useGetChannel`             | ❌ MISSING               | ❌ NEEDS SERVICE | Create `SalesService.getChannel()`                          |
| Tax Calculation                   | N/A    | `useTaxBreakup`             | Utils (no API)           | ✅ EXISTS        | Reuse existing calculation utils                            |

#### Detailed API Analysis

**1. `/api/preference` (POST)**

- **Payload:** `{ companyId, selectedSellerId, isSummary, timestamp }`
- **Response:** Default preferences (payment terms, freight, insurance, etc.)
- **Current Service:** `PreferenceService.findOrderPreferences()` exists
- **Action:** Verify if existing method works or create `getDefaultPreferences(params)`

**2. `/api/address/warehouse` (POST)**

- **Payload:** `{ sellerBranchId }`
- **Response:** Warehouse address details
- **Current Service:** `SellerWarehouseService.findWarehouseByBranchId()` exists
- **Action:** Verify POST format matches or create wrapper method

**3. `/api/accSupportOwner` (POST)**

- **Payload:** `{ companyId }`
- **Response:** `{ accountOwner: [{ id, isActive, ... }] }`
- **Current Service:** ❌ MISSING
- **Action:** Create `AccountOwnerService` with `getAccountOwners(companyId)` method

**4. `/api/product/discount` (POST)**

- **Payload:** `{ userId, tenantId, body: { Productid, CurrencyId, companyId, BaseCurrencyId, sellerId? } }`
- **Response:** Discount data for products
- **Current Service:** `DiscountService.getDiscount()` exists
- **Action:** Verify payload format matches ✅

**5. `/api/product/getAllSellerPrices` (POST)**

- **Payload:** `{ userId, tenantId, body: { Productid, CurrencyId, BaseCurrencyId, CompanyId } }`
- **Response:** All seller prices for validation
- **Current Service:** `DiscountService.getAllSellerPrices()` exists but deprecated
- **Action:** Replace with `DiscountService.getDiscount()` without sellerId (returns all sellers)

**6. `/api/sales/getVD` (POST)**

- **Payload:** `{ companyId, body: [{ productId, quantity, defaultDiscount }] }`
- **Response:** Volume discount availability and status
- **Current Service:** `DiscountService.checkIsVDEnabledByCompanyId()` exists but different
- **Action:** Create `DiscountService.checkVolumeDiscount(request)` method

**7. `/api/sales/getCurrency` (POST)**

- **Payload:** `{ companyId }`
- **Response:** `{ data: { currencyFactor: number } }`
- **Current Service:** ❌ MISSING
- **Action:** Create `CurrencyService.getCurrencyFactor(companyId)` method

**8. `api/sales/getDivision` (GET)**

- **Payload:** None
- **Response:** Division list
- **Current Service:** ❌ MISSING
- **Action:** Create `SalesService.getDivision()` method

**9. `api/sales/getChannel` (GET)**

- **Payload:** None
- **Response:** Channel list
- **Current Service:** ❌ MISSING
- **Action:** Create `SalesService.getChannel()` method

**10. Tax Calculation (No API)**

- **Used By:** `useTaxBreakup`
- **Current Utils:** `cartCalculation()`, `calculateItemTaxes()`, `setTaxBreakup()` exist
- **Action:** Reuse existing calculation utilities

### Step 2.2: Create Missing Services (Priority Order)

#### HIGH PRIORITY Services

**1. AccountOwnerService** (`src/lib/api/services/AccountOwnerService/AccountOwnerService.ts`)

```typescript
// Structure to create
export class AccountOwnerService extends BaseService<AccountOwnerService> {
  async getAccountOwners(companyId: number): Promise<AccountOwnerResponse> {
    // Endpoint: Find backend endpoint for account owners
    // Method: POST
    // Payload: { companyId }
    // Returns: { accountOwner: AccountOwner[] }
  }
}
```

**Action Items:**

- [ ] Find backend endpoint for account owners
- [ ] Create service file following BaseService pattern
- [ ] Add TypeScript interfaces
- [ ] Export from `src/lib/api/index.ts`
- [ ] Add server-side methods if needed

**2. CurrencyService** (`src/lib/api/services/CurrencyService/CurrencyService.ts`)

```typescript
// Structure to create
export class CurrencyService extends BaseService<CurrencyService> {
  async getCurrencyFactor(companyId: number): Promise<CurrencyFactorResponse> {
    // Endpoint: Find backend endpoint for currency factor
    // Method: POST
    // Payload: { companyId }
    // Returns: { data: { currencyFactor: number } }
  }
}
```

**Action Items:**

- [ ] Find backend endpoint for currency factor
- [ ] Create service file following BaseService pattern
- [ ] Add TypeScript interfaces
- [ ] Export from `src/lib/api/index.ts`
- [ ] Add server-side methods if needed

**3. SalesService** (`src/lib/api/services/SalesService/SalesService.ts`)

```typescript
// Structure to create
export class SalesService extends BaseService<SalesService> {
  async getDivision(): Promise<DivisionResponse> {
    // Endpoint: GET /api/sales/getDivision
    // Returns: Division list
  }

  async getChannel(): Promise<ChannelResponse> {
    // Endpoint: GET /api/sales/getChannel
    // Returns: Channel list
  }

  async getManufacturerCompetitor(params): Promise<CompetitorResponse> {
    // Endpoint: POST /api/sales/getManufacturerCompetitor
    // For SPR (Special Price Request) - quote only
  }
}
```

**Action Items:**

- [ ] Find backend endpoints for division, channel, manufacturer competitor
- [ ] Create service file following BaseService pattern
- [ ] Add TypeScript interfaces for all methods
- [ ] Export from `src/lib/api/index.ts`
- [ ] Add server-side methods if needed

**4. DiscountService Update** (`src/lib/api/services/DiscountService/DiscountService.ts`)

```typescript
// Add new method
async checkVolumeDiscount(request: VolumeDiscountRequest): Promise<VolumeDiscountResponse> {
  // Endpoint: POST /api/sales/getVD or /discount/checkVolumeDiscount
  // Payload: { companyId, body: [{ productId, quantity, defaultDiscount }] }
  // Returns: Volume discount availability and status
}
```

**Action Items:**

- [ ] Find correct backend endpoint for volume discount check
- [ ] Add `checkVolumeDiscount()` method to existing DiscountService
- [ ] Add TypeScript interfaces
- [ ] Add server-side method if needed

#### MEDIUM PRIORITY Services

**5. PreferenceService Update** (`src/lib/api/services/PreferenceService/PreferenceService.ts`)

```typescript
// Add new method
async getDefaultPreferences(params: DefaultPreferencesRequest): Promise<DefaultPreferencesResponse> {
  // Endpoint: /preferences/default or verify /preferences/find works
  // Payload: { companyId, selectedSellerId, isSummary }
  // Returns: Default payment terms, freight, insurance, etc.
}
```

**Action Items:**

- [ ] Verify if existing `findOrderPreferences()` works with payload
- [ ] If not, create `getDefaultPreferences()` method
- [ ] Add TypeScript interfaces
- [ ] Test with buyer-fe payload format

**6. SellerWarehouseService Verify** (`src/lib/api/services/SellerWarehouseService/SellerWarehouseService.ts`)

**Action Items:**

- [ ] Verify `findWarehouseByBranchId()` matches buyer-fe POST format
- [ ] If not, create wrapper method `findWarehouse(params)`
- [ ] Test with buyer-fe payload format

**7. OrdersService Update** (`src/lib/api/services/OrdersService/OrdersService.ts`)

```typescript
// Add new method
async createOrderFromSummary(
  params: { userId: string | number; companyId: string | number },
  orderData: any
): Promise<{ orderIdentifier: string }> {
  // Endpoint: orders/createOrderByBuyer?userId={userId}&companyId={companyId}
  // Uses summaryReqDTO utility to format payload
}
```

**Action Items:**

- [ ] Add `createOrderFromSummary()` method
- [ ] Reuse pattern from existing `placeOrderFromQuote()` method
- [ ] Add TypeScript interfaces
- [ ] Add server-side method if needed

**8. QuoteSubmissionService Update** (`src/lib/api/services/QuoteSubmissionService/QuoteSubmissionService.ts`)

```typescript
// Add new method
async createQuoteFromSummary(
  params: { userId: string | number; companyId: string | number },
  quoteData: any
): Promise<QuoteSubmissionResponse> {
  // Endpoint: quotes/createQuoteByBuyer?userId={userId}&companyId={companyId}
  // Uses summaryReqDTO utility to format payload
  // Check if submitQuoteAsNewVersion() can be reused or needs new endpoint
}
```

**Action Items:**

- [ ] Check if `submitQuoteAsNewVersion()` can be reused
- [ ] If not, add `createQuoteFromSummary()` method
- [ ] Add TypeScript interfaces
- [ ] Add server-side method if needed

### Step 2.3: Create Summary Utilities

**1. summaryReqDTO** (`src/utils/summary/summaryReqDTO.ts`)

**Action Items:**

- [ ] Migrate `summaryReqDTO` function from `buyer-fe/src/utils/summary-utils.js`
- [ ] Convert to TypeScript with proper types
- [ ] Transform form data to API payload format
- [ ] Support both order and quote DTOs
- [ ] Add comprehensive TypeScript interfaces

**2. Validation Schemas** (`src/utils/summary/validation.ts`)

**Action Items:**

- [ ] Migrate validation schemas from buyer-fe
- [ ] Convert yup schemas to TypeScript
- [ ] Include `BuyerQuoteSummaryValidations` schema
- [ ] Add proper TypeScript types for validation

**3. Calculations** (Verify Existing)

**Action Items:**

- [ ] Verify existing calculation utils are sufficient
- [ ] Check: `cartCalculation()`, `calculateItemTaxes()`, `setTaxBreakup()`
- [ ] Document which utils to reuse
- [ ] Create wrapper functions if needed

---

## Phase 3: Create Hooks (After Services Exist)

### Step 3.1: Create Summary Hooks (Dependency Order)

**IMPORTANT:** Create hooks in this exact order as each depends on the previous ones.

#### Hook 1: useDefaultPreference

**File:** `src/hooks/summary/useDefaultPreference.ts`

**Dependencies:**

- `PreferenceService.getDefaultPreferences()`

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useDefaultPreference.js`
- [ ] Convert to TypeScript
- [ ] Replace SWR with TanStack Query (`useQuery`)
- [ ] Use `PreferenceService.getDefaultPreferences()`
- [ ] Return: `{ defaultpreference, defaultpreferenceLoading }`

#### Hook 2: useDefaultWarehouse

**File:** `src/hooks/summary/useDefaultWarehouse.ts`

**Dependencies:**

- `SellerWarehouseService.findWarehouse()`

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useDefaultWarehosue.js`
- [ ] Convert to TypeScript
- [ ] Replace SWR with TanStack Query
- [ ] Use `SellerWarehouseService.findWarehouse()`
- [ ] Return: `{ defaultWarehouseAddress, defaultWarehouseAddressLoading }`

#### Hook 3: useDefaultAccSupportOwner

**File:** `src/hooks/summary/useDefaultAccSupportOwner.ts`

**Dependencies:**

- `AccountOwnerService.getAccountOwners()`

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useDefaultAccSupportOwner.js`
- [ ] Convert to TypeScript
- [ ] Replace SWR with TanStack Query
- [ ] Use `AccountOwnerService.getAccountOwners()`
- [ ] Return: `{ defaultAccSupportOwner, defaultAccSupportOwnerLoading }`

#### Hook 4: useTaxBreakup

**File:** `src/hooks/summary/useTaxBreakup.ts`

**Dependencies:**

- Existing calculation utils (no API)

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useTaxBreakup.js`
- [ ] Convert to TypeScript
- [ ] Reuse: `cartCalculation()`, `calculateItemTaxes()`, `setTaxBreakup()`
- [ ] No API calls needed - pure calculation
- [ ] Return: `{ cartDetails, productDetails, getBreakup, isInter }`

#### Hook 5: useMultipleDiscount

**File:** `src/hooks/summary/useMultipleDiscount.ts`

**Dependencies:**

- `DiscountService.getDiscount()` (without sellerId for all sellers)
- `OpenSearchService` for product data

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useMultipeDiscounts.js`
- [ ] Convert to TypeScript
- [ ] Replace SWR with TanStack Query
- [ ] Use `DiscountService.getDiscount()` without sellerId
- [ ] **Important:** Remove `getAllSellerPrices` call, use `getDiscount()` instead
- [ ] Use `OpenSearchService` for elastic product data
- [ ] Return: `{ isLoading, cartValue, cart, ApprovalRequired }`

#### Hook 6: useCheckVolumeDiscount

**File:** `src/hooks/summary/useCheckVolumeDiscount.ts`

**Dependencies:**

- `DiscountService.checkVolumeDiscount()`

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useCheckVD.js`
- [ ] Convert to TypeScript
- [ ] Replace SWR with TanStack Query
- [ ] Use `DiscountService.checkVolumeDiscount()`
- [ ] Return: `{ VolumeDiscountAvailable, ShowVDButton, VDapplied, vdLoading }`

#### Hook 7: useCurrencyFactor

**File:** `src/hooks/summary/useCurrencyFactor.ts`

**Dependencies:**

- `CurrencyService.getCurrencyFactor()`

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useCurrencyFactor.js`
- [ ] Convert to TypeScript
- [ ] Replace SWR with TanStack Query
- [ ] Use `CurrencyService.getCurrencyFactor()`
- [ ] Return: `{ CurrencyFactor, CurrencyFactorLoading }`

#### Hook 8: useGetDivision

**File:** `src/hooks/summary/useGetDivision.ts`

**Dependencies:**

- `SalesService.getDivision()`

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useGetDivision.js`
- [ ] Convert to TypeScript
- [ ] Replace SWR with TanStack Query
- [ ] Use `SalesService.getDivision()`
- [ ] Return: Division data

#### Hook 9: useGetChannel

**File:** `src/hooks/summary/useGetChannel.ts`

**Dependencies:**

- `SalesService.getChannel()`

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useGetChannel.js`
- [ ] Convert to TypeScript
- [ ] Replace SWR with TanStack Query
- [ ] Use `SalesService.getChannel()`
- [ ] Return: Channel data

#### Hook 10: useSummaryDefault (MAIN HOOK)

**File:** `src/hooks/summary/useSummaryDefault.ts`

**Dependencies:**

- All hooks above (1-9)
- `useCart`, `useSelectedSellerCart` (existing)
- `useBilling`, `useCurrentShippingAddress` (existing)
- `useRegisterAddress` (existing)

**Action Items:**

- [ ] Migrate from `buyer-fe/src/components/Summary/hooks/useSummaryDefault.js`
- [ ] Convert to TypeScript with comprehensive types
- [ ] Replace SWR with TanStack Query where needed
- [ ] Integrate with existing cart hooks
- [ ] Support both order and quote modes (`isOrder` parameter)
- [ ] Return: `{ initialValues, isLoading }` for react-hook-form

### Step 3.2: Create Form Management Hooks

#### Hook: useSummaryForm

**File:** `src/hooks/summary/useSummaryForm.ts`

**Action Items:**

- [ ] Create wrapper hook for react-hook-form setup
- [ ] Integrate validation schema (`BuyerQuoteSummaryValidations`)
- [ ] Handle form state, errors, submission
- [ ] Use `useSummaryDefault` for initial values
- [ ] Return form methods and state

#### Hook: useSummarySubmission

**File:** `src/hooks/summary/useSummarySubmission.ts`

**Dependencies:**

- `OrdersService.createOrderFromSummary()`
- `QuoteSubmissionService.createQuoteFromSummary()`

**Action Items:**

- [ ] Create hook for order/quote submission
- [ ] Use `useMutation` from TanStack Query
- [ ] Handle submission state and errors
- [ ] Support both order and quote submission
- [ ] Return: `{ submitOrder, submitQuote, isLoading, error }`

---

## Phase 4: UI Components

### Step 4.1: Verify Reusable Components

**Already Available Components:**

- ✅ `OrderProductsTable` - Products table with pagination (from detail pages)
- ✅ `OrderPriceDetails` - Price breakdown card (from detail pages)
- ✅ `CustomerInfoCard` - Customer information (from detail pages)
- ✅ `OrderTermsCard` - Terms and conditions (from detail pages)
- ✅ `SalesHeader` - Header with title and action buttons

**Action Items:**

- [ ] Verify all components are accessible and working
- [ ] Document component props and usage
- [ ] Check if any modifications needed for summary pages

### Step 4.2: Create Summary-Specific Components

#### Component 1: SummaryProductsTable

**File:** `src/components/summary/SummaryProductsTable.tsx`

**Action Items:**

- [ ] Create wrapper around `OrderProductsTable`
- [ ] Add quantity editing capability (`isEditable` prop)
- [ ] Handle quantity changes with callbacks
- [ ] Support product removal
- [ ] Support product search/add (if needed)
- [ ] Integrate with form state

#### Component 2: SummaryAddressSection

**File:** `src/components/summary/SummaryAddressSection.tsx`

**Action Items:**

- [ ] Create address cards for shipping, billing, seller, warehouse
- [ ] Add address selection/editing functionality
- [ ] Reuse address components from detail pages if available
- [ ] Integrate with form state
- [ ] Handle address changes

#### Component 3: SummaryTermsSection

**File:** `src/components/summary/SummaryTermsSection.tsx`

**Action Items:**

- [ ] Create payment terms selection UI
- [ ] Add freight, insurance, package forwarding selection
- [ ] Add cash discount options
- [ ] Reuse `OrderTermsCard` where possible
- [ ] Integrate with form state

#### Component 4: SummaryAdditionalInfo

**File:** `src/components/summary/SummaryAdditionalInfo.tsx`

**Action Items:**

- [ ] Create comments input field
- [ ] Add document attachments functionality
- [ ] Add buyer reference number field
- [ ] Add customer required date field
- [ ] Add SPR form (for quotes only)
- [ ] Integrate with form state

#### Component 5: SummaryNameCard

**File:** `src/components/summary/SummaryNameCard.tsx`

**Action Items:**

- [ ] Create order/quote name editing component
- [ ] Similar to NameCard in buyer-fe
- [ ] Support name validation
- [ ] Integrate with form state

#### Component 6: SummaryActions

**File:** `src/components/summary/SummaryActions.tsx`

**Action Items:**

- [ ] Create action buttons (Cancel, Place Order, Request Quote)
- [ ] Add loading states
- [ ] Add validation feedback
- [ ] Handle form submission
- [ ] Integrate with `useSummarySubmission` hook

---

## Phase 5: Main Summary Pages

### Step 5.1: Implement Order Summary Page

**File:** `src/app/[locale]/(app)/ordersummary/component/OrderSummaryContent.tsx`

**Action Items:**

- [ ] Replace existing skeleton implementation
- [ ] Use `useSummaryDefault` hook with `isOrder: true`
- [ ] Use `useSummaryForm` hook for form management
- [ ] Use `useSummarySubmission` hook for order submission
- [ ] Compose all summary sections:
  - SummaryNameCard
  - SummaryProductsTable
  - SummaryAddressSection
  - SummaryTermsSection
  - SummaryAdditionalInfo
  - OrderPriceDetails
  - SummaryActions
- [ ] Handle form validation and errors
- [ ] Handle submission success/error
- [ ] Add loading states
- [ ] Ensure mobile responsive

### Step 5.2: Implement Quote Summary Page

**File:** `src/app/[locale]/(app)/quotesummary/components/QuoteSummaryContent.tsx`

**Action Items:**

- [ ] Replace existing skeleton implementation
- [ ] Use `useSummaryDefault` hook with `isOrder: false`
- [ ] Use `useSummaryForm` hook for form management
- [ ] Use `useSummarySubmission` hook for quote submission
- [ ] Compose all summary sections (same as order, plus SPR):
  - SummaryNameCard
  - SummaryProductsTable
  - SummaryAddressSection
  - SummaryTermsSection
  - SummaryAdditionalInfo (with SPR form)
  - OrderPriceDetails
  - SummaryActions
- [ ] Add SPR (Special Price Request) functionality
- [ ] Handle quote-specific validations
- [ ] Handle form validation and errors
- [ ] Handle submission success/error
- [ ] Add loading states
- [ ] Ensure mobile responsive

---

## Phase 6: Integration and Testing

### Step 6.1: Route Integration

**Action Items:**

- [ ] Verify routes work: `/ordersummary/[sellerId]` and `/quotesummary/[sellerId]`
- [ ] Handle query params (sellerId) correctly
- [ ] Verify navigation from cart page works
- [ ] Test with single seller scenario
- [ ] Test with multiple sellers scenario

### Step 6.2: Data Flow Testing

**Action Items:**

- [ ] Test cart → summary data flow (products, pricing)
- [ ] Test summary → API submission flow
- [ ] Test API → success/error handling
- [ ] Verify all form data is correctly transformed to API payload
- [ ] Verify API responses are handled correctly

### Step 6.3: Validation Testing

**Action Items:**

- [ ] Test form validation matches buyer-fe
- [ ] Test business rule validation (min order value, etc.)
- [ ] Test error handling and user feedback
- [ ] Test XSS protection in comments and reference numbers
- [ ] Test all required field validations

### Step 6.4: Functional Testing Checklist

- [ ] Products display correctly
- [ ] Quantity editing works
- [ ] Address selection works
- [ ] Price calculations match buyer-fe
- [ ] Form submission works (order)
- [ ] Form submission works (quote)
- [ ] Error handling works
- [ ] Multi-seller support works
- [ ] Mobile responsive design
- [ ] SPR functionality works (quote only)
- [ ] Volume discount application works
- [ ] Document attachments work
- [ ] Comments and reference numbers work

---

## Implementation Order Summary

### Critical Path (Must Follow This Order):

1. **Phase 1**: Cleanup and Analysis
2. **Phase 2.1**: Complete API analysis and mapping
3. **Phase 2.2**: Create missing services (AccountOwnerService, CurrencyService, SalesService, update DiscountService)
4. **Phase 2.3**: Update existing services (PreferenceService, OrdersService, QuoteSubmissionService)
5. **Phase 2.4**: Create summary utilities (summaryReqDTO, validation)
6. **Phase 3.1**: Create hooks in dependency order (1-10)
7. **Phase 3.2**: Create form management hooks
8. **Phase 4.1**: Verify reusable components
9. **Phase 4.2**: Create summary-specific components
10. **Phase 5.1**: Implement Order Summary page
11. **Phase 5.2**: Implement Quote Summary page
12. **Phase 6**: Integration and testing

---

## Files to Create

### Services

- `src/lib/api/services/AccountOwnerService/AccountOwnerService.ts`
- `src/lib/api/services/CurrencyService/CurrencyService.ts`
- `src/lib/api/services/SalesService/SalesService.ts`
- Update: `src/lib/api/services/DiscountService/DiscountService.ts`
- Update: `src/lib/api/services/PreferenceService/PreferenceService.ts`
- Update: `src/lib/api/services/OrdersService/OrdersService.ts`
- Update: `src/lib/api/services/QuoteSubmissionService/QuoteSubmissionService.ts`

### Hooks

- `src/hooks/summary/useSummaryDefault.ts`
- `src/hooks/summary/useSummaryForm.ts`
- `src/hooks/summary/useSummarySubmission.ts`
- `src/hooks/summary/useDefaultPreference.ts`
- `src/hooks/summary/useDefaultWarehouse.ts`
- `src/hooks/summary/useDefaultAccSupportOwner.ts`
- `src/hooks/summary/useTaxBreakup.ts`
- `src/hooks/summary/useMultipleDiscount.ts`
- `src/hooks/summary/useCheckVolumeDiscount.ts`
- `src/hooks/summary/useCurrencyFactor.ts`
- `src/hooks/summary/useGetDivision.ts`
- `src/hooks/summary/useGetChannel.ts`

### Utils

- `src/utils/summary/summaryReqDTO.ts`
- `src/utils/summary/validation.ts`

### Components

- `src/components/summary/SummaryProductsTable.tsx`
- `src/components/summary/SummaryAddressSection.tsx`
- `src/components/summary/SummaryTermsSection.tsx`
- `src/components/summary/SummaryAdditionalInfo.tsx`
- `src/components/summary/SummaryNameCard.tsx`
- `src/components/summary/SummaryActions.tsx`

### Pages

- Update: `src/app/[locale]/(app)/ordersummary/component/OrderSummaryContent.tsx`
- Update: `src/app/[locale]/(app)/quotesummary/components/QuoteSummaryContent.tsx`

## Files to Delete

- `src/app/[locale]/(app)/checkout/order-summary/page.tsx`
- `src/app/[locale]/(app)/checkout/quote-summary/page.tsx`

---

## Notes and Considerations

1. **API Endpoint Discovery**: Some backend endpoints may need to be discovered by checking backend codebase or API documentation
2. **Type Safety**: All services and hooks must have comprehensive TypeScript types
3. **Error Handling**: All API calls must have proper error handling
4. **Loading States**: All async operations must show appropriate loading states
5. **Mobile Responsive**: All components must be mobile responsive
6. **Business Logic**: All business logic must match buyer-fe exactly
7. **Testing**: Each phase should be tested before moving to the next

---

## Success Criteria

- [ ] All API routes mapped and services created/updated
- [ ] All hooks created and working
- [ ] All components created and integrated
- [ ] Order Summary page fully functional
- [ ] Quote Summary page fully functional
- [ ] All validations working
- [ ] All calculations match buyer-fe
- [ ] Mobile responsive
- [ ] Error handling comprehensive
- [ ] Integration testing passed
