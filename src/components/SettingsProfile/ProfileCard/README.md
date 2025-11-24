ProfileCard

What

- Displays user's basic profile information with image upload, phone inputs and read-only email.

Files added for tests

- `ProfileCard.test.tsx` — unit tests for skeleton loading state, rendering fields and basic interactions.
- `ProfileCard.mocks.ts` — sample profile and defaultProps used by tests.

How to run tests

```bash
npm test
```

Notes

- Tests mock `ImageUpload` and `PhoneInput` to avoid pulling in full UI implementations.
- If you change the internals of `ProfileCard`, update the tests accordingly.
