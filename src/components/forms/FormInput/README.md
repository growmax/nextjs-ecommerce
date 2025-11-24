# FormInput

Small wrapper around the project's form primitives that renders a label, an input (or skeleton when loading) and supports disabled/required states.

Props (summary)

- control: react-hook-form Control (the UI form primitives call render with the provided field)
- name: string
- label: string | React.ReactNode
- placeholder: string
- disabled?: boolean
- loading?: boolean
- required?: boolean

Mocks & tests

- `FormInput.mocks.ts` — sample props used by tests
- `FormInput.test.tsx` — unit tests that mock `@/components/ui/form`, `@/components/ui/input` and `@/components/ui/skeleton` to keep tests fast and deterministic.

Run the tests for this component:

```bash
npm run test -- src/components/forms/FormInput/FormInput.test.tsx -i
```
