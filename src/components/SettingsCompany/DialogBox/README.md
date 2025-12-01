AddressDialogBox component

Files in this folder:

- `AddressDialogBox.tsx` — Dialog component used to create/update company branch addresses. Uses react-hook-form with zod validation and external services (CompanyService, LocationService, AuthStorage, JWTService).
- `AddressDialogBox.test.tsx` — Jest + React Testing Library tests for this component (created alongside the component).
- `AddressDialogBox.mocks.ts` — Shared mock data for tests.

How to run tests for this component

From the project root:

```bash
npm run test -- src/components/SettingsCompany/DialogBox/AddressDialogBox.test.tsx
```

Notes

- The test file mocks UI primitives (dialog, form inputs) and API services to keep tests deterministic and fast.
- If you change the component's required form fields (zod schema), update the tests accordingly to provide the necessary values.
