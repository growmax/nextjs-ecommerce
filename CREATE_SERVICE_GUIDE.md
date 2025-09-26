# 🚀 How to Create a New Service

## Step 1: Create Your Service File

**Location**: `src/lib/api/services/YourService.ts`

```typescript
import { RequestContext, coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

// Define your data types
export interface YourDataType {
  id: string;
  name: string;
  // ... add your properties
}

export class YourService extends BaseService<YourService> {
  // Choose your client based on microservice:
  // authClient, catalogClient, coreCommerceClient, storefrontClient, homePageClient
  protected defaultClient = coreCommerceClient;

  // Create your API methods
  async getData(id: string): Promise<YourDataType> {
    return this.call(`/your-endpoint/${id}`, {}, "GET");
  }

  async createData(data: Partial<YourDataType>): Promise<YourDataType> {
    return this.call("/your-endpoint", data, "POST");
  }

  async updateData(
    id: string,
    data: Partial<YourDataType>
  ): Promise<YourDataType> {
    return this.call(`/your-endpoint/${id}`, data, "PUT");
  }

  async deleteData(id: string): Promise<void> {
    return this.call(`/your-endpoint/${id}`, {}, "DELETE");
  }
}

export default YourService.getInstance();
```

## Step 2: Add to API Exports

**File**: `src/lib/api/index.ts`

```typescript
// Add import
import YourService from "./services/YourService";

// Add to exports
export { YourService };

// Add type exports
export type { YourDataType } from "./services/YourService";
```

## Step 3: Use in Your Components

### Client-Side Usage (React Components)

```typescript
import { YourService } from "@/lib/api";

const MyComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await YourService.getData("123");
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  return <div>{data?.name}</div>;
};
```

### Server-Side Usage (Server Components, API Routes)

For server-side calls, use the "ServerSide" versions that handle errors gracefully:

```typescript
// Server Component
import { YourService } from "@/lib/api";

export default async function ServerComponent() {
  const data = await YourService.getDataServerSide("123"); // Returns null on error

  if (!data) {
    return <div>No data available</div>;
  }

  return <div>{data.name}</div>;
}

// API Route
export async function GET() {
  const data = await YourService.getDataServerSide("123");
  return Response.json(data);
}
```

---

## 🎯 Choose the Right Client

Different services use different clients for different microservices:

| Service Type          | Client               | Use For                            |
| --------------------- | -------------------- | ---------------------------------- |
| **AuthService**       | `authClient`         | Login, logout, user authentication |
| **CatalogService**    | `catalogClient`      | Products, categories, search       |
| **DashboardService**  | `coreCommerceClient` | Analytics, dashboard data, orders  |
| **StorefrontService** | `storefrontClient`   | GraphQL queries, storefront        |
| **PublicService**     | `homePageClient`     | Public content, announcements      |

---

## 📋 Method Reference

### Basic Methods (Use These)

- `this.call()` - Makes API call, throws error if fails
- `this.callSafe()` - Makes API call, returns null if fails (for server-side)

### HTTP Methods

```typescript
// GET request
this.call("/endpoint", {}, "GET");

// POST request
this.call("/endpoint", data, "POST");

// PUT request
this.call("/endpoint", data, "PUT");

// DELETE request
this.call("/endpoint", {}, "DELETE");
```

---

## 💡 Client vs Server Usage

### Client-Side (React Components)

- Use regular methods: `YourService.getData()`
- Handles errors with try/catch
- Good for user interactions

### Server-Side (Server Components, API Routes)

- Use "ServerSide" methods: `YourService.getDataServerSide()`
- Returns null on error instead of throwing
- Good for pre-rendering, SEO

---

## ✅ Complete Example

**Create UserService:**

```typescript
// src/lib/api/services/UserService.ts
import { RequestContext, authClient } from "../client";
import { BaseService } from "./BaseService";

export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserService extends BaseService<UserService> {
  protected defaultClient = authClient;

  async getCurrentUser(): Promise<User> {
    return this.call("/me", {}, "GET");
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.call("/profile", data, "PUT");
  }

  // Server-safe version
  async getCurrentUserServerSide(): Promise<User | null> {
    return this.callSafe("/me", {}, "GET");
  }
}

export default UserService.getInstance();
```

**Use in Component:**

```typescript
import { UserService } from "@/lib/api";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await UserService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, []);

  return <div>Welcome, {user?.name}!</div>;
};
```

**Use in Server Component:**

```typescript
import { UserService } from "@/lib/api";

export default async function ServerProfilePage() {
  const user = await UserService.getCurrentUserServerSide();

  if (!user) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

---

**That's it! Your service is ready to use.** 🎉
