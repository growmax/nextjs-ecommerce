AutoCompleteField component

Files in this folder:

- `AutoCompleteField.tsx` — The component used for a searchable/selectable dropdown using a Popover + Command pattern.
- `AutoCompleteField.test.tsx` — Unit tests for the component (mocks UI primitives).
- `AutoCompleteField.mocks.ts` — Sample option data used by tests.

How to run tests for this component

From the project root:

```bash
npm run test -- src/components/forms/AutoCompleteField/AutoCompleteField.test.tsx -i
```

Notes

- The test suite mocks visual primitives (Popover/Command) to avoid depending on Radix UI implementation details and focuses on behavior: placeholder, selected label, and option selection calling `onChange`.
