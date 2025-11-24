# ComanyPageClient (Company Settings Page)

Simple client component that composes `HeaderBar`, `CompanyDetail` and `CompanyBranchTable`.

Files

- `ComanyPageClient.tsx` - main page component
- `ComanyPageClient.test.tsx` - unit tests (mocks child components)
- `ComanyPageClient.mocks.ts` - minimal sample data for tests

How to run tests

- Run the project's test runner (Jest):

  npm test

Notes

- Tests mock all child components to avoid external dependencies and focus on composition and rendering.
