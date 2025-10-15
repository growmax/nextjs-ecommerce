import { NextResponse } from "next/server";

export async function GET() {
  try {
    // GraphQL query to fetch theme data
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

    // Bearer token (hardcoded for now as requested)
    const bearerToken =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NfZ3JvdXBfaWQiOjIwOSwiYWNjb3VudFJvbGUiOiJzZWxsZXIiLCJjb21wYW55SWQiOjg2ODIsImNvbXBhbnlMb2dvIjoiaHR0cHM6Ly9zY2h3aW5nLWRldi1hcHAtYXNzZXRzLnMzLmFwLXNvdXRoLTEuYW1hem9uYXdzLmNvbS9zY2h3aW5nc3RldHRlci9hcHBfYXNzZXRzL2NvbXBhbnlfaW1hZ2VzLzg2ODIvbG9nby9TY2h3aW5nX1N0ZXR0ZXJfTG9nb18xNjQzNjk2MDA1MTA4LnBuZyIsImNvbXBhbnlOYW1lIjoiIFNjaHdpbmcgU3RldHRlciBEZW1vIiwiY3VycmVuY3kiOnsiY3VycmVuY3lDb2RlIjoiSU5SIiwiZGVjaW1hbCI6Ii4iLCJkZXNjcmlwdGlvbiI6IklORElBTiBSVVBFRSIsImlkIjo5NiwicHJlY2lzaW9uIjoyLCJzeW1ib2wiOiJJTlIg4oK5IiwidGVuYW50SWQiOjAsInRob3VzYW5kIjoiLCJ9LCJkYXRlRm9ybWF0IjoiTU1NIGRkLCB5eXl5IiwiZWxhc3RpY0NvZGUiOiJzY2h3aW5nc3RldHRlciIsInJvbGVJZCI6MjI4LCJyb2xlTmFtZSI6Ik93bmVyIiwicm91bmRPZmYiOiIyIiwiczNCdWNrZXROYW1lIjoiaHR0cHM6Ly9zMy5hcC1ub3J0aGVhc3QtMS5hbWF6b25hd3MuY29tL2dyb3dtYXgtZGV2LWFwcC1hc3NldHMiLCJ0YXhFeGVtcHRlZCI6ZmFsc2UsInRlbmFudElkIjoic2Nod2luZ3N0ZXR0ZXJkZW1vIiwidGltZUZvcm1hdCI6ImhoOm1tIGEiLCJ0aW1lWm9uZSI6IkFzaWEvS29sa2F0YSIsInVzZXJJZCI6MTAwNywidmVuZG9yQ29kZSI6bnVsbCwiZW1haWwiOiJhZG1pbkBhcHB0aW5vLmNvbSIsImVtYWlsVmVyaWZpZWQiOnRydWUsInN0YXR1cyI6IkZPUkNFX0NIQU5HRV9QQVNTV09SRCIsImRpc3BsYXlOYW1lIjoiQWRtaW5zIiwiaXNTZWxsZXIiOnRydWUsInBob25lTnVtYmVyIjoiK251bGwiLCJwaG9uZU51bWJlclZlcmlmaWVkIjpmYWxzZSwic2Vjb25kYXJ5RW1haWwiOiJhZG1pbkBhcHB0aW5vLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2dyb3dtYXgtZGV2LWFwcC1hc3NldHMuczMuYXAtbm9ydGhlYXN0LTEuYW1hem9uYXdzLmNvbS9zY2h3aW5nc3RldHRlcmRlbW8vYXBwX2Fzc2V0cy9jb21wYW55X2ltYWdlcy84NjgyL3Byb2ZpbGUvNjg2Y2JkMjhjOTI5MDU2ZjcyOTc1OTVjL2NhdF8xNzU0NTYwOTc3MTk1LmpwZWciLCJpZCI6IjY4NmNiZDI4YzkyOTA1NmY3Mjk3NTk1YyIsInN1YiI6IjY4NmNiZDI4YzkyOTA1NmY3Mjk3NTk1YyIsImlzcyI6InNjaHdpbmdzdGV0dGVyZGVtbyIsImF1ZCI6IjYxZjc4MWU2YWE4MWNjYjE0NGY1NmUyNSIsImFsbG93QXV0b1JlZ3NpdGVyIjpmYWxzZSwiaXNTbXNDb25maWd1cmVkIjp0cnVlLCJ0eXBlIjoiYWNjZXNzS2V5IiwiaWF0IjoxNzU4MTkxMTEzLCJleHAiOjE3NTgxOTQ3MTN9.V89PwgPEBVG04N59iLDmxeNEYoeThiMNG8RZ6VQcvvWc9UpL8D5l9jd7lMk_EtmNklQdu4aL1B3zqFJdsgfw-ay49aG5VM6NYq8fiGQGg20JbTPfUMLWoCjgNwv7R8UF9rq2alMsP_TRStN7n0yj0_tTxBdG46R4zUalRmostu7I_Wb0voSZWUxaho_PmLKGax4ahc4rstOv_oZ9uaORHYVJLM48-4xySFUP88IxSuh2AekHAYHyQ5R4i7xOdCGaZOCWyznzM7IHpAqawQPj19xKld7LnQ9mg3dYwnY7RSW2tT5qqSknwRenv-Kxafp-ScEtTiN8yxAxAIMPurlySA";

    const response = await fetch(
      "https://api.myapptino.com/storefront/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify(graphqlQuery),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch theme from GraphQL API: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const graphqlResponse = await response.json();

    // Check for GraphQL errors
    if (graphqlResponse.errors) {
      return NextResponse.json(
        { error: "GraphQL query failed", details: graphqlResponse.errors },
        { status: 400 }
      );
    }

    // Extract CSS from the response
    const data = graphqlResponse.data?.getAllByPropertyAndDomain;
    if (!data || !data.dataJson) {
      return NextResponse.json(
        { error: "No theme data found in response" },
        { status: 404 }
      );
    }

    // Parse dataJson if it's a string
    let parsedDataJson;
    try {
      parsedDataJson =
        typeof data.dataJson === "string"
          ? JSON.parse(data.dataJson)
          : data.dataJson;
    } catch {
      return NextResponse.json(
        { error: "Invalid dataJson format" },
        { status: 400 }
      );
    }

    const css = parsedDataJson?.css;
    if (!css) {
      return NextResponse.json(
        { error: "No CSS found in dataJson" },
        { status: 404 }
      );
    }

    // Return theme data with proper headers
    return NextResponse.json(
      {
        css,
        name: "storefront-theme",
        version: Date.now().toString(),
        source: "storefront-graphql",
        companyId: data.companyId,
        storeFrontProperty: data.storeFrontProperty,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
