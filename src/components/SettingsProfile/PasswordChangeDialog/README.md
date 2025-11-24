PasswordChangeDialog

What

- A small modal dialog used to change user password. It accepts an OTP, a new password and confirmation.

Files added for tests

- `PasswordChangeDialog.test.tsx` — unit tests for render, validation, submit behavior, loading state and cancel.
- `PasswordChangeDialog.mocks.ts` — default props used by tests.

How to run tests

Run the repository test runner (Jest):

```bash
npm test
```

Notes

- The tests mock small UI primitives and icons so they run quickly without loading the full UI runtime.
- If you change the dialog markup, update the tests accordingly.
