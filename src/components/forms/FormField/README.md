# FormField

Minimal wrapper used to render a label, optional required indicator, hint or error text, and arbitrary children (form controls).

Props

- label: string — label text shown above the field
- required?: boolean — when true, shows a small `*` next to the label
- error?: string — when present, shows an error message (hides hint)
- hint?: string — helper text shown when no error exists
- children: React.ReactNode — the control(s) to render inside the field
- className?: string — extra classes applied to the outer container
- labelClassName?: string — extra classes applied to the label element

Why this file exists

- Adds simple unit tests for the `FormField` component and provides small mock props used by tests.

Run the tests

Run the single unit test for this component (watch-friendly):

```bash
npm run test -- src/components/forms/FormField/FormField.test.tsx -i
```
