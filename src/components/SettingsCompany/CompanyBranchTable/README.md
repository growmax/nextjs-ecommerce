# CompanyBranchTable

## Purpose

`CompanyBranchTable` renders the list of company branches with server-driven pagination, search, and row actions (edit/delete). It uses the shared `DataTable` component and opens `AddressDialogBox` to add or edit branches.

## What the tests cover

- Renders branch rows when the service returns data.
- Opens the create dialog when the "Add Branch" button is clicked.
- Opens the edit dialog when a row is clicked.
- Calls the delete API when the delete action is invoked.

## Mocks used in unit tests

- `CompanyBranchTable.test.tsx` mocks:
  - `@/lib/api/services/CompanyService` to simulate get/delete API calls.
  - `@/components/Global/DataTable` to render a simplified table and expose `renderRowActions` and `onRowClick` behaviour.
  - `../DialogBox/AddressDialogBox` is mocked so tests can inspect the props passed to the dialog.

## Run the tests

Run the single unit test for this component (watch-friendly):

```bash
npm run test -- src/components/SettingsCompany/CompanyBranchTable/CompanyBranchTable.test.tsx -i
```

## Notes

- The unit tests intentionally mock UI primitives and the data table to keep tests fast and deterministic. Integration tests (msw + realistic UI primitives) are valuable for validating end-to-end behaviour (create/update flows) and can be added later.
