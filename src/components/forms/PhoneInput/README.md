# PhoneInput

Small form control that wraps an `Input` and provides phone-specific validation and a `Verify` flow.

Props (summary)

- `label`: string
- `value`: string
- `onChange`: (value: string) => void
- `onVerify?`: (phone: string) => void
- `verified?`: boolean
- `required?`, `placeholder?`, `disabled?`, `maxLength?`, `countryCode?`, `originalValue?`

Tests

- `PhoneInput.test.tsx` contains unit tests that mock the form primitives and validation hook to keep tests deterministic.

Run the test

```
npm run test -- src/components/forms/PhoneInput/PhoneInput.test.tsx -i
```
