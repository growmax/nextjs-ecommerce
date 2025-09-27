"use client";

import { UserPreferenceService } from "@/lib/api";
import { useState } from "react";

import type { PreferenceApiResponse } from "@/lib/api";

export function UserPreferenceTest() {
  const [preferences, setPreferences] = useState<PreferenceApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testPreferences = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create test parameters matching your curl request
      const params = {
        userId: 1032,
        module: "quote",
        tenantCode: "schwingstetterdemo",
      };

      // Create test filter matching your curl request
      const filters = UserPreferenceService.createDateRangeFilter(
        "2025-01-01T00:00:00.000Z",
        "2025-12-31T23:59:59.999Z"
      );

      // eslint-disable-next-line no-console
      console.log("🔍 Testing UserPreference service...");
      // eslint-disable-next-line no-console
      console.log("Params:", params);
      // eslint-disable-next-line no-console
      console.log("Filters:", filters);

      const result = await UserPreferenceService.getPreferences(
        params,
        filters
      );

      // eslint-disable-next-line no-console
      console.log("✅ UserPreference service response:", result);
      setPreferences(result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("❌ UserPreference service error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        UserPreference Service Test
      </h3>

      <button
        onClick={testPreferences}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test UserPreference Service"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {preferences && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
          <strong>Success!</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(preferences, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Endpoint:</strong> /userpreference/preferences/find
        </p>
        <p>
          <strong>Method:</strong> POST
        </p>
        <p>
          <strong>Headers:</strong> Authorization, x-tenant, Content-Type
        </p>
        <p>
          <strong>Based on curl:</strong>{" "}
          https://api.myapptino.com/userpreference/preferences/find?userId=1032&module=quote&tenantCode=schwingstetterdemo
        </p>
      </div>
    </div>
  );
}
