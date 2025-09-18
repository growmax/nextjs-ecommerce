/**
 * Server-side theme fetcher for SSR
 * Fetches theme CSS directly from GraphQL API during server rendering
 */

export interface ServerThemeResponse {
  css: string;
  success: boolean;
  error?: string;
}

export class ServerThemeAPI {
  private static readonly GRAPHQL_URL =
    "https://api.myapptino.com/storefront/graphql";
  private static readonly BEARER_TOKEN =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NfZ3JvdXBfaWQiOjIwOSwiYWNjb3VudFJvbGUiOiJzZWxsZXIiLCJjb21wYW55SWQiOjg2ODIsImNvbXBhbnlMb2dvIjoiaHR0cHM6Ly9zY2h3aW5nLWRldi1hcHAtYXNzZXRzLnMzLmFwLXNvdXRoLTEuYW1hem9uYXdzLmNvbS9zY2h3aW5nc3RldHRlci9hcHBfYXNzZXRzL2NvbXBhbnlfaW1hZ2VzLzg2ODIvbG9nby9TY2h3aW5nX1N0ZXR0ZXJfTG9nb18xNjQzNjk2MDA1MTA4LnBuZyIsImNvbXBhbnlOYW1lIjoiIFNjaHdpbmcgU3RldHRlciBEZW1vIiwiY3VycmVuY3kiOnsiY3VycmVuY3lDb2RlIjoiSU5SIiwiZGVjaW1hbCI6Ii4iLCJkZXNjcmlwdGlvbiI6IklORElBTiBSVVBFRSIsImlkIjo5NiwicHJlY2lzaW9uIjoyLCJzeW1ib2wiOiJJTlIg4oK5IiwidGVuYW50SWQiOjAsInRob3VzYW5kIjoiLCJ9LCJkYXRlRm9ybWF0IjoiTU1NIGRkLCB5eXl5IiwiZWxhc3RpY0NvZGUiOiJzY2h3aW5nc3RldHRlciIsInJvbGVJZCI6MjI4LCJyb2xlTmFtZSI6Ik93bmVyIiwicm91bmRPZmYiOiIyIiwiczNCdWNrZXROYW1lIjoiaHR0cHM6Ly9zMy5hcC1ub3J0aGVhc3QtMS5hbWF6b25hd3MuY29tL2dyb3dtYXgtZGV2LWFwcC1hc3NldHMiLCJ0YXhFeGVtcHRlZCI6ZmFsc2UsInRlbmFudElkIjoic2Nod2luZ3N0ZXR0ZXJkZW1vIiwidGltZUZvcm1hdCI6ImhoOm1tIGEiLCJ0aW1lWm9uZSI6IkFzaWEvS29sa2F0YSIsInVzZXJJZCI6MTAwNywidmVuZG9yQ29kZSI6bnVsbCwiZW1haWwiOiJhZG1pbkBhcHB0aW5vLmNvbSIsImVtYWlsVmVyaWZpZWQiOnRydWUsInN0YXR1cyI6IkZPUkNFX0NIQU5HRV9QQVNTV09SRCIsImRpc3BsYXlOYW1lIjoiQWRtaW5zIiwiaXNTZWxsZXIiOnRydWUsInBob25lTnVtYmVyIjoiK251bGwiLCJwaG9uZU51bWJlclZlcmlmaWVkIjpmYWxzZSwic2Vjb25kYXJ5RW1haWwiOiJhZG1pbkBhcHB0aW5vLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2dyb3dtYXgtZGV2LWFwcC1hc3NldHMuczMuYXAtbm9ydGhlYXN0LTEuYW1hem9uYXdzLmNvbS9zY2h3aW5nc3RldHRlcmRlbW8vYXBwX2Fzc2V0cy9jb21wYW55X2ltYWdlcy84NjgyL3Byb2ZpbGUvNjg2Y2JkMjhjOTI5MDU2ZjcyOTc1OTVjL2NhdF8xNzU0NTYwOTc3MTk1LmpwZWciLCJpZCI6IjY4NmNiZDI4YzkyOTA1NmY3Mjk3NTk1YyIsInN1YiI6IjY4NmNiZDI4YzkyOTA1NmY3Mjk3NTk1YyIsImlzcyI6InNjaHdpbmdzdGV0dGVyZGVtbyIsImF1ZCI6IjYxZjc4MWU2YWE4MWNjYjE0NGY1NmUyNSIsImFsbG93QXV0b1JlZ3NpdGVyIjpmYWxzZSwiaXNTbXNDb25maWd1cmVkIjp0cnVlLCJ0eXBlIjoiYWNjZXNzS2V5IiwiaWF0IjoxNzU4MTk1MjcxLCJleHAiOjE3NTgxOTg4NzF9.fY89BUtW9rkCOosw-hx26JdYxis7ZAc9i5RH_a0CoyUjvzP55NKEOxF0c6EFFGZCjHKbvDzQRUdLD1p4XkpGLQ9TtGVZRWkuTZpROtV1KP3oCm4mD_1DYi2vrfDslbON_sxlD8k2Zl3E7w5_x4Pku3r50t7ii5WEvuSD5VrtRGUopAs2qf-c1VTDPEWB2-OIXI3-5hD85CcDdOAZFkaFg94CtAcHF2TS_DMJfPvWVGIsbAWuHB-MrOPA6OcBE46H_yENENFVdGMfSHRiIXfLC4kfktP1LFGNF4liLLOEcA3jbxuEHT8lGZE-TIhdOwr9dSqRD6mFKJyejTOlMgvi-w";

