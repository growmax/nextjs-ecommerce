# API Service Development Guide

## Adding New API Services

### 1. Create Service File

**Location**: `src/lib/api/services/YourService.ts`

```typescript
import {
  coreCommerceClient,
  createClientWithContext,
  RequestContext,
} from "../client";

// Define types
export interface YourDataType {
  id: string;
  name: string;
  // ... other properties
}

export class YourService {
  private static instance: YourService;

  private constructor() {}

  public static getInstance(): YourService {
    if (!YourService.instance) {
      YourService.instance = new YourService();
    }
    return YourService.instance;
  }

  /**
   * Basic GET operation
   */
  async getData(id: string, context: RequestContext): Promise<YourDataType> {
    const client = createClientWithContext(coreCommerceClient, context);

    const response = await client.get(`/your-endpoint/${id}`);
    return response.data;
  }

  /**
   * Server-side version (handles errors gracefully)
   */
  async getDataServerSide(
    id: string,
    context: RequestContext
  ): Promise<YourDataType | null> {
    try {
      return await this.getData(id, context);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return null;
    }
  }

  /**
   * POST operation
   */
  async createData(
    data: Partial<YourDataType>,
    context: RequestContext
  ): Promise<YourDataType> {
    const client = createClientWithContext(coreCommerceClient, context);

    const response = await client.post("/your-endpoint", data);
    return response.data;
  }
}

export default YourService.getInstance();
```

### 2. Update Main Export File

**File**: `src/lib/api/index.ts`

```typescript
// Add import
import YourService from "./services/YourService";

// Add to exports
export { YourService };

// Add type exports
export type { YourDataType } from "./services/YourService";

// Add to API object
export const API = {
  // ... existing services
  Your: YourService,
} as const;
```

### 3. Usage Examples

#### Client-side Usage

```typescript
import { YourService } from "@/lib/api";

const data = await YourService.getData("123", {
  tenantCode: "tenant",
  accessToken: "token",
});
```

#### Server-side Usage

```typescript
import { YourService } from "@/lib/api";
import { getServerContext } from "@/lib/auth-server";

export async function getServerSideProps() {
  const context = await getServerContext();
  const data = await YourService.getDataServerSide("123", context);

  return { props: { data } };
}
```

## Client Selection Guide

Choose the appropriate client based on your API endpoint:

```typescript
// For authentication endpoints
import { authClient } from "../client";

// For core commerce operations (users, carts, orders)
import { coreCommerceClient } from "../client";

// For catalog/product data
import { catalogClient } from "../client";

// For storefront/GraphQL operations
import { storefrontClient } from "../client";

// For home page/public content
import { homePageClient } from "../client";

// Generic API calls
import { apiClient } from "../client";
```

## Server-Side API Calls

### For Anonymous/Public Endpoints

**Location**: `src/lib/api/services/PublicService.ts`

```typescript
import { authClient, homePageClient } from "../client";

export class PublicService {
  private static instance: PublicService;

  private constructor() {}

  public static getInstance(): PublicService {
    if (!PublicService.instance) {
      PublicService.instance = new PublicService();
    }
    return PublicService.instance;
  }

  /**
   * Get anonymous token - no context needed
   */
  async getAnonymousToken(origin: string): Promise<{ accessToken: string }> {
    const response = await authClient.get("/anonymous", {
      headers: { origin },
    });
    return response.data;
  }

  /**
   * Get public content - no auth required
   */
  async getPublicContent(): Promise<any> {
    const response = await homePageClient.get("/public-content");
    return response.data;
  }

  /**
   * Server-side public data fetch
   */
  async getPublicDataServerSide(): Promise<any> {
    try {
      return await this.getPublicContent();
    } catch (error) {
      console.error("Failed to fetch public data:", error);
      return null;
    }
  }
}

export default PublicService.getInstance();
```

### Server-Side Context Creation

**Helper function** for server-side operations:

```typescript
// src/lib/server-context.ts
import { cookies } from "next/headers";
import { RequestContext } from "@/lib/api";

export async function getServerContext(): Promise<RequestContext> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Extract tenant from token if available
  let tenantCode: string | undefined;
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      tenantCode = payload.iss;
    } catch (error) {
      console.error("Failed to parse token:", error);
    }
  }

  return {
    accessToken,
    tenantCode,
  };
}
```

### Usage in Server Components

```typescript
// app/page.tsx (Server Component)
import { YourService } from '@/lib/api';
import { getServerContext } from '@/lib/server-context';

export default async function Page() {
  const context = await getServerContext();
  const data = await YourService.getDataServerSide('123', context);

  return <div>{data?.name || 'No data'}</div>;
}
```

### Usage in API Routes

```typescript
// app/api/your-endpoint/route.ts
import { YourService } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const context = {
    accessToken: request.headers.get("authorization")?.replace("Bearer ", ""),
    tenantCode: request.headers.get("x-tenant"),
  };

  const data = await YourService.getDataServerSide("123", context);

  return Response.json(data);
}
```

## Key Patterns

1. **Singleton Pattern**: Always use `getInstance()` for services
2. **RequestContext**: Always pass context for authenticated calls
3. **Error Handling**: Provide `ServerSide` methods that handle errors gracefully
4. **Type Safety**: Export all TypeScript interfaces
5. **Client Selection**: Use appropriate pre-configured client
6. **Server vs Client**: Different approaches for server-side vs client-side calls

## Automatic Features

- ✅ **Token Injection**: Automatic from cookies
- ✅ **Tenant Headers**: Auto-extracted from JWT
- ✅ **Error Handling**: Centralized in interceptors
- ✅ **Request Logging**: Development mode logging
- ✅ **Token Refresh**: Automatic on 401 errors
