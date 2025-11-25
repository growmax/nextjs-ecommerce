/**
 * Shared authentication types (type-only module)
 * Safe to import from client code with `import type { ServerUser }` syntax
 */

export interface ServerUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role?: string;
  companyName?: string;
  companyId?: number;
  picture?: string;
}

export interface ServerAuthResult {
  isAuthenticated: boolean;
  user: ServerUser | null;
  accessToken: string | null;
  hasAnonymousToken: boolean;
  tokenType: "access" | "anonymous" | "none";
}
