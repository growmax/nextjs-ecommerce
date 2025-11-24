ProfileMenu

What

- The dropdown content shown under the profile button. Shows user info and navigation items (Home, Dashboard, Sales, Settings, Logout).

Files added for tests

- `ProfileMenu.test.tsx` — unit tests verifying rendering of user info, navigation calls, and logout behavior.
- `ProfileMenu.mocks.ts` — sample user profile used in tests.

How to run tests

```bash
npm test -- src/components/SettingsProfile/ProfileMenu
```

Notes

- Tests mock UI primitives and hooks (`useLogout`, `useUserProfile`) for isolation.
- The tests assert that the correct router pushes happen and that logout is invoked.
