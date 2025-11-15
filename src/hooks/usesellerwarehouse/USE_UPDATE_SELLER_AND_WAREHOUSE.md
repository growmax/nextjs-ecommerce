# useUpdateSellerAndWarehouse

Lightweight documentation for the `useUpdateSellerAndWarehouse` hook.

## Purpose

This hook centralizes logic for updating seller branch and warehouse information when a billing address (buyer branch) changes in an order details form. It is intended to be used within components that manage a react-hook-form form for order details.

## Signature

export function useUpdateSellerAndWarehouse(
setValue: UseFormSetValue<OrderDetailsFormValues>,
watch: UseFormWatch<OrderDetailsFormValues>
): {
handleBillingAddressChange: (newValue: BillingAddressValue) => Promise<void>;
updateSellerAndWarehouse: (billingAddressValue: BillingAddressValue) => Promise<{ sellerBranch?: any; warehouse?: any } | undefined>;
}

## Inputs

- `setValue` — react-hook-form `setValue` function used to update form fields.
- `watch` — react-hook-form `watch` function used to read current form values (the hook reads `orderDetails.0.dbProductDetails`).

The hook also consumes `useCurrentUser` internally to obtain `user.userId` and `user.companyId`. These values are required for service calls; if not available the hook will log an error and return early.

## Behavior / Side-effects

- `handleBillingAddressChange(newValue)`
  - Updates the form values for billing address and buyer branch (`billingAddressDetails`, `buyerBranchId`, `buyerBranchName`, `vendorID`).
  - Calls `updateSellerAndWarehouse` to lookup seller branch and warehouse, then updates seller and product details fields (e.g., `sellerBranchId`, `sellerBranchName`, `sellerCompanyId`, and `dbProductDetails` with the found `warehouse`).

- `updateSellerAndWarehouse(billingAddressValue)`
  - Reads product IDs via `watch("orderDetails.0.dbProductDetails")` and calls `SellerWarehouseService.getSellerBranchAndWarehouse(userId, companyId, request)`.
  - Returns an object with `sellerBranch` and `warehouse` (or `undefined` if the call failed).

## Example usage

```tsx
function OrderEditForm() {
  const { register, setValue, watch } = useForm<OrderDetailsFormValues>();
  const { handleBillingAddressChange } = useUpdateSellerAndWarehouse(
    setValue,
    watch
  );

  return (
    <BillingAddressPicker onChange={val => handleBillingAddressChange(val)} />
  );
}
```

## Edge cases & notes

- If `useCurrentUser()` doesn't provide `userId` or `companyId` the hook will abort and log an error.
- The hook assumes `orderDetails.0.dbProductDetails` is an array of objects that will receive a `wareHouse` field when a warehouse is found; it writes the full `warehouse` object to each product.
- Unit tests should mock `SellerWarehouseService.getSellerBranchAndWarehouse` and `useCurrentUser`.

## Tests

- A test file `src/hooks/useUpdateSellerAndWarehouse.test.tsx` is included that:
  - Mocks `useCurrentUser` to provide a test user.
  - Mocks `SellerWarehouseService.getSellerBranchAndWarehouse` to return controlled responses.
  - Renders a tiny test component that calls the hook and exercises `handleBillingAddressChange` and `updateSellerAndWarehouse`, asserting `setValue` calls and returned values.
