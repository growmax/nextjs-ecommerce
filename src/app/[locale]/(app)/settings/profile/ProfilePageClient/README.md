# ProfilePageClient

Small client component that composes profile editing UI: header, profile card, preferences card,
and dialogs for OTP / password change. It uses the `useProfileData` hook to load and save data.

Files

- `ProfilePageClient.tsx` - main client component (composed UI)
- `ProfilePageClient.test.tsx` - unit tests for the component
- `ProfilePageClient.mocks.ts` - test mocks and sample data

How it works

- The component reads state and actions from `useProfileData`.
- It tracks local change state to show a `SaveCancelToolbar` when edits occur.
- It provides handlers for saving profile and preferences and for showing OTP/password dialogs.

Testing

- Tests live next to the component and use jest + @testing-library/react.
- Run the project's tests with:

  npm test

Notes

- Tests in this repository mock many UI primitives and hooks; follow the same pattern when adding tests.
