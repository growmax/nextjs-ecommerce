import UserPreferenceApiService, {
  UserPreferenceApiService as ServiceClass,
  UserPreferenceProfile,
} from "./userPreferenceApiService";
import { samplePreference } from "./userPreferenceApiService.mocks.js";

describe("UserPreferenceApiService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("savePreference calls call and returns response", async () => {
    const spy = jest.spyOn(ServiceClass.prototype as any, "call");
    spy.mockResolvedValue(samplePreference);

    const result = await UserPreferenceApiService.savePreference(
      samplePreference as UserPreferenceProfile
    );

    expect(spy).toHaveBeenCalledWith(
      "/userpreference",
      samplePreference,
      "POST"
    );
    expect(result).toEqual(samplePreference);
  });

  test("savePreferenceServerSide calls callWithSafe and returns response when successful", async () => {
    const spy = jest.spyOn(ServiceClass.prototype as any, "callWithSafe");
    spy.mockResolvedValue(samplePreference);

    const result = await UserPreferenceApiService.savePreferenceServerSide(
      samplePreference as UserPreferenceProfile
    );

    expect(spy).toHaveBeenCalledWith("/userpreference", samplePreference, {
      method: "POST",
    });
    expect(result).toEqual(samplePreference);
  });

  test("savePreferenceServerSide returns null when callWithSafe fails", async () => {
    const spy = jest.spyOn(ServiceClass.prototype as any, "callWithSafe");
    spy.mockResolvedValue(null);

    const result = await UserPreferenceApiService.savePreferenceServerSide(
      samplePreference as UserPreferenceProfile
    );

    expect(spy).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
