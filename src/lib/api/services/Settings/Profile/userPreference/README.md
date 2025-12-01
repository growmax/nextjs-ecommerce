# UserPreferenceApiService

Small unit tests for the `UserPreferenceApiService` that validate the wrapper methods call the BaseService helpers with the expected endpoint and options.

Files

- `userPreferenceApiService.ts` — the service implementation (exports default singleton)
- `userPreferenceApiService.test.ts` — unit tests that spy on the BaseService `call` and `callWithSafe` methods
- `userPreferenceApiService.mocks.ts` — sample payload used in tests

## Run the tests

```bash
npm run test -- src/lib/api/services/Settings/Profile/userPreference/userPreferenceApiService.test.ts -i
```

## Notes

- The tests spy on the protected `call` / `callWithSafe` methods on the service prototype to avoid making real network calls and to assert the right parameters were passed.
