ProfileButton

What

- A small client-only dropdown trigger used in the profile/settings area. It renders a user icon button and shows a `ProfileMenu` inside a dropdown.

Files added for tests

- `ProfileButton.test.tsx` — unit tests that verify the trigger renders and the dropdown content appears when clicked.
- `ProfileButton.mocks.ts` — placeholder exports for tests.

How to run tests

```bash
npm test
```

Notes

- Tests mock `next/dynamic` so the client-only dynamic import resolves synchronously in the test environment.
- If you change the dropdown implementation, update the test mocks accordingly.
