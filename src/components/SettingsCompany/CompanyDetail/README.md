CompanyDetail component

Files in this folder:

- `CompanyDetail.tsx` — The component that renders company profile form, image upload and lazy-loaded sub-industry dropdown.
- `CompanyDetail.test.tsx` — Jest + React Testing Library tests for this component (created alongside the component).
- `CompanyDetail.mocks.ts` — Shared mock data for tests.

How to run tests for this component

From the project root:

```bash
npm run test -- src/components/SettingsCompany/CompanyDetail/CompanyDetail.test.tsx -i
```

Notes

- The test file mocks UI primitives and API services to keep tests deterministic and fast.
- If you change the component's form structure or required fields, update the tests accordingly.
