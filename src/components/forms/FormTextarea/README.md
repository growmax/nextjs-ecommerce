# FormTextarea

Small wrapper component that integrates `Textarea` with the project's form primitives (react-hook-form based FormField).

Props (summary)

- control: react-hook-form Control
- name: string
- label: string | React.ReactNode
- placeholder: string
- disabled?: boolean
- loading?: boolean
- required?: boolean

Tests

- `FormTextarea.test.tsx` includes unit tests that mock the form primitives, `Textarea` and `Skeleton` so tests remain fast and deterministic.

## Run the tests

```bash
npm run test -- src/components/forms/FormTextarea/FormTextarea.test.tsx -i
```
