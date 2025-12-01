UserPreferencesCard

What

- Displays user preferences (time zone, date format, time format) with a preview block.

Files added for tests

- `UserPreferencesCard.test.tsx` — tests for skeleton mode, field rendering and interactions, and disabled state.
- `UserPreferencesCard.mocks.ts` — sample preferences and option lists.

How to run tests

```bash
npm test -- src/components/SettingsProfile/UserPreferencesCard
```

Notes

- Tests mock `AutoCompleteField`, `SectionCard`, and `Skeleton` to keep unit tests focused and fast.