  /**
   * Fetch theme CSS directly from GraphQL API (server-side)
   */
  static async fetchThemeCSS(): Promise<ServerThemeResponse> {
    try {
      const graphqlQuery = {
        query: `{
          getAllByPropertyAndDomain(
            property: "test-tweakcn"
            domain: "schwingstetterdemo"
          ) {
            id
            companyId
            storeFrontProperty
            dataJson
          }
        }`,
        variables: {},
      };

      const response = await fetch(this.GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.BEARER_TOKEN}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify(graphqlQuery),
        // No cache for fresh data
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`GraphQL API failed: ${response.statusText}`);
      }

      const graphqlResponse = await response.json();

      // Check for GraphQL errors
      if (graphqlResponse.errors) {
        throw new Error(
          `GraphQL errors: ${JSON.stringify(graphqlResponse.errors)}`
        );
      }

      // Extract CSS from the response
      const data = graphqlResponse.data?.getAllByPropertyAndDomain;
      if (!data || !data.dataJson) {
        throw new Error("No theme data found in GraphQL response");
      }

      // Parse dataJson
      let parsedDataJson;
      try {
        parsedDataJson =
          typeof data.dataJson === "string"
            ? JSON.parse(data.dataJson)
            : data.dataJson;
      } catch (parseError) {
        throw new Error(`Failed to parse dataJson: ${parseError}`);
      }

      const css = parsedDataJson?.css;
      if (!css) {
        throw new Error("No CSS found in parsed dataJson");
      }

      return {
        css,
        success: true,
      };
    } catch (error) {
      return {
        css: "", // Return empty CSS as fallback
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get fallback CSS for when theme loading fails
   */
  static getFallbackCSS(): string {
    return `
      :root {
        --background: hsl(0 0% 100%);
        --foreground: hsl(0 0% 0%);
        --primary: hsl(221 83% 53%);
        --primary-foreground: hsl(0 0% 100%);
        --secondary: hsl(210 40% 96%);
        --secondary-foreground: hsl(222 84% 5%);
        --muted: hsl(210 40% 96%);
        --muted-foreground: hsl(215 16% 47%);
        --accent: hsl(210 40% 96%);
        --accent-foreground: hsl(222 84% 5%);
        --border: hsl(214 32% 91%);
        --input: hsl(214 32% 91%);
        --ring: hsl(221 83% 53%);
        --radius: 0.5rem;
      }
    `;
  }
}
